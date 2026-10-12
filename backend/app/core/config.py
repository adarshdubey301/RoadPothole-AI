import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RoadPothole-AI: Road Pothole Detection and Civic Reporting System"
    API_V1_STR: str = "/api"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    MODELS_DIR: Path = BASE_DIR / "models"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{(BASE_DIR / 'data' / 'roadpothole.db').as_posix()}"
    
    # Model configuration
    MODEL_PATH: Path = MODELS_DIR / "best.pt"
    FALLBACK_MODEL_PATH: Path = MODELS_DIR / "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.20
    IOU_THRESHOLD: float = 0.45
    
    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png"}
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
