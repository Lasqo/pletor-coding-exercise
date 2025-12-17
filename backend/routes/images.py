from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Image
from schemas import ImageCreate, ImageRead
from auth import get_current_user
from config import USER_DAILY_LIMIT, GLOBAL_DAILY_LIMIT
from utils import get_uploads_today

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/", response_model=ImageRead)
async def create_image(
    image: ImageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new image (requires authentication)."""
    # Check quotas before creating image
    user_uploads = await get_uploads_today(db, current_user)
    global_uploads = await get_uploads_today(db)

    if user_uploads >= USER_DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily upload limit reached. You can upload {USER_DAILY_LIMIT} images per day. Try again tomorrow."
        )

    if global_uploads >= GLOBAL_DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Global daily upload limit reached. Maximum {GLOBAL_DAILY_LIMIT} images can be uploaded per day across all users. Try again tomorrow."
        )

    # Create image with authenticated user
    db_image = Image(
        title=image.title,
        url=str(image.url),  # Convert HttpUrl to string
        user=current_user
    )
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image


@router.get("/", response_model=List[ImageRead])
async def list_images(db: AsyncSession = Depends(get_db)):
    """List all images."""
    result = await db.execute(select(Image).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    return images


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific image by ID."""
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.delete("/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete an image (only by owner)."""
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Check if user owns the image
    if image.user != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own images"
        )

    await db.delete(image)
    await db.commit()
    return None
