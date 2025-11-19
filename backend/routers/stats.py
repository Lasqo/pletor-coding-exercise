from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from core.database import get_db
from domain.models import User, UserQuota, GlobalDailyStats
from domain.schemas import QuotaResponse, GlobalStatsResponse
from core.security import get_current_user
from core.config import GLOBAL_DAILY_UPLOAD_LIMIT, USER_DAILY_UPLOAD_LIMIT

router = APIRouter(tags=["stats"])

@router.get("/quota/", response_model=QuotaResponse)
async def get_my_quota(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(UserQuota).where(UserQuota.user_id == current_user.id, UserQuota.date == today)
    )
    quota = result.scalar_one_or_none()
    usage = quota.count if quota else 0
    return {"user": current_user.username, "usage": usage, "limit": USER_DAILY_UPLOAD_LIMIT}

@router.get("/quotas/", response_model=List[QuotaResponse])
async def get_all_quotas(db: AsyncSession = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(UserQuota, User.username)
        .join(User, UserQuota.user_id == User.id)
        .where(UserQuota.date == today)
    )
    rows = result.all()
    
    return [
        {"user": username, "usage": quota.count, "limit": USER_DAILY_UPLOAD_LIMIT}
        for quota, username in rows
    ]

@router.get("/global-stats/", response_model=GlobalStatsResponse)
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(GlobalDailyStats).where(GlobalDailyStats.date == today)
    )
    stats = result.scalar_one_or_none()
    total_count = stats.total_count if stats else 0
    return {"date": today, "total_count": total_count, "limit": GLOBAL_DAILY_UPLOAD_LIMIT}
