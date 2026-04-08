import uuid
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, func, select
from pydantic import BaseModel, ConfigDict
from typing import List
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    user = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    content_type = Column(String, nullable=True)


class ImageRead(BaseModel):
    id: int
    created_at: datetime
    title: str
    user: str
    url: str
    file_size: int | None = None
    content_type: str | None = None

    model_config = ConfigDict(from_attributes=True)


async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()


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
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        result = await db.execute(select(Image))
        images = result.scalars().all()
        if not images:
            now = datetime.utcnow()
            yesterday = now - timedelta(days=1)
            two_days_ago = now - timedelta(days=2)

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
                "Sunset Beach", "Mountain View", "City Lights", "Green Valley",
                "Forest Path", "River Bend", "Hilltop Dawn", "Coastal Cliff",
                "Desert Road", "Lake Reflection", "Autumn Leaves", "Misty Morning",
                "Ocean Waves", "Night Sky", "Snow Peak", "Wildflower Field",
                "Canyon View", "Waterfall", "Tropical Island", "Rocky Shore",
                "Foggy Bridge", "Starry Night", "Alpine Meadow", "Quiet Harbor",
                "Rolling Hills", "Sunset Clouds", "Frozen Lake", "Pine Forest",
                "Coral Reef", "Volcanic Peak", "Sand Dunes", "Cherry Blossoms",
                "Northern Lights", "Bamboo Grove", "Lavender Field", "Glacier Bay",
                "Rainforest", "Prairie Sunset", "Mediterranean Coast", "Redwood Trail",
                "Tidal Pool", "Mossy Creek", "Storm Clouds", "Golden Hour",
                "Mountain Lake", "Cliffside Village", "Bioluminescent Bay",
                "Ancient Ruins", "Terraced Rice Fields", "Lighthouse Point",
                "Sahara Dusk", "Fjord Morning", "Jungle Canopy", "Volcano Sunrise",
                "Coral Atoll",
            ]

            users = ["alice", "bob", "charlie", "diana", "eve"]

            # Distribute images: alice=15, bob=12, charlie=10, diana=10, eve=8
            user_counts = [15, 12, 10, 10, 8]

            fake_images = []
            idx = 0
            for user_idx, count in enumerate(user_counts):
                for _ in range(count):
                    # Spread across 3 days: first ~20 today, next ~20 yesterday, rest 2 days ago
                    if idx < 20:
                        ts = now - timedelta(hours=idx)
                    elif idx < 40:
                        ts = yesterday - timedelta(hours=(idx - 20))
                    else:
                        ts = two_days_ago - timedelta(hours=(idx - 40))

                    fake_images.append(
                        Image(
                            title=titles[idx],
                            user=users[user_idx],
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


@app.post("/images/upload", response_model=ImageRead)
async def upload_image(
    title: str = Form(...),
    user: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed. Use JPEG, PNG, GIF, or WebP.")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename

    content = await file.read()
    file_path.write_bytes(content)

    db_image = Image(
        title=title,
        user=user,
        url=f"/uploads/{filename}",
        file_size=len(content),
        content_type=file.content_type,
    )
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image


@app.get("/images/", response_model=List[ImageRead])
async def list_images(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).order_by(Image.created_at.desc()))
    images = result.scalars().all()
    return images


@app.get("/images/{image_id}", response_model=ImageRead)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@app.delete("/images/{image_id}", status_code=204)
async def delete_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == image_id))
    image = result.scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
    return None
