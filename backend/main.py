from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import Column, Integer, String, DateTime, func, select, ForeignKey, and_, cast, Date
from pydantic import BaseModel
from typing import List
from datetime import datetime
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import timedelta
from fastapi import status

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    images = relationship("Image", back_populates="owner")

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="images")

class ImageCreate(BaseModel):
    title: str
    url: str

class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    url: str
    owner_id: int
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

# Constants for quotas
USER_DAILY_QUOTA = 5
GLOBAL_DAILY_QUOTA = 100

# Utility to get today's date (UTC)
def today_utc():
    return datetime.utcnow().date()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key"  # Replace with a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Insert demo user and fake images if table is empty
    async with SessionLocal() as db:
        # Create demo user if not exists
        result = await db.execute(select(User).where(User.username == "demo"))
        demo_user = result.scalar_one_or_none()
        if not demo_user:
            demo_user = User(username="demo", password_hash=get_password_hash("demo"))
            db.add(demo_user)
            await db.commit()
            await db.refresh(demo_user)
        # Insert fake images for demo user if no images exist
        result = await db.execute(select(Image))
        images = result.scalars().all()
        if not images:
            fake_images = [
                Image(title="Sunset Beach", url="https://images.unsplash.com/photo-1506744038136-46273834b3fb", owner_id=demo_user.id),
                Image(title="Mountain View", url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca", owner_id=demo_user.id),
                Image(title="City Lights", url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99", owner_id=demo_user.id),
            ]
            db.add_all(fake_images)
            await db.commit()

@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}

@app.post("/images/", response_model=ImageRead)
async def create_image(
    image: ImageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check per-user quota (robust for SQLite)
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    user_uploads = await db.execute(
        select(func.count(Image.id)).where(
            and_(
                Image.owner_id == current_user.id,
                func.strftime('%Y-%m-%d', Image.created_at) == today_str
            )
        )
    )
    user_count = user_uploads.scalar()
    if user_count >= USER_DAILY_QUOTA:
        raise HTTPException(status_code=429, detail="User daily quota exceeded (5 images per day)")
    # Check global quota
    global_uploads = await db.execute(
        select(func.count(Image.id)).where(
            func.strftime('%Y-%m-%d', Image.created_at) == today_str
        )
    )
    global_count = global_uploads.scalar()
    if global_count >= GLOBAL_DAILY_QUOTA:
        raise HTTPException(status_code=429, detail="Global daily quota exceeded (100 images per day)")
    # Create image owned by current user
    db_image = Image(**image.dict(), owner_id=current_user.id)
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image

@app.get("/images/", response_model=List[ImageRead])
async def list_images(db: AsyncSession = Depends(get_db)):
    # List all images (public endpoint)
    result = await db.execute(select(Image).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    return images

@app.get("/my-images/", response_model=List[ImageRead])
async def list_my_images(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # List images owned by the current user
    result = await db.execute(
        select(Image).where(Image.owner_id == current_user.id).order_by(Image.created_at.desc())
    )
    images = result.scalars().all()
    return images

@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    # Get image by ID (public endpoint)
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@app.delete("/images/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only allow the owner to delete their image
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")
    await db.delete(image)
    await db.commit()
    return None

@app.get("/quota-usage/", response_model=dict)
async def quota_usage(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Return the user's and global quota usage for today (robust for SQLite)
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    user_uploads = await db.execute(
        select(func.count(Image.id)).where(
            and_(
                Image.owner_id == current_user.id,
                func.strftime('%Y-%m-%d', Image.created_at) == today_str
            )
        )
    )
    user_count = user_uploads.scalar()
    global_uploads = await db.execute(
        select(func.count(Image.id)).where(
            func.strftime('%Y-%m-%d', Image.created_at) == today_str
        )
    )
    global_count = global_uploads.scalar()
    return {
        "user_daily_quota": USER_DAILY_QUOTA,
        "user_used": user_count,
        "global_daily_quota": GLOBAL_DAILY_QUOTA,
        "global_used": global_count,
    }

@app.post("/register", response_model=UserRead)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, password_hash=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}
