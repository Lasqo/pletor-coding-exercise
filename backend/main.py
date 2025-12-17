"""Impage Upload Service - Main Application File

TODO:
- Add logging instead of print statements
- Move secret key to environment variable
- Add pagination
- Add tests
- Add rate limiting to auth endpoints
- Authenticate quota endpoint
- Add created_at index for performance
- API versioning
- Add API doc (Swagger-like)
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from database import engine, SessionLocal, Base
from models import Image
from config import CORS_ORIGINS
from routes import auth, images

# Create FastAPI app
app = FastAPI(
    title="Image Upload Service",
    description="A quota-based image upload service with user authentication",
    version="1.0.0"
)


# CORS configuration - must be added BEFORE exception handlers
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    return JSONResponse(
        status_code=422,
        content={"detail": str(errors)},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Startup event to initialize database and seed data
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Insert fake data if table is empty
    async with SessionLocal() as db:
        result = await db.execute(select(Image))
        images_list = result.scalars().all()
        if not images_list:
            fake_images = [
                Image(
                    title="Sunset Beach",
                    user="alice",
                    url="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                ),
                Image(
                    title="Mountain View",
                    user="bob",
                    url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
                ),
                Image(
                    title="City Lights",
                    user="carol",
                    url="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99"
                ),
            ]
            db.add_all(fake_images)
            await db.commit()


# Root endpoint
@app.get("/", tags=["root"])
def read_root():
    return {
        "message": "Image Upload Service API",
        "docs": "/docs",
        "version": "1.0.0"
    }


# Include routers
app.include_router(auth.router)
app.include_router(images.router)
