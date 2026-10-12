import os
import time
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image

# Global singleton model cache
_cached_model = None
_cached_model_path = None

CLASS_NAMES = {
    0: "D00: Longitudinal Crack",
    1: "D01: Joint Crack (Longitudinal)",
    2: "D10: Transverse Crack",
    3: "D11: Joint Crack (Transverse)",
    4: "D20: Alligator Crack",
    5: "D40: Pothole",
    6: "D43: Crosswalk Blur",
    7: "D44: Lane Line Blur",
    8: "D50: Manhole Cover"
}

# Distinct color palette (BGR format for OpenCV)
CLASS_COLORS = {
    5: (0, 0, 255),     # Bright Red for Potholes (D40)
    4: (0, 165, 255),   # Orange for Alligator Cracks (D20)
    0: (255, 191, 0),   # Deep Sky Blue for Longitudinal (D00)
    1: (255, 215, 0),   # Gold for Joint Crack (D01)
    2: (0, 255, 255),   # Yellow for Transverse Crack (D10)
    3: (50, 205, 50),   # Lime Green (D11)
    6: (255, 0, 255),   # Magenta (D43)
    7: (238, 130, 238), # Violet (D44)
    8: (128, 128, 128)  # Gray (D50)
}

def get_yolo_model(model_path: Path):
    global _cached_model, _cached_model_path
    
    if _cached_model is not None and _cached_model_path == str(model_path):
        return _cached_model
        
    try:
        from ultralytics import YOLO
    except ImportError:
        raise RuntimeError("The 'ultralytics' package is not installed. Please install it using 'pip install ultralytics'.")
        
    if not model_path.exists():
        # Check if pretrained yolov8n can be downloaded as fallback
        fallback = model_path.parent / "yolov8n.pt"
        if fallback.exists():
            print(f"Custom model '{model_path}' not found. Loading fallback '{fallback}'.")
            _cached_model = YOLO(str(fallback))
            _cached_model_path = str(fallback)
            return _cached_model
        else:
            raise FileNotFoundError(f"Model weights file not found at '{model_path}' and no fallback model available.")
            
    print(f"Loading YOLO model from: {model_path}")
    _cached_model = YOLO(str(model_path))
    _cached_model_path = str(model_path)
    return _cached_model

def run_pothole_detection(
    image_path: Path,
    model_path: Path,
    output_dir: Path,
    conf_threshold: float = 0.25,
    iou_threshold: float = 0.45
) -> Dict[str, Any]:
    start_time = time.time()
    
    if not image_path.exists():
        raise FileNotFoundError(f"Input image '{image_path}' not found.")
        
    model = get_yolo_model(model_path)
    
    # Read original image using OpenCV
    cv_img = cv2.imread(str(image_path))
    if cv_img is None:
        raise ValueError(f"Failed to read image '{image_path}' with OpenCV. Image might be corrupt.")
        
    img_h, img_w = cv_img.shape[:2]
    
    # Run YOLO inference
    results = model.predict(
        source=str(image_path),
        conf=conf_threshold,
        iou=iou_threshold,
        verbose=False
    )
    
    inference_time = (time.time() - start_time) * 1000.0  # in ms
    
    annotated_img = cv_img.copy()
    boxes_out = []
    classes_summary = {}
    pothole_count = 0
    
    if results and len(results) > 0:
        r = results[0]
        if hasattr(r, "boxes") and r.boxes is not None:
            for box in r.boxes:
                # Extract coordinates
                xyxy = box.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3])
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                
                # Resolve class name and detection category
                is_single_class = hasattr(model, "names") and isinstance(model.names, dict) and len(model.names) == 1
                raw_name = ""
                if hasattr(model, "names") and isinstance(model.names, dict) and cls_id in model.names:
                    raw_name = str(model.names[cls_id]).strip()
                    
                if is_single_class or raw_name.lower() in ("0", "pothole", "potholes"):
                    cls_name = "Pothole"
                    display_cls_id = 5
                    color = (0, 0, 255)  # Bright Red for Potholes
                    is_pothole = True
                else:
                    cls_name = CLASS_NAMES.get(cls_id, raw_name or f"Class {cls_id}")
                    display_cls_id = cls_id
                    color = CLASS_COLORS.get(cls_id, (0, 255, 0))
                    is_pothole = (cls_id == 5 or "pothole" in cls_name.lower() or "d40" in cls_name.lower())
                    
                if is_pothole:
                    pothole_count += 1
                    
                classes_summary[cls_name] = classes_summary.get(cls_name, 0) + 1
                
                boxes_out.append({
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2),
                    "confidence": round(conf, 4),
                    "class_id": display_cls_id,
                    "class_name": cls_name
                })
                
                # Draw bounding box
                line_thickness = max(2, int(min(img_w, img_h) / 200))
                cv2.rectangle(
                    annotated_img,
                    (int(x1), int(y1)),
                    (int(x2), int(y2)),
                    color,
                    line_thickness
                )
                
                # Draw label tag with background
                label_text = f"{cls_name} {conf*100:.1f}%"
                font_scale = 0.5
                font_thick = 1
                (text_w, text_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thick)
                
                tag_y1 = max(0, int(y1) - text_h - 6)
                tag_y2 = int(y1)
                tag_x1 = int(x1)
                tag_x2 = int(x1) + text_w + 6
                
                cv2.rectangle(annotated_img, (tag_x1, tag_y1), (tag_x2, tag_y2), color, -1)
                cv2.putText(
                    annotated_img,
                    label_text,
                    (tag_x1 + 3, tag_y2 - 3),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    font_scale,
                    (255, 255, 255),
                    font_thick,
                    cv2.LINE_AA
                )

    # Save annotated image
    output_dir.mkdir(parents=True, exist_ok=True)
    annotated_filename = f"annotated_{image_path.name}"
    annotated_path = output_dir / annotated_filename
    cv2.imwrite(str(annotated_path), annotated_img)
    
    return {
        "success": True,
        "message": f"Detection complete. Found {len(boxes_out)} road damage defect(s) ({pothole_count} pothole(s)).",
        "detection_count": len(boxes_out),
        "pothole_count": pothole_count,
        "inference_time_ms": round(inference_time, 2),
        "image_width": img_w,
        "image_height": img_h,
        "boxes": boxes_out,
        "classes_summary": classes_summary,
        "original_filename": image_path.name,
        "annotated_filename": annotated_filename,
        "annotated_path": annotated_path
    }
