import sys
from pathlib import Path
import yaml

def validate_dataset(yaml_path: Path) -> bool:
    print(f"=== Validating YOLO Dataset from {yaml_path} ===")
    if not yaml_path.exists():
        print(f"ERROR: Dataset YAML not found at {yaml_path}")
        return False
        
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
        
    base_path = Path(data.get("path", yaml_path.parent))
    splits = {
        "train": base_path / data.get("train", "images/train"),
        "val": base_path / data.get("val", "images/val"),
        "test": base_path / data.get("test", "images/test")
    }
    
    total_images = 0
    total_labels = 0
    errors = []
    
    for split_name, img_dir in splits.items():
        if not img_dir.exists():
            errors.append(f"Missing images directory for split '{split_name}': {img_dir}")
            continue
            
        label_dir = img_dir.parent.parent / "labels" / split_name
        if not label_dir.exists():
            errors.append(f"Missing labels directory for split '{split_name}': {label_dir}")
            continue
            
        images = list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png"))
        labels = list(label_dir.glob("*.txt"))
        
        total_images += len(images)
        total_labels += len(labels)
        
        print(f"Split '{split_name}': {len(images)} images, {len(labels)} label files")
        
        # Check label matching
        image_stems = {im.stem for im in images}
        label_stems = {lb.stem for lb in labels}
        
        missing_labels = image_stems - label_stems
        if missing_labels:
            errors.append(f"Split '{split_name}' has {len(missing_labels)} images missing corresponding .txt labels")
            
        # Sample label validation
        for lb in labels[:50]:
            with open(lb, "r", encoding="utf-8") as lf:
                for line in lf:
                    parts = line.strip().split()
                    if not parts:
                        continue
                    if len(parts) != 5:
                        errors.append(f"Invalid label format in {lb.name}: '{line}'")
                        break
                    cid, xc, yc, w, h = int(parts[0]), float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                    if not (0 <= cid <= 8):
                        errors.append(f"Invalid class ID {cid} in {lb.name}")
                    if not (0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0 and 0.0 <= w <= 1.0 and 0.0 <= h <= 1.0):
                        errors.append(f"Coordinates out of bounds in {lb.name}: xc={xc}, yc={yc}, w={w}, h={h}")

    if errors:
        print("\n[ERROR] Dataset Validation FAILED with errors:")
        for err in errors[:10]:
            print(f"  - {err}")
        return False
    else:
        print(f"\n[SUCCESS] Dataset Validation PASSED! Verified {total_images} images and {total_labels} label files.")
        return True

if __name__ == "__main__":
    y_path = Path(__file__).resolve().parent.parent.parent / "data" / "data.yaml"
    success = validate_dataset(y_path)
    sys.exit(0 if success else 1)
