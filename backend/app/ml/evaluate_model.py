import os
import sys
import json
from pathlib import Path

def evaluate_model(
    model_path: Path,
    data_yaml: Path,
    split: str = "test",
    imgsz: int = 416,
    device: str = "cpu"
) -> dict:
    print(f"=== Evaluating YOLO Model on {split} set ===")
    print(f"Model: {model_path}")
    print(f"Data: {data_yaml}")
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model file '{model_path}' not found.")
    if not data_yaml.exists():
        raise FileNotFoundError(f"data.yaml not found at '{data_yaml}'.")
        
    try:
        from ultralytics import YOLO
    except ImportError:
        raise RuntimeError("ultralytics not installed.")
        
    model = YOLO(str(model_path))
    val_results = model.val(data=str(data_yaml), split=split, imgsz=imgsz, device=device)
    
    metrics = {
        "model_path": str(model_path),
        "split": split,
        "precision": round(float(val_results.box.p.mean()) if hasattr(val_results.box, "p") else 0.0, 4),
        "recall": round(float(val_results.box.r.mean()) if hasattr(val_results.box, "r") else 0.0, 4),
        "mAP50": round(float(val_results.box.map50) if hasattr(val_results.box, "map50") else 0.0, 4),
        "mAP50_95": round(float(val_results.box.map) if hasattr(val_results.box, "map") else 0.0, 4),
        "class_names": model.names
    }
    
    print("\n--- Evaluation Results ---")
    print(f"Split: {split}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"mAP@50:    {metrics['mAP50']:.4f}")
    print(f"mAP@50-95: {metrics['mAP50_95']:.4f}")
    
    reports_dir = data_yaml.parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    out_file = reports_dir / f"evaluation_{split}_metrics.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved evaluation report to {out_file}")
    
    return metrics

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent.parent
    m_path = base / "models" / "best.pt"
    d_path = base / "data" / "data.yaml"
    if not m_path.exists():
        m_path = base / "models" / "yolov8n.pt"
    evaluate_model(m_path, d_path)
