import os
import sys
import json
import time
from pathlib import Path

def train_yolo_model(
    data_yaml: Path,
    epochs: int = 10,
    imgsz: int = 416,
    batch: int = 8,
    model_name: str = "yolov8n.pt",
    device: str = "cpu",
    output_dir: Path = None,
    reports_dir: Path = None
):
    print("=== RoadPothole-AI YOLO Training ===")
    print(f"Data configuration: {data_yaml}")
    print(f"Epochs: {epochs}, Img Size: {imgsz}, Batch: {batch}, Device: {device}")
    
    if not data_yaml.exists():
        raise FileNotFoundError(f"data.yaml not found at {data_yaml}. Run prepare_dataset.py first.")
        
    try:
        from ultralytics import YOLO
    except ImportError:
        raise RuntimeError("ultralytics not installed. Install with 'pip install ultralytics'.")
        
    base_dir = data_yaml.parent.parent
    if output_dir is None:
        output_dir = base_dir / "models"
    if reports_dir is None:
        reports_dir = base_dir / "reports"
        
    output_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    start_time = time.time()
    
    # Initialize YOLO with nano backbone
    print(f"Loading pretrained architecture: {model_name}")
    model = YOLO(model_name)
    
    # Train model
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        workers=0,  # 0 workers is safest on Windows to prevent multiprocessing lockups
        project=str(reports_dir / "training"),
        name="roadpothole_run",
        exist_ok=True,
        verbose=True
    )
    
    total_training_time = time.time() - start_time
    print(f"Training completed in {total_training_time/60.0:.2f} minutes.")
    
    # Locate best.pt from run directory
    run_dir = reports_dir / "training" / "roadpothole_run"
    best_weights = run_dir / "weights" / "best.pt"
    
    if best_weights.exists():
        target_best = output_dir / "best.pt"
        import shutil
        shutil.copy2(best_weights, target_best)
        print(f"Saved best model weights to: {target_best}")
    else:
        print("Warning: best.pt not found in run directory.")
        
    # Evaluate on validation
    print("Running validation evaluation...")
    val_results = model.val(data=str(data_yaml), split="val", imgsz=imgsz, device=device)
    
    # Extract actual metrics
    metrics = {
        "model_name": model_name,
        "epochs": epochs,
        "imgsz": imgsz,
        "batch_size": batch,
        "device": device,
        "training_time_minutes": round(total_training_time / 60.0, 2),
        "precision": round(float(val_results.box.p.mean()) if hasattr(val_results.box, "p") else 0.0, 4),
        "recall": round(float(val_results.box.r.mean()) if hasattr(val_results.box, "r") else 0.0, 4),
        "mAP50": round(float(val_results.box.map50) if hasattr(val_results.box, "map50") else 0.0, 4),
        "mAP50_95": round(float(val_results.box.map) if hasattr(val_results.box, "map") else 0.0, 4),
        "fitness": round(float(val_results.fitness) if hasattr(val_results, "fitness") else 0.0, 4),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Save metrics report
    metrics_file = reports_dir / "model_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved model evaluation metrics to: {metrics_file}")
    
    return metrics

if __name__ == "__main__":
    y_yaml = Path(__file__).resolve().parent.parent.parent / "data" / "data.yaml"
    train_yolo_model(y_yaml, epochs=5, batch=8, imgsz=416, device="cpu")
