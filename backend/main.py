import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, relationship, selectinload, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

USER_DAILY_UPLOAD_LIMIT = 10
GLOBAL_DAILY_UPLOAD_LIMIT = 100

engine = create_async_engine(DATABASE_URL, echo=bool(os.getenv("SQL_ECHO")))
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    images = relationship("Image", back_populates="owner")


class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    content_type = Column(String, nullable=True)
    owner = relationship("User", back_populates="images")


class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: str
    file_size: int | None = None
    content_type: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ImageListResponse(BaseModel):
    items: list[ImageRead]
    total: int


class RegisterBody(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserMeResponse(BaseModel):
    id: int
    username: str


class QuotaResponse(BaseModel):
    user_uploads_today: int
    user_limit: int
    user_remaining: int
    global_uploads_today: int
    global_limit: int
    global_remaining: int


def utc_day_bounds() -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


def image_to_read(image: Image) -> ImageRead:
    return ImageRead(
        id=image.id,
        created_at=image.created_at,
        title=image.title,
        user=image.owner.username,
        url=image.url,
        file_size=image.file_size,
        content_type=image.content_type,
    )


async def count_uploads_today(
    db: AsyncSession,
    *,
    owner_id: int | None = None,
) -> int:
    start, end = utc_day_bounds()
    stmt = select(func.count()).select_from(Image).where(
        Image.created_at >= start,
        Image.created_at < end,
    )
    if owner_id is not None:
        stmt = stmt.where(Image.owner_id == owner_id)
    result = await db.execute(stmt)
    return int(result.scalar_one())


async def check_upload_quotas(db: AsyncSession, owner_id: int) -> None:
    user_count = await count_uploads_today(db, owner_id=owner_id)
    if user_count >= USER_DAILY_UPLOAD_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={
                "code": "user_daily_limit",
                "message": f"You have reached the daily upload limit of {USER_DAILY_UPLOAD_LIMIT} images.",
            },
        )
    global_count = await count_uploads_today(db, owner_id=None)
    if global_count >= GLOBAL_DAILY_UPLOAD_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={
                "code": "global_daily_limit",
                "message": f"The service has reached the global daily upload limit of {GLOBAL_DAILY_UPLOAD_LIMIT} images.",
            },
        )


async def ensure_db_schema() -> None:
    """create_all does not migrate existing tables; drop and recreate if DB predates owner_id FK."""
    async with engine.begin() as conn:
        r = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='images'"),
        )
        if r.fetchone() is None:
            await conn.run_sync(Base.metadata.create_all)
            return

        r2 = await conn.execute(text("PRAGMA table_info(images)"))
        cols = [row[1] for row in r2.fetchall()]
        if "owner_id" not in cols:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        else:
            await conn.run_sync(Base.metadata.create_all)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
