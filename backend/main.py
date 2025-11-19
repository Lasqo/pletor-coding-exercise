from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Date, func, select
from pydantic import BaseModel
from typing import List
from datetime import datetime, date
import asyncio
from fastapi.middleware.cors import CORSMiddleware

USER_DAILY_UPLOAD_LIMIT = 5
GLOBAL_DAILY_UPLOAD_LIMIT = 100
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


class UserQuota(Base):
    __tablename__ = "user_quotas"
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    count = Column(Integer, default=0)


class GlobalDailyStats(Base):
    __tablename__ = "global_daily_stats"
    date = Column(Date, primary_key=True, nullable=False)
    total_count = Column(Integer, default=0)


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


class QuotaResponse(BaseModel):
    user: str
    usage: int
    limit: int


class GlobalStatsResponse(BaseModel):
    date: date
    total_count: int
    limit: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],  # or ["*"] for all origins (not recommended for production)
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
                Image(
                    title="Sunset Beach",
                    user="alice",
                    url="https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                ),
                Image(
                    title="Mountain View",
                    user="bob",
                    url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
                ),
                Image(
                    title="City Lights",
                    user="carol",
                    url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99",
                ),
            ]
            db.add_all(fake_images)
            await db.commit()


@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}


@app.get("/quota/{user}", response_model=QuotaResponse)
async def get_quota(user: str, db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()
    result = await db.execute(
        select(UserQuota).where(UserQuota.user == user, UserQuota.date == today)
    )
    quota = result.scalar_one_or_none()
    usage = quota.count if quota else 0
    return {"user": user, "usage": usage, "limit": USER_DAILY_UPLOAD_LIMIT}


@app.get("/global-stats/", response_model=GlobalStatsResponse)
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()
    result = await db.execute(
        select(GlobalDailyStats).where(GlobalDailyStats.date == today)
    )
    stats = result.scalar_one_or_none()
    total_count = stats.total_count if stats else 0
    return {"date": today, "total_count": total_count, "limit": GLOBAL_DAILY_UPLOAD_LIMIT}


@app.post("/images/", response_model=ImageRead)
async def create_image(image: ImageCreate, db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()

    result_global = await db.execute(
        select(GlobalDailyStats)
        .where(GlobalDailyStats.date == today)
        .with_for_update()
    )
    global_stats = result_global.scalar_one_or_none()

    if global_stats:
        if global_stats.total_count >= GLOBAL_DAILY_UPLOAD_LIMIT:
            raise HTTPException(status_code=429, detail="Global daily upload limit exceeded")
        global_stats.total_count += 1
    else:
        try:
            global_stats = GlobalDailyStats(date=today, total_count=1)
            db.add(global_stats)
            await db.flush()
        except Exception:
            await db.rollback()
            result_global = await db.execute(
                select(GlobalDailyStats).where(GlobalDailyStats.date == today).with_for_update()
            )
            global_stats = result_global.scalar_one_or_none()
            if global_stats:
                if global_stats.total_count >= GLOBAL_DAILY_UPLOAD_LIMIT:
                    raise HTTPException(status_code=429, detail="Global daily upload limit exceeded")
                global_stats.total_count += 1
            else:
                 raise HTTPException(status_code=500, detail="Failed to initialize global stats")

    result = await db.execute(
        select(UserQuota).where(UserQuota.user == image.user, UserQuota.date == today)
    )
    quota = result.scalar_one_or_none()

    if quota:
        if quota.count >= USER_DAILY_UPLOAD_LIMIT:
            raise HTTPException(status_code=429, detail="Daily upload limit of 5 exceeded")
        quota.count += 1
    else:
        quota = UserQuota(user=image.user, date=today, count=1)
        db.add(quota)

    db_image = Image(**image.dict())
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image


@app.get("/quotas/", response_model=List[QuotaResponse])
async def list_quotas(db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()
    
    result_users = await db.execute(select(Image.user).distinct())
    users = result_users.scalars().all()
    
    result_quotas = await db.execute(select(UserQuota).where(UserQuota.date == today))
    quotas_map = {q.user: q.count for q in result_quotas.scalars().all()}
    
    response = []
    for user in users:
        usage = quotas_map.get(user, 0)
        response.append({"user": user, "usage": usage, "limit": USER_DAILY_UPLOAD_LIMIT})
        
    return response


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
