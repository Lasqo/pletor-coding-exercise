from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, func, select
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import asyncio
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    user = Column(String, nullable=False)
    url = Column(String, nullable=False)

class UploadAttempt(Base):
    __tablename__ = "upload_attempts"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    image_id = Column(Integer, nullable=True)  
    title = Column(String, nullable=False)    
    user = Column(String, nullable=False, index=True)

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

class QuotaInfo(BaseModel):
    quota_limit: int
    remaining: int
    reset_time: datetime
    uploads_today: int  
    user: str

class GlobalQuotaInfo(BaseModel):
    global_limit: int
    remaining: int
    total_uploads_today: int 

async def get_db():
    async with SessionLocal() as db:
        yield db

app = FastAPI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for quota limits
USER_DAILY_QUOTA = 5
GLOBAL_DAILY_QUOTA = 100

def get_today_start():
    now = datetime.utcnow()
    return datetime(now.year, now.month, now.day, 0, 0, 0)

def get_tomorrow_start():
    return get_today_start() + timedelta(days=1)

async def get_user_quota_info(user: str, db: AsyncSession) -> QuotaInfo:
    today_start = get_today_start()
    
    result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.user == user)
        .where(UploadAttempt.created_at >= today_start)
    )
    uploads_today = result.scalar() or 0
    
    return QuotaInfo(
        user=user,
        uploads_today=uploads_today,
        quota_limit=USER_DAILY_QUOTA,
        remaining=max(0, USER_DAILY_QUOTA - uploads_today),
        reset_time=get_tomorrow_start()
    )

async def get_global_quota_info(db: AsyncSession) -> GlobalQuotaInfo:
    today_start = get_today_start()
    
    result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.created_at >= today_start)
    )
    total_today = result.scalar() or 0
    
    return GlobalQuotaInfo(
        total_uploads_today=total_today,
        global_limit=GLOBAL_DAILY_QUOTA,
        remaining=max(0, GLOBAL_DAILY_QUOTA - total_today)
    )

async def check_quota(user: str, db: AsyncSession) -> tuple[bool, str]:
    today_start = get_today_start()
    
    # Check user quota
    user_result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.user == user)
        .where(UploadAttempt.created_at >= today_start)
    )
    user_count = user_result.scalar() or 0
    
    if user_count >= USER_DAILY_QUOTA:
        return False, f"User quota exceeded. You can only upload {USER_DAILY_QUOTA} images per day."
    
    # Check global quota
    global_result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.created_at >= today_start)
    )
    global_count = global_result.scalar() or 0
    
    if global_count >= GLOBAL_DAILY_QUOTA:
        return False, f"Global quota exceeded. Maximum {GLOBAL_DAILY_QUOTA} images per day across all users."
    
    return True, ""

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Insert fake data if table is empty
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

@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}

@app.post("/images/", response_model=ImageRead)
async def create_image(image: ImageCreate, db: AsyncSession = Depends(get_db)):
    # Check quota before creating image
    can_upload, error_message = await check_quota(image.user, db)
    
    if not can_upload:
        raise HTTPException(status_code=429, detail=error_message)

    try:
        # Create the image
        db_image = Image(**image.dict())
        db.add(db_image)
        await db.flush() 
        upload_attempt = UploadAttempt(
            user=image.user,
            title=image.title,
            image_id=db_image.id
        )
        db.add(upload_attempt)
        
        await db.commit()
        await db.refresh(db_image)
        
        # Upload succeeded - attempt has been recorded
        return db_image
        
    except Exception as e:
        # If anything fails, rollback the transaction
        # This ensures the upload_attempt is NOT recorded
        await db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create image: {str(e)}"
        )

@app.get("/images/", response_model=List[ImageRead])
async def list_images(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    return images

@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@app.delete("/images/{image_id}", status_code=204)
async def delete_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
    return None

@app.get("/quota/{user}", response_model=QuotaInfo)
async def get_quota(user: str, db: AsyncSession = Depends(get_db)):
    return await get_user_quota_info(user, db)

@app.get("/quota/global/info", response_model=GlobalQuotaInfo)
async def get_global_quota(db: AsyncSession = Depends(get_db)):
    return await get_global_quota_info(db)
