from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from datetime import date, datetime, timezone

from domain.models import GlobalDailyStats, UserQuota, Image, User
from domain.schemas import ImageCreate
from core.config import GLOBAL_DAILY_UPLOAD_LIMIT, USER_DAILY_UPLOAD_LIMIT

async def check_global_stats(db: AsyncSession, today: date) -> bool:
    result = await db.execute(
        select(GlobalDailyStats).where(GlobalDailyStats.date == today)
    )
    global_stats = result.scalar_one_or_none()

    if global_stats:
        if global_stats.total_count >= GLOBAL_DAILY_UPLOAD_LIMIT:
            return False
        global_stats.total_count += 1
    else:
        global_stats = GlobalDailyStats(date=today, total_count=1)
        db.add(global_stats)
    return True

async def check_user_quota(db: AsyncSession, current_user: User, today: date) -> bool:
    result = await db.execute(
        select(UserQuota).where(UserQuota.user_id == current_user.id, UserQuota.date == today)
    )
    quota = result.scalar_one_or_none()

    if quota:
        if quota.count >= USER_DAILY_UPLOAD_LIMIT:
            return False
        quota.count += 1
    else:
        quota = UserQuota(user_id=current_user.id, date=today, count=1)
        db.add(quota)
    return True

async def create_image_entry(db: AsyncSession, current_user: User, image: ImageCreate) -> Image:
    today = datetime.now(timezone.utc).date()

    if not await check_global_stats(db, today):
        raise HTTPException(status_code=429, detail="Global daily upload limit exceeded")

    if not await check_user_quota(db, current_user, today):
        raise HTTPException(status_code=429, detail="Daily upload limit exceeded")

    db_image = Image(title=image.title, url=str(image.url), owner_id=current_user.id)
    db.add(db_image)
    
    await db.commit()
    await db.refresh(db_image)
    
    return db_image