async def on_startup():
    if os.getenv("TESTING"):
        return

    await ensure_db_schema()

    async with SessionLocal() as db:
        result = await db.execute(select(Image))
        images = result.scalars().all()
        if images:
            return

        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)
        two_days_ago = now - timedelta(days=2)

        demo_password = "demo123"
        user_names = ["alice", "bob", "charlie", "diana", "eve"]
        users: list[User] = []
        for name in user_names:
            users.append(
                User(
                    username=name,
                    hashed_password=hash_password(demo_password),
                )
            )
        db.add_all(users)
        await db.flush()

        unsplash_ids = [
            "photo-1506744038136-46273834b3fb",
            "photo-1465101046530-73398c7f28ca",
            "photo-1465101178521-c1a9136a3b99",
            "photo-1470071459604-3b5ec3a7fe05",
            "photo-1441974231531-c6227db76b6e",
            "photo-1469474968028-56623f02e42e",
            "photo-1426604966848-d7adac402bff",
            "photo-1472214103451-9374bd1c798e",
            "photo-1500534314263-0869cef50735",
            "photo-1501785888041-af3ef285b470",
            "photo-1418065460487-3e41a6c84dc5",
            "photo-1414609245224-afa02bfb3fda",
            "photo-1470770903676-69b98201ea1c",
            "photo-1446776811953-b23d57bd21aa",
            "photo-1447752875215-b2761acb3c5d",
            "photo-1433086966358-54859d0ed716",
            "photo-1482938289607-e9573fc25ebb",
            "photo-1475924156734-496f6cac6ec1",
            "photo-1470252649378-9c29740c9fa8",
            "photo-1490682143684-14369e18dce8",
            "photo-1507525428034-b723cf961d3e",
            "photo-1519681393784-d120267933ba",
            "photo-1439853949127-fa647821eba0",
            "photo-1484591974057-265bb767ef71",
            "photo-1493246507139-91e8fad9978e",
            "photo-1505765050516-f72dcac9c60e",
            "photo-1476514525535-07fb3b4ae5f1",
            "photo-1494500764479-0c8f2919a3d8",
            "photo-1504893524553-b855bce32c67",
            "photo-1464822759023-fed622ff2c3b",
            "photo-1486870591958-9b9d0d1dda99",
            "photo-1510414842594-a61c69b5ae57",
            "photo-1500259783852-0ca9ce8a64dc",
            "photo-1540202404-a2f29016b523",
            "photo-1531366936337-7c912a4589a7",
            "photo-1491002052546-bf38f186af56",
            "photo-1508739773434-c26b3d09e071",
            "photo-1505144808419-1957a94ca61e",
            "photo-1470114716159-e389f8712861",
            "photo-1497436072909-60f360e1d4b1",
            "photo-1501854140801-50d01698950b",
            "photo-1518173946687-a1e2a18a563e",
            "photo-1517483000871-1dbf64a6e1c6",
            "photo-1490750967868-88aa4f44baee",
            "photo-1431794062232-2a99a5431c6c",
            "photo-1518098268026-4e89f1a2cd8e",
            "photo-1502082553048-f009c37129b9",
            "photo-1429552077091-836152271555",
            "photo-1540979388789-6cee28a1cdc9",
            "photo-1506260408121-e353d10b87c7",
            "photo-1536431311719-398b6704d4cc",
            "photo-1523712999610-f77fbcfc3843",
            "photo-1477346611705-65d1883cee1e",
            "photo-1504700610630-ac6edd918cc0",
            "photo-1509316975850-ff9c5deb0cd9",
        ]

        titles = [
            "Sunset Beach",
            "Mountain View",
            "City Lights",
            "Green Valley",
            "Forest Path",
            "River Bend",
            "Hilltop Dawn",
            "Coastal Cliff",
            "Desert Road",
            "Lake Reflection",
            "Autumn Leaves",
            "Misty Morning",
            "Ocean Waves",
            "Night Sky",
            "Snow Peak",
            "Wildflower Field",
            "Canyon View",
            "Waterfall",
            "Tropical Island",
            "Rocky Shore",
            "Foggy Bridge",
            "Starry Night",
            "Alpine Meadow",
            "Quiet Harbor",
            "Rolling Hills",
            "Sunset Clouds",
            "Frozen Lake",
            "Pine Forest",
            "Coral Reef",
            "Volcanic Peak",
            "Sand Dunes",
            "Cherry Blossoms",
            "Northern Lights",
            "Bamboo Grove",
            "Lavender Field",
            "Glacier Bay",
            "Rainforest",
            "Prairie Sunset",
            "Mediterranean Coast",
            "Redwood Trail",
            "Tidal Pool",
            "Mossy Creek",
            "Storm Clouds",
            "Golden Hour",
            "Mountain Lake",
            "Cliffside Village",
            "Bioluminescent Bay",
            "Ancient Ruins",
            "Terraced Rice Fields",
            "Lighthouse Point",
            "Sahara Dusk",
            "Fjord Morning",
            "Jungle Canopy",
            "Volcano Sunrise",
            "Coral Atoll",
        ]

        user_counts = [15, 12, 10, 10, 8]
        fake_images: list[Image] = []
        idx = 0
        for user_idx, count in enumerate(user_counts):
            uid = users[user_idx].id
            for _ in range(count):
                if idx < 20:
                    ts = now - timedelta(hours=idx)
                elif idx < 40:
                    ts = yesterday - timedelta(hours=(idx - 20))
                else:
                    ts = two_days_ago - timedelta(hours=(idx - 40))

                fake_images.append(
                    Image(
                        title=titles[idx],
                        owner_id=uid,
                        url=f"https://images.unsplash.com/{unsplash_ids[idx]}",
                        created_at=ts,
                    )
                )
                idx += 1

        db.add_all(fake_images)
        await db.commit()


@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}


@app.post("/auth/register", status_code=201, response_model=UserMeResponse)
async def register(body: RegisterBody, db: AsyncSession = Depends(get_db)):
    if len(body.username) < 2:
        raise HTTPException(status_code=400, detail="Username must be at least 2 characters.")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Username already taken.")

    user = User(username=body.username, hashed_password=hash_password(body.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserMeResponse(id=user.id, username=user.username)


@app.post("/auth/login", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer")


@app.get("/auth/me", response_model=UserMeResponse)
async def auth_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserMeResponse(id=current_user.id, username=current_user.username)


@app.get("/quota", response_model=QuotaResponse)
async def get_quota(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    user_count = await count_uploads_today(db, owner_id=current_user.id)
    global_count = await count_uploads_today(db, owner_id=None)
    return QuotaResponse(
        user_uploads_today=user_count,
        user_limit=USER_DAILY_UPLOAD_LIMIT,
        user_remaining=max(0, USER_DAILY_UPLOAD_LIMIT - user_count),
        global_uploads_today=global_count,
        global_limit=GLOBAL_DAILY_UPLOAD_LIMIT,
        global_remaining=max(0, GLOBAL_DAILY_UPLOAD_LIMIT - global_count),
    )


@app.post("/images/upload", response_model=ImageRead)
async def upload_image(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Use JPEG, PNG, GIF, or WebP.",
        )

    await check_upload_quotas(db, current_user.id)

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    content = await file.read()
    file_path.write_bytes(content)

    db_image = Image(
        title=title,
        owner_id=current_user.id,
        url=f"/uploads/{filename}",
        file_size=len(content),
        content_type=file.content_type,
    )
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    loaded = await db.execute(
        select(Image).options(selectinload(Image.owner)).where(Image.id == db_image.id)
    )
    img = loaded.scalar_one()
    return image_to_read(img)


@app.get("/images/", response_model=ImageListResponse)
async def list_images(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    count_result = await db.execute(select(func.count()).select_from(Image))
    total = int(count_result.scalar_one())

    result = await db.execute(
        select(Image)
        .options(selectinload(Image.owner))
        .order_by(Image.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    images = result.scalars().all()
    return ImageListResponse(items=[image_to_read(i) for i in images], total=total)


@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image).options(selectinload(Image.owner)).where(Image.id == image_id)
    )
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image_to_read(image)


@app.delete("/images/{image_id}", status_code=204)
async def delete_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own images.")

    if image.url.startswith("/uploads/"):
        fname = image.url.removeprefix("/uploads/")
        local = UPLOAD_DIR / fname
        if local.is_file():
            local.unlink()

    await db.delete(image)
    await db.commit()
    return None
