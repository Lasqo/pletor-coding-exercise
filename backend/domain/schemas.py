from pydantic import BaseModel, HttpUrl
from datetime import datetime, date

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ImageCreate(BaseModel):
    title: str
    url: HttpUrl

class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: HttpUrl

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

