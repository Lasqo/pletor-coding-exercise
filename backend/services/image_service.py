import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile
from PIL import Image as PILImage
from sqlalchemy.ext.asyncio import AsyncSession

from config import (
    ALLOWED_IMAGE_TYPES,
    MAX_ASPECT_RATIO,
    MAX_FILE_SIZE,
    MIN_ASPECT_RATIO,
    THUMBNAIL_DIR,
    UPLOAD_DIR,
)
from models import Image
from utils.image_processing import generate_thumbnail


async def process_upload_file(
    file: UploadFile,
    title: Optional[str],
    user: Optional[str],
    db: AsyncSession
) -> Image:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(contents)

    with PILImage.open(file_path) as img:
        width, height = img.size
        aspect_ratio = width / height if height > 0 else 0
        
        if aspect_ratio < MIN_ASPECT_RATIO or aspect_ratio > MAX_ASPECT_RATIO:
            file_path.unlink()
            raise HTTPException(
                status_code=400,
                detail=f"Image aspect ratio too extreme ({aspect_ratio:.2f}). Must be between {MIN_ASPECT_RATIO} and {MAX_ASPECT_RATIO}."
            )

    thumbnail_filename = f"thumb_{filename}"
    thumbnail_path = THUMBNAIL_DIR / thumbnail_filename
    generate_thumbnail(file_path, thumbnail_path)

    if not title:
        original_name = Path(file.filename).stem if file.filename else "Untitled"
        title = original_name.replace("_", " ").replace("-", " ").title()

    url = f"http://localhost:8000/uploads/{filename}"
    db_image = Image(title=title, user=user or "Anonymous", url=url)
    db.add(db_image)
    await db.flush()
    await db.refresh(db_image)
    return db_image
