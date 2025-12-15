from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, func, select
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import time
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from redis_client import get_redis_client, close_redis_client, LUA_UPLOAD_SCRIPT

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    title = Column(String, nullable=False)
    user = Column(String, nullable=False)
    url = Column(String, nullable=False)

class ImageCreate(BaseModel):
    title: str
    user: str
    url: str

class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: str
    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as db:
        result = await db.execute(select(Image))
        images = result.scalars().all()
        if not images:
            fake_images = [
                Image(title="Sunset Beach", user="alice", url="https://images.unsplash.com/photo-1506744038136-46273834b3fb"),
                Image(title="Mountain View", user="bob", url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca"),
                Image(title="City Lights", user="carol", url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99"),
            ]
            db.add_all(fake_images)
            await db.commit()
    
    await get_redis_client()

@app.on_event("shutdown")
async def on_shutdown():
    await close_redis_client()

def get_user_from_header(x_user_email: Optional[str] = Header(None)):
    if not x_user_email:
        raise HTTPException(status_code=401, detail="User email required")
    return x_user_email

@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}

@app.post("/images/", response_model=ImageRead)
async def create_image(
    image: ImageCreate, 
    db: AsyncSession = Depends(get_db),
    redis_conn: redis.Redis = Depends(get_redis_client),
    current_user: str = Depends(get_user_from_header)
):
    user_id = current_user
    USER_KEY = f"quota:user:{user_id}:rolling"
    GLOBAL_KEY = "quota:global:rolling"
    MAX_USER = 5
    MAX_GLOBAL = 100
    current_time_ms = int(time.time() * 1000)
    
    try:
        result = await redis_conn.eval(
            LUA_UPLOAD_SCRIPT,
            2,
            USER_KEY,
            GLOBAL_KEY,
            MAX_USER,
            MAX_GLOBAL,
            current_time_ms
        )
    except Exception as e:
        print(f"Redis/Lua error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Quota service unavailable"
        ) from e
    
    if result != "OK":
        if "user" in str(result).lower():
            raise HTTPException(
                status_code=429,
                detail=f"Daily limit of {MAX_USER} images reached for user {user_id}"
            )
        elif "global" in str(result).lower():
            raise HTTPException(
                status_code=429,
                detail=f"Global service limit of {MAX_GLOBAL} images reached for today"
            )
        else:
            raise HTTPException(
                status_code=429,
                detail="Quota limit reached"
            )
    
    db_image = Image(**image.dict())
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image

@app.get("/quota/{user_id}", response_model=Dict[str, Any])
async def get_quota_status(
    user_id: str,
    redis_conn: redis.Redis = Depends(get_redis_client),
    current_user: str = Depends(get_user_from_header)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied: can only view your own quota")
    USER_KEY = f"quota:user:{user_id}:rolling"
    GLOBAL_KEY = "quota:global:rolling"
    MAX_USER = 5
    MAX_GLOBAL = 100
    WINDOW_MS = 24 * 60 * 60 * 1000
    current_time_ms = int(time.time() * 1000)
    cutoff_time_ms = current_time_ms - WINDOW_MS
    
    try:
        await redis_conn.zremrangebyscore(USER_KEY, 0, cutoff_time_ms)
        user_count = await redis_conn.zcard(USER_KEY)
        
        await redis_conn.zremrangebyscore(GLOBAL_KEY, 0, cutoff_time_ms)
        global_count = await redis_conn.zcard(GLOBAL_KEY)
        
        return {
            "user_id": user_id,
            "user_quota": {
                "used": user_count,
                "limit": MAX_USER,
                "remaining": max(0, MAX_USER - user_count)
            },
            "global_quota": {
                "used": global_count,
                "limit": MAX_GLOBAL,
                "remaining": max(0, MAX_GLOBAL - global_count)
            },
            "window": "24 hours (rolling)",
            "current_time": datetime.fromtimestamp(current_time_ms / 1000).isoformat()
        }
    except Exception as e:
        print(f"Redis error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Quota service unavailable"
        ) from e

@app.get("/images/", response_model=List[ImageRead])
async def list_images(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_user_from_header)
):
    result = await db.execute(select(Image).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    return images

@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_user_from_header)
):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@app.delete("/images/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_user_from_header)
):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if image.user != current_user:
        raise HTTPException(status_code=403, detail="Access denied: can only delete your own images")
    
    await db.delete(image)
    await db.commit()
    return None
git ad