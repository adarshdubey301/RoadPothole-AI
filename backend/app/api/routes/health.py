import sys
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Check DB
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_err = str(e)
        
    # Check Model
    model_ready = settings.MODEL_PATH.exists() or settings.FALLBACK_MODEL_PATH.exists()
    
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "database_connected": db_ok,
        "model_available": model_ready,
        "model_file": str(settings.MODEL_PATH) if settings.MODEL_PATH.exists() else str(settings.FALLBACK_MODEL_PATH),
        "python_version": sys.version.split()[0],
        "version": "1.0.0"
    }
