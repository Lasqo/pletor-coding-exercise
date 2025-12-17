"""Shared utility functions."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date

from models import Image


async def get_uploads_today(db: AsyncSession, user: str | None = None) -> int:
    """Get the count of uploads for today, optionally filtered by user."""
    today = date.today()
    query = select(func.count(Image.id)).where(
        func.date(Image.created_at) == today
    )
    if user:
        query = query.where(Image.user == user)
    result = await db.execute(query)
    return result.scalar() or 0
