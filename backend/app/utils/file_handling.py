import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import settings

def is_safe_path(base_dir: Path, path: Path) -> bool:
    try:
        resolved_base = base_dir.resolve()
        resolved_path = path.resolve()
        return resolved_base in resolved_path.parents or resolved_base == resolved_path
    except Exception:
        return False

def validate_image_file(file: UploadFile, content: bytes) -> tuple[int, int]:
    # Check size
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    
    # Check extension
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Verify image integrity with Pillow
    try:
        import io
        img = Image.open(io.BytesIO(content))
        img.verify()
        # Re-open to get dimensions since verify() closes image
        img = Image.open(io.BytesIO(content))
        width, height = img.size
        return width, height
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Corrupt or invalid image file: {str(e)}"
        )

def save_uploaded_image(file: UploadFile, content: bytes) -> tuple[str, Path]:
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    unique_filename = f"upload_{uuid.uuid4().hex[:12]}.{ext}"
    target_path = settings.UPLOADS_DIR / unique_filename
    
    if not is_safe_path(settings.UPLOADS_DIR, target_path):
        raise HTTPException(status_code=400, detail="Invalid target path (path traversal detected)")
        
    with open(target_path, "wb") as f:
        f.write(content)
        
    return unique_filename, target_path
