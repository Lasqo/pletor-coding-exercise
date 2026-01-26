from pathlib import Path

UPLOAD_DIR = Path("uploads")
THUMBNAIL_DIR = Path("uploads/thumbnails")
UPLOAD_DIR.mkdir(exist_ok=True)
THUMBNAIL_DIR.mkdir(exist_ok=True)

FAILURE_RATE = 0.15
MAX_THUMBNAIL_SIZE = 400
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
MIN_ASPECT_RATIO = 0.1
MAX_ASPECT_RATIO = 10

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

CORS_ORIGINS = ["http://localhost:5173"]
