import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS
from routes import images
from utils.seed_data import seed_initial_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/thumbnails", StaticFiles(directory="uploads/thumbnails"), name="thumbnails")

app.include_router(images.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers={
                "Access-Control-Allow-Origin": CORS_ORIGINS[0],
                "Access-Control-Allow-Credentials": "true",
            },
        )
    
    error_trace = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    print(f"Unhandled exception: {error_trace}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": CORS_ORIGINS[0],
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.get("/", response_model=dict)
def read_root():
    return {"Hello": "World"}


@app.on_event("startup")
async def on_startup():
    await seed_initial_data()
