from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, QuotaStatus
from auth import hash_password, verify_password, create_access_token
from config import ACCESS_TOKEN_EXPIRE_MINUTES, USER_DAILY_LIMIT, GLOBAL_DAILY_LIMIT
from utils import get_uploads_today

router = APIRouter(prefix="", tags=["authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    hashed_password = hash_password(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer", username=user.username)


@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get access token."""
    # Find user
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer", username=user.username)


@router.get("/quota/{user}", response_model=QuotaStatus, tags=["quota"])
async def get_quota_status(user: str, db: AsyncSession = Depends(get_db)):
    """Get quota status for a specific user."""
    user_uploads = await get_uploads_today(db, user)
    global_uploads = await get_uploads_today(db)

    return QuotaStatus(
        user=user,
        user_uploads_today=user_uploads,
        user_limit=USER_DAILY_LIMIT,
        user_remaining=max(0, USER_DAILY_LIMIT - user_uploads),
        global_uploads_today=global_uploads,
        global_limit=GLOBAL_DAILY_LIMIT,
        global_remaining=max(0, GLOBAL_DAILY_LIMIT - global_uploads)
    )
