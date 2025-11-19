from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from domain.models import User, Image
from domain.schemas import ImageRead, ImageCreate
from core.security import get_current_user
from services.image_service import create_image_entry

router = APIRouter(
    prefix="/images",
    tags=["images"]
)

@router.get("/", response_model=List[ImageRead])
async def list_images(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.owner_id == current_user.id).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    
    return [
        ImageRead(
            id=img.id,
            created_at=img.created_at,
            title=img.title,
            user=current_user.username,
            url=img.url
        ) for img in images
    ]

@router.post("/", response_model=ImageRead)
async def create_image(
    image: ImageCreate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    db_image = await create_image_entry(db, current_user, image)
    
    return ImageRead(
        id=db_image.id,
        created_at=db_image.created_at,
        title=db_image.title,
        user=current_user.username,
        url=db_image.url
    )

@router.delete("/{image_id}", status_code=204)
async def delete_image(
    image_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
        
    if image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")
        
    await db.delete(image)
    await db.commit()
    return None
