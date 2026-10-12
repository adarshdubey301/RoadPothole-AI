from typing import List, Optional
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str

class DetectionResponse(BaseModel):
    success: bool
    message: str
    detection_count: int
    pothole_count: int
    inference_time_ms: float
    image_width: int
    image_height: int
    boxes: List[BoundingBox] = []
    classes_summary: dict = Field(default_factory=dict)
    original_image_url: str
    annotated_image_url: str
    original_filename: str
    annotated_filename: str

class ModelInfoResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    model_loaded: bool
    model_name: str
    model_path: str
    architecture: str
    classes: dict
    device: str
    metrics: Optional[dict] = None
