from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, func, select, ForeignKey
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# JWT Configuration
SECRET_KEY = "secret_key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    url = Column(String, nullable=False)

class UploadAttempt(Base):
    __tablename__ = "upload_attempts"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    image_id = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

class UserRegister(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    created_at: datetime
    email: str
    username: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ImageCreate(BaseModel):
    title: str
    url: str

class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user_id: int
    url: str
    user: str 
    
    class Config:
        orm_mode = True

class QuotaInfo(BaseModel):
    username: str
    quota_limit: int
    remaining: int
    reset_time: datetime
    uploads_today: int
    user_id: int

class GlobalQuotaInfo(BaseModel):
    global_limit: int
    remaining: int
    total_uploads_today: int

async def get_db():
    async with SessionLocal() as db:
        yield db

app = FastAPI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
     max_age=600, 
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

USER_DAILY_QUOTA = 5
GLOBAL_DAILY_QUOTA = 100

def get_today_start():
    now = datetime.utcnow()
    return datetime(now.year, now.month, now.day, 0, 0, 0)

def get_tomorrow_start():
    return get_today_start() + timedelta(days=1)

async def get_user_quota_info(user: User, db: AsyncSession) -> QuotaInfo:
    today_start = get_today_start()
    
    result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.user_id == user.id)
        .where(UploadAttempt.created_at >= today_start)
    )
    uploads_today = result.scalar() or 0
    
    return QuotaInfo(
        user_id=user.id,
        username=user.username,
        uploads_today=uploads_today,
        quota_limit=USER_DAILY_QUOTA,
        remaining=max(0, USER_DAILY_QUOTA - uploads_today),
        reset_time=get_tomorrow_start()
    )

async def get_global_quota_info(db: AsyncSession) -> GlobalQuotaInfo:
    today_start = get_today_start()
    
    result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.created_at >= today_start)
    )
    total_today = result.scalar() or 0
    
    return GlobalQuotaInfo(
        total_uploads_today=total_today,
        global_limit=GLOBAL_DAILY_QUOTA,
        remaining=max(0, GLOBAL_DAILY_QUOTA - total_today)
    )

async def check_quota(user: User, db: AsyncSession) -> tuple[bool, str]:
    today_start = get_today_start()
    
    user_result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.user_id == user.id)
        .where(UploadAttempt.created_at >= today_start)
    )
    user_count = user_result.scalar() or 0
    
    if user_count >= USER_DAILY_QUOTA:
        return False, f"User quota exceeded. You can only upload {USER_DAILY_QUOTA} images per day."
    
    global_result = await db.execute(
        select(func.count(UploadAttempt.id))
        .where(UploadAttempt.created_at >= today_start)
    )
    global_count = global_result.scalar() or 0
    
    if global_count >= GLOBAL_DAILY_QUOTA:
        return False, f"Global quota exceeded. Maximum {GLOBAL_DAILY_QUOTA} images per day across all users."
    
    return True, ""

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    # Insert fake data if table is empty
    async with SessionLocal() as db:

        test_user = User(
            email="test@example.com",
            username="default database",
            hashed_password=get_password_hash("password123")
        )
        db.add(test_user)
        await db.commit()
        await db.refresh(test_user)

        result = await db.execute(select(Image))
        images = result.scalars().all()
        if not images:
            fake_images = [
                Image(title="Sunset Beach", user_id=test_user.id, url="https://images.unsplash.com/photo-1506744038136-46273834b3fb"),
                Image(title="Mountain View", user_id=test_user.id, url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca"),
                Image(title="City Lights", user_id=test_user.id, url="https://images.unsplash.com/photo-1571951103752-53c15cad28e5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1625"),
            ]
            db.add_all(fake_images)
            await db.commit()

@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username.lower(),
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(
        data={"sub": new_user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(
        select(User).where(
            (User.email == credentials.username)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse.from_orm(current_user)

@app.post("/images/", response_model=ImageRead, status_code=status.HTTP_201_CREATED)
async def create_image(
    image: ImageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Check quotas first
        can_upload, message = await check_quota(current_user, db)
        if not can_upload:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=message)
        
        new_image = Image(
            title=image.title,
            url=image.url,
            user_id=current_user.id
        )
        db.add(new_image)
        await db.commit()
        await db.refresh(new_image)
        
        upload_attempt = UploadAttempt(
            image_id=new_image.id,
            title=image.title,
            user_id=current_user.id
        )
        db.add(upload_attempt)
        await db.commit()
        
        return {
            "id": new_image.id,
            "created_at": new_image.created_at,
            "title": new_image.title,
            "user_id": new_image.user_id,
            "url": new_image.url,
            "user": current_user.username
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        ) from e

@app.get("/images/", response_model=List[ImageRead])
async def list_all_images(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .order_by(Image.created_at.desc())
    )
    
    images = []
    for image, username in result:
        image_dict = {
            "id": image.id,
            "created_at": image.created_at,
            "title": image.title,
            "user_id": image.user_id,
            "url": image.url,
            "user": username
        }
        images.append(image_dict)
    return images

@app.get("/images/me", response_model=List[ImageRead])
async def list_my_images(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Image, User.username)
        .join(User, Image.user_id == User.id)
        .where(Image.user_id == current_user.id)
        .order_by(Image.created_at.desc())
    )
    
    images = []
    for image, username in result:
        image_dict = {
            "id": image.id,
            "created_at": image.created_at,
            "title": image.title,
            "user_id": image.user_id,
            "url": image.url,
            "user": username
        }
        images.append(image_dict)
    return images

@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return image

@app.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check if current user is the owner
    if image.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own images"
        )
    
    await db.delete(image)
    await db.commit()
    return None

@app.get("/quota/me", response_model=QuotaInfo)
async def get_my_quota(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_user_quota_info(current_user, db)

@app.get("/quota/global", response_model=GlobalQuotaInfo)
async def get_global_quota(db: AsyncSession = Depends(get_db)):
    return await get_global_quota_info(db)


@app.get("/")
def read_root():
    return {
        "message": "Image Gallery API with Authentication",
        "version": "2.0",
        "endpoints": {
            "auth": ["/auth/register", "/auth/login", "/auth/me"],
            "images": ["/images/", "/images/me", "/images/{id}"],
            "quota": ["/quota/me", "/quota/global"]
        }
    }