from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime


class ImageCreate(BaseModel):
    title: str
    url: HttpUrl


class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: str

    class Config:
        from_attributes = True


class QuotaStatus(BaseModel):
    user: str
    user_uploads_today: int
    user_limit: int
    user_remaining: int
    global_uploads_today: int
    global_limit: int
    global_remaining: int


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
