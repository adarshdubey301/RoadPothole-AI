import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.database.models import DetectionLog
from app.utils.file_handling import validate_image_file, save_uploaded_image
from app.ml.detect_potholes import run_pothole_detection
from app.schemas.detection import DetectionResponse

router = APIRouter(prefix="/detection", tags=["Detection"])

@router.post("", response_model=DetectionResponse)
async def detect_potholes_endpoint(
    image: UploadFile = File(...),
    conf: float = Query(settings.CONFIDENCE_THRESHOLD, ge=0.05, le=0.95),
    iou: float = Query(settings.IOU_THRESHOLD, ge=0.1, le=0.9),
    db: Session = Depends(get_db)
):
    # 1. Read file bytes
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    # 2. Validate image format, integrity and size
    validate_image_file(image, content)
    
    # 3. Save original image securely
    unique_filename, original_path = save_uploaded_image(image, content)
    
    # 4. Determine model path
    active_model = settings.MODEL_PATH if settings.MODEL_PATH.exists() else settings.FALLBACK_MODEL_PATH
    if not active_model.exists():
        # As student fallback, try yolov8n.pt
        import shutil
        from ultralytics import YOLO
        print("Model file not found locally. Initializing yolov8n baseline model...")
        fallback_yolo = YOLO("yolov8n.pt")
        active_model = Path("yolov8n.pt")
        
    # 5. Run inference
    try:
        detection_result = run_pothole_detection(
            image_path=original_path,
            model_path=active_model,
            output_dir=settings.UPLOADS_DIR,
            conf_threshold=conf,
            iou_threshold=iou
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
        
    # 6. Record detection log in database
    log_entry = DetectionLog(
        image_filename=unique_filename,
        annotated_filename=detection_result["annotated_filename"],
        detection_count=detection_result["detection_count"],
        detections_summary=json.dumps(detection_result["classes_summary"]),
        inference_time_ms=detection_result["inference_time_ms"]
    )
    db.add(log_entry)
    db.commit()
    
    # 7. Construct URLs
    base_url = "/uploads"
    
    return DetectionResponse(
        success=True,
        message=detection_result["message"],
        detection_count=detection_result["detection_count"],
        pothole_count=detection_result["pothole_count"],
        inference_time_ms=detection_result["inference_time_ms"],
        image_width=detection_result["image_width"],
        image_height=detection_result["image_height"],
        boxes=detection_result["boxes"],
        classes_summary=detection_result["classes_summary"],
        original_image_url=f"{base_url}/{unique_filename}",
        annotated_image_url=f"{base_url}/{detection_result['annotated_filename']}",
        original_filename=unique_filename,
        annotated_filename=detection_result["annotated_filename"]
    )
