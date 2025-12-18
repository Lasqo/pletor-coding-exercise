from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, func, select
from pydantic import BaseModel
from typing import List
from datetime import datetime
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
    created_by = Column(String, nullable=False)
    users_access = Column(String, nullable=False)
    url = Column(String, nullable=False)

class ImageCreate(BaseModel):
    title: str
    created_by: str
    users_access: str
    url: str

class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    created_by: str
    url: str
    users_access: str
    class Config:
        orm_mode = True

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

app = FastAPI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
                Image(title="Sunset Beach", created_by="me", users_access="alice", url="https://images.unsplash.com/photo-1506744038136-46273834b3fb"),
                Image(title="Mountain View", created_by="bob", users_access="bob", url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca"),
                Image(title="City Lights", created_by="carol", users_access="carol", url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99"),
                Image(title="City Lights", created_by="everybody", users_access="everybody", url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99"),
            ]
            db.add_all(fake_images)
            await db.commit()

@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}

@app.post("/images/", response_model=ImageRead)
async def create_image(image: ImageCreate, db: AsyncSession = Depends(get_db)):
    db_image = Image(
        title=image.title,
        created_by=image.created_by,
        users_access=image.users_access,
        url=image.url
    )
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image

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
