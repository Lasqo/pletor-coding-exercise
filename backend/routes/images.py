from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Image
from schemas import ImageCreate, ImageRead, PaginatedImages
from services.image_service import process_upload_file
from utils.failure_simulation import maybe_fail

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/", response_model=ImageRead)
async def create_image(image: ImageCreate, db: AsyncSession = Depends(get_db)):
    maybe_fail()
    db_image = Image(**image.dict())
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image


@router.post("/upload", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    user: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    maybe_fail()
    db_image = await process_upload_file(file, title, user, db)
    await db.commit()
    return db_image


@router.post("/upload/batch", response_model=List[ImageRead])
async def upload_images_batch(
    files: List[UploadFile] = File(...),
    user: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    maybe_fail()
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    uploaded_images = []
    errors = []
    
    for idx, file in enumerate(files):
        try:
            db_image = await process_upload_file(file, None, user, db)
            uploaded_images.append(db_image)
        except HTTPException as e:
            errors.append(f"File {file.filename or idx + 1}: {e.detail}")
        except Exception as e:
            errors.append(f"File {file.filename or idx + 1}: {str(e)}")
    
    await db.commit()
    
    if errors and not uploaded_images:
        raise HTTPException(status_code=400, detail="All uploads failed: " + "; ".join(errors))
    
    return uploaded_images


@router.get("/", response_model=PaginatedImages)
async def list_images(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    maybe_fail()
    
    try:
        count_result = await db.execute(select(func.count(Image.id)))
        total = count_result.scalar_one()
        
        result = await db.execute(
            select(Image)
            .order_by(Image.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        images = result.scalars().all()
        
        return PaginatedImages(
            items=images,
            total=total,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        import traceback
        error_trace = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        print(f"Error in list_images: {error_trace}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.delete("/{image_id}", status_code=204)
async def delete_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
    return None
