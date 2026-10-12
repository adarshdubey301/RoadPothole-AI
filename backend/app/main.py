import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import engine, Base
from app.api.routes import health, detection, reports, dashboard, model_info

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Road Damage Detection and Civic Reporting System REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for serving original and annotated images
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")

# Include API routes
app.include_router(health.router)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(detection.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(model_info.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/health",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
