import os
import sys
import json
import shutil
from pathlib import Path
from collections import Counter, defaultdict
from PIL import Image, ImageDraw, ImageFont

# Official RDD taxonomic mapping
RDD_CLASSES = {
    0: "D00",  # Linear crack (longitudinal - wheel mark)
    1: "D01",  # Linear crack (longitudinal - construction joint)
    2: "D10",  # Linear crack (transverse - equal interval)
    3: "D11",  # Linear crack (transverse - construction joint)
    4: "D20",  # Alligator crack (fatigue / mesh)
    5: "D40",  # Pothole / rutting / bump / road damage
    6: "D43",  # Crosswalk blur
    7: "D44",  # White line blur
    8: "D50"   # Manhole cover
}

RDD_DESCRIPTIONS = {
    "D00": "Wheel mark longitudinal linear crack",
    "D01": "Construction joint longitudinal linear crack",
    "D10": "Equal interval transverse linear crack",
    "D11": "Construction joint transverse linear crack",
    "D20": "Alligator / fatigue mesh crack",
    "D40": "Pothole, bump, rutting, and road surface depression",
    "D43": "Crosswalk degradation and blur",
    "D44": "White line and lane marking blur",
    "D50": "Manhole cover and utility access"
}

def prepare_dataset(
    source_dir: Path,
    output_dir: Path,
    reports_dir: Path
) -> dict:
    print(f"=== Starting Dataset Preparation ===")
    print(f"Source Directory: {source_dir}")
    print(f"Output Directory: {output_dir}")
    
    if not source_dir.exists():
        raise FileNotFoundError(f"Source dataset directory '{source_dir}' does not exist.")
        
    output_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    # Subdirectories for standard Ultralytics YOLO format
    for split in ["train", "val", "test"]:
        (output_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (output_dir / "labels" / split).mkdir(parents=True, exist_ok=True)
        
    split_mapping = {
        "train": "train",
        "valid": "val",
        "test": "test"
    }
    
    dataset_report = {
        "dataset_name": "RDD-India (Road Damage Detection - India)",
        "source_path": str(source_dir),
        "target_path": str(output_dir),
        "classes": RDD_CLASSES,
        "class_descriptions": RDD_DESCRIPTIONS,
        "pothole_class_id": 5,
        "pothole_class_name": "D40",
        "splits": {},
        "total_images": 0,
        "total_annotations": 0,
        "total_potholes": 0
    }
    
    sample_visualized = False
    
    for src_split, target_split in split_mapping.items():
        src_split_dir = source_dir / src_split
        if not src_split_dir.exists():
            print(f"Warning: source split {src_split_dir} not found. Skipping.")
            continue
            
        annot_file = src_split_dir / "_annotations.txt"
        classes_file = src_split_dir / "_classes.txt"
        
        annot_data = defaultdict(list)
        if annot_file.exists():
            with open(annot_file, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    parts = line.split()
                    img_name = parts[0]
                    for box_str in parts[1:]:
                        try:
                            coords = [int(v) for v in box_str.split(",")]
                            if len(coords) == 5:
                                xmin, ymin, xmax, ymax, cid = coords
                                annot_data[img_name].append((xmin, ymin, xmax, ymax, cid))
                        except Exception as e:
                            print(f"Malformed box: {box_str} ({e})")
                            
        # Iterate over all images in source split
        img_files = sorted(list(src_split_dir.glob("*.jpg")) + list(src_split_dir.glob("*.jpeg")) + list(src_split_dir.glob("*.png")))
        
        split_stats = {
            "image_count": len(img_files),
            "annotated_images": 0,
            "background_images": 0,
            "total_boxes": 0,
            "class_distribution": Counter()
        }
        
        for img_path in img_files:
            img_name = img_path.name
            target_img_path = output_dir / "images" / target_split / img_name
            target_label_path = output_dir / "labels" / target_split / f"{img_path.stem}.txt"
            
            # Copy image to processed directory
            if not target_img_path.exists():
                shutil.copy2(img_path, target_img_path)
                
            boxes = annot_data.get(img_name, [])
            
            # Read image dimensions
            try:
                with Image.open(img_path) as im:
                    w, h = im.size
            except Exception:
                w, h = 416, 416
                
            label_lines = []
            if boxes:
                split_stats["annotated_images"] += 1
                for xmin, ymin, xmax, ymax, cid in boxes:
                    # Clip coordinates to image boundary
                    xmin = max(0, min(xmin, w))
                    xmax = max(0, min(xmax, w))
                    ymin = max(0, min(ymin, h))
                    ymax = max(0, min(ymax, h))
                    
                    bw = xmax - xmin
                    bh = ymax - ymin
                    if bw <= 0 or bh <= 0:
                        continue
                        
                    x_center = (xmin + xmax) / (2.0 * w)
                    y_center = (ymin + ymax) / (2.0 * h)
                    norm_w = bw / float(w)
                    norm_h = bh / float(h)
                    
                    label_lines.append(f"{cid} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")
                    split_stats["class_distribution"][cid] += 1
                    split_stats["total_boxes"] += 1
                    if cid == 5:
                        dataset_report["total_potholes"] += 1
            else:
                split_stats["background_images"] += 1
                
            # Write normalized YOLO label file (empty for background)
            with open(target_label_path, "w", encoding="utf-8") as lf:
                if label_lines:
                    lf.write("\n".join(label_lines) + "\n")
                    
            # Visualise sample annotation for report
            if not sample_visualized and boxes and target_split == "train":
                try:
                    with Image.open(img_path) as im:
                        draw = ImageDraw.Draw(im)
                        for xmin, ymin, xmax, ymax, cid in boxes:
                            cname = RDD_CLASSES.get(cid, str(cid))
                            color = "#ef4444" if cid == 5 else "#3b82f6"
                            draw.rectangle([xmin, ymin, xmax, ymax], outline=color, width=3)
                            draw.text((xmin + 2, ymin + 2), f"{cname} ({cid})", fill=color)
                        im.save(reports_dir / "sample_annotated.jpg")
                        sample_visualized = True
                except Exception as ex:
                    print(f"Sample visualization note: {ex}")

        split_stats["class_distribution"] = dict(split_stats["class_distribution"])
        dataset_report["splits"][target_split] = split_stats
        dataset_report["total_images"] += split_stats["image_count"]
        dataset_report["total_annotations"] += split_stats["total_boxes"]
        
        print(f"Split '{target_split}': {split_stats['image_count']} images, {split_stats['total_boxes']} boxes")

    # Generate data.yaml in output_dir
    yaml_content = f"""# Ultralytics YOLO Data Configuration for RoadPothole-AI
# Processed from RDD-India

path: {output_dir.as_posix()}
train: images/train
val: images/val
test: images/test

nc: 9

names:
  0: D00
  1: D01
  2: D10
  3: D11
  4: D20
  5: D40
  6: D43
  7: D44
  8: D50
"""
    yaml_path = output_dir.parent / "data.yaml"
    with open(yaml_path, "w", encoding="utf-8") as yf:
        yf.write(yaml_content)
    print(f"Generated YAML at: {yaml_path}")
    
    # Save dataset report
    report_file = reports_dir / "dataset_report.json"
    with open(report_file, "w", encoding="utf-8") as rf:
        json.dump(dataset_report, rf, indent=2)
    print(f"Saved dataset report at: {report_file}")
    
    return dataset_report

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent.parent
    src = base / "data" / "dataset_original"
    out = base / "data" / "processed"
    rep = base / "reports"
    prepare_dataset(src, out, rep)
