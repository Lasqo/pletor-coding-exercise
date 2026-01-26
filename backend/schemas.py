from datetime import datetime
from typing import List

from pydantic import BaseModel


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
    model_config = {"from_attributes": True}


class PaginatedImages(BaseModel):
    items: List[ImageRead]
    total: int
    limit: int
    offset: int
