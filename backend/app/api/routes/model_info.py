import json
from pathlib import Path
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.detection import ModelInfoResponse
from app.ml.detect_potholes import CLASS_NAMES

router = APIRouter(prefix="/model-info", tags=["Model"])

@router.get("", response_model=ModelInfoResponse)
def get_model_info():
    model_exists = settings.MODEL_PATH.exists() or settings.FALLBACK_MODEL_PATH.exists()
    model_file = settings.MODEL_PATH if settings.MODEL_PATH.exists() else settings.FALLBACK_MODEL_PATH
    
    # Read metrics file if available
    metrics_file = settings.REPORTS_DIR / "model_metrics.json"
    metrics = None
    if metrics_file.exists():
        try:
            with open(metrics_file, "r", encoding="utf-8") as f:
                metrics = json.load(f)
        except Exception as e:
            print(f"Failed to read metrics: {e}")
            
    # Also check dataset report
    dataset_report_file = settings.REPORTS_DIR / "dataset_report.json"
    dataset_summary = None
    if dataset_report_file.exists():
        try:
            with open(dataset_report_file, "r", encoding="utf-8") as f:
                dataset_summary = json.load(f)
        except Exception as e:
            pass
            
    if metrics is not None and dataset_summary is not None:
        metrics["dataset_summary"] = {
            "total_images": dataset_summary.get("total_images", 0),
            "total_annotations": dataset_summary.get("total_annotations", 0),
            "total_potholes": dataset_summary.get("total_potholes", 0)
        }

    return ModelInfoResponse(
        model_loaded=model_exists,
        model_name=model_file.name if model_file.exists() else "yolov8n-rdd",
        model_path=str(model_file),
        architecture="Ultralytics YOLO (YOLOv8 nano backbone)",
        classes=CLASS_NAMES,
        device="cpu",
        metrics=metrics
    )
