# RoadPothole-AI: Road Pothole Detection & Civic Reporting System
## Dataset Inspection & Validation Report (`DATASET_INSPECTION.md`)

**Date:** October 12, 2026  
**Workspace:** `e:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI`  
**Dataset Path:** `e:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI\dataset_Original`  
**Inspection Status:** Completed  

---

## 1. Executive Summary

A comprehensive automated inspection and integrity verification was conducted on the extracted dataset inside `dataset_Original`.

* **Dataset Origin:** **RDD-India (Road Damage Detection - India)** exported from Roboflow Universe (`https://universe.roboflow.com/road-damage-detection-b5a1c/rdd-india`), derived from the benchmark Global Road Damage Detection Challenge (GRDDC).
* **Total Image Count:** **1,940 images** (100% verified, 0 corrupt images).
* **Image Format & Resolution:** 416 × 416 pixels, 3-channel RGB JPEG format.
* **Total Bounding Boxes:** **2,088 instances** across all splits.
* **Pothole Annotations:** **Verified present**. Potholes correspond to Class ID `5` (`D40`), representing the single largest damage category in the dataset with **879 total instances** (42.1% of all annotations).
* **Ultralytics YOLO Compatibility:** **Requires Conversion**. The dataset was exported in **YOLO v4 PyTorch / Darknet format** (single `_annotations.txt` file per split with absolute pixel coordinates), whereas Ultralytics YOLO (`YOLOv8`/`YOLO11`) requires individual `.txt` label files per image with normalized `(x_center, y_center, width, height)` coordinates.
* **Integrity Status:** Original dataset files were preserved untouched with zero modifications or deletions. An empty 0-byte `data.yaml` has been configured with the verified 9 RDD classes.

---

## 2. Directory Structure & Splits

The dataset contains three predefined splits: `train`, `valid`, and `test`.

```text
e:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI\dataset_Original\
├── README.dataset.txt          # Source URL & license info (CC BY 4.0)
├── README.roboflow.txt         # Roboflow export info & preprocessing specs
├── data.yaml                   # Ultralytics dataset configuration (configured)
├── train\                      # 1,358 JPG images + _annotations.txt + _classes.txt
├── valid\                      # 388 JPG images + _annotations.txt + _classes.txt
└── test\                       # 194 JPG images + _annotations.txt + _classes.txt
```

### Verified Split Counts

| Split | Images on Disk | Images in `_annotations.txt` | Images With Damage Bounding Boxes | Background / Negative Images (0 boxes) | Total Damage Bounding Boxes | Corrupt Images |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Train** | 1,358 | 1,358 | 670 | 688 | 1,432 | 0 |
| **Validation** | 388 | 388 | 190 | 198 | 457 | 0 |
| **Test** | 194 | 194 | 99 | 95 | 199 | 0 |
| **Total** | **1,940** | **1,940** | **959** | **981** | **2,088** | **0** |

> [!NOTE]
> The presence of 981 background / negative images (images of clear roads with no potholes or damage) is standard in modern object detection datasets. Ultralytics YOLO utilizes empty label files for negative samples to significantly reduce false positive rates in real-world deployment.

---

## 3. Verified Classes and Taxonomic Mapping

The class names and IDs were extracted directly from `_classes.txt` (present identically in `train`, `valid`, and `test`). These match the official classification system from the **Global Road Damage Detection (GRDDC / RDD2020)** benchmark:

| Class ID | Class Code | Official RDD Classification | Category Description |
| :---: | :---: | :--- | :--- |
| `0` | `D00` | Linear Crack (Longitudinal) | Wheel mark longitudinal crack |
| `1` | `D01` | Linear Crack (Longitudinal) | Construction joint longitudinal crack |
| `2` | `D10` | Linear Crack (Transverse) | Equal interval transverse crack |
| `3` | `D11` | Linear Crack (Transverse) | Construction joint transverse crack |
| `4` | `D20` | Alligator Crack | Fatigue / mesh structural failure crack |
| **5** | **D40** | **Pothole / Bump / Rutting** | **Potholes, pavement depression, surface separation** |
| `6` | `D43` | Crosswalk Blur | Blurring / degradation of pedestrian crossings |
| `7` | `D44` | White Line Blur | Blurring / degradation of lane markings |
| `8` | `D50` | Manhole Cover | Road utility covers / manholes |

---

## 4. Class Distribution & Pothole Frequency

The frequency of each damage class across all splits is detailed below:

| Class ID | Code | Category | Train Count | Valid Count | Test Count | Total Instances | Dataset Share |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **5** | **D40** | **Pothole / Rutting / Bump** | **613** | **195** | **71** | **879** | **42.10%** |
| `4` | `D20` | Alligator Crack | 365 | 100 | 47 | 512 | 24.52% |
| `0` | `D00` | Longitudinal Crack | 237 | 84 | 41 | 362 | 17.34% |
| `7` | `D44` | White Line Blur | 155 | 51 | 30 | 236 | 11.30% |
| `1` | `D01` | Longitudinal Joint Crack | 28 | 11 | 4 | 43 | 2.06% |
| `2` | `D10` | Transverse Crack | 13 | 3 | 2 | 18 | 0.86% |
| `6` | `D43` | Crosswalk Blur | 10 | 5 | 1 | 16 | 0.77% |
| `3` | `D11` | Transverse Joint Crack | 6 | 6 | 2 | 14 | 0.67% |
| `8` | `D50` | Manhole Cover | 5 | 2 | 1 | 8 | 0.38% |
| **Total** | — | — | **1,432** | **457** | **199** | **2,088** | **100.0%** |

### Key Observations for RoadPothole-AI:
1. **Dominant Pothole Signal:** Class `5` (`D40` - Pothole) has **879 annotations**, making it the single most common defect in the dataset.
2. **Structural Crack Co-occurrence:** Alligator cracks (`D20`, 512 instances) and longitudinal cracks (`D00`, 362 instances) represent significant road surface damage often preceding potholes, providing valuable multi-hazard detection capabilities.
3. **Severe Class Imbalance on Minor Classes:** Classes `D10`, `D11`, `D43`, and `D50` have fewer than 20 instances each.

---

## 5. Dataset Compatibility Analysis

### Can this dataset be used directly with Ultralytics YOLO?

> [!WARNING]
> **NO, it CANNOT be used directly in its current state without label conversion.**

#### Technical Root Cause:
* **Current Format:** The dataset is packaged in **YOLO v4 PyTorch / Darknet text format**.
  - All labels are consolidated into a single file per split: `train/_annotations.txt`, `valid/_annotations.txt`, `test/_annotations.txt`.
  - Format per line: `<image_filename> <xmin,ymin,xmax,ymax,class_id> ...` using absolute pixel coordinates (e.g. `233,290,311,314,5`).
* **Ultralytics YOLO Requirement:**
  - Requires **individual `.txt` files** for each image (e.g., `India_000000_jpg.rf.xxxx.txt`).
  - Requires **normalized floating-point coordinates**: `<class_id> <x_center> <y_center> <width> <height>` where values range from `0.0` to `1.0`.
  - Expects empty `.txt` files for negative/background images.

If Ultralytics YOLO is run directly on the existing `dataset_Original` folder right now, it will look for individual `.txt` files corresponding to each image, find zero label files, and emit:
`WARNING ⚠️ No labels found in dataset ... 0 images with labels, 1358 images without labels`.

---

## 6. Generated `data.yaml` Configuration

The `data.yaml` file located at `e:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI\dataset_Original\data.yaml` has been populated to preserve all 9 verified road damage classes:

```yaml
# RoadPothole-AI: Road Damage and Pothole Detection Dataset Configuration
# Source: RDD-India (Roboflow Universe - YOLO v4 PyTorch export)

path: E:/ADARSH DUBEY/ADARSH/AI_ML/Roadpothole_AI/dataset_Original
train: train
val: valid
test: test

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
```

---

## 7. How to Prepare & Verify the Dataset for YOLO

### Step A: Conversion Strategy (Non-Destructive)
To convert the annotations without altering or risking the original dataset, a conversion script will:
1. Read `_annotations.txt` from each split.
2. For each image, calculate normalized coordinates:
   $$\text{x\_center} = \frac{x_{\min} + x_{\max}}{2 \times W}$$
   $$\text{y\_center} = \frac{y_{\min} + y_{\max}}{2 \times H}$$
   $$\text{width} = \frac{x_{\max} - x_{\min}}{W}$$
   $$\text{height} = \frac{y_{\max} - y_{\min}}{H}$$
   *(where $W = 416, H = 416$)*.
3. Write individual `.txt` label files for all images (and empty files for background images).
4. This can either be written directly alongside the images or into a dedicated `labels/` directory, or exported to a clean `dataset_yolo/` directory.

### Step B: Verification Script
Once converted and with `ultralytics` installed, load and verify dataset integrity with Python without running training:

```python
from ultralytics.data.utils import check_det_dataset

# Validates paths, splits, and labels
dataset_info = check_det_dataset(r"E:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI\dataset_Original\data.yaml")
print("Dataset verification succeeded!")
print("Classes:", dataset_info['names'])
```

Or via CLI validation check:
```bash
yolo val detect data="E:\ADARSH DUBEY\ADARSH\AI_ML\Roadpothole_AI\dataset_Original\data.yaml" model=yolov8n.pt batch=1
```

---

## 8. Next Steps (Pending Confirmation)

Model training has **not** been started as requested. Awaiting confirmation on:
1. **Conversion Mode:** Whether to:
   - **Option 1 (Recommended):** Create a clean converted dataset directory (`dataset_converted/`) with standard Ultralytics structure (`images/train`, `labels/train`, etc.), leaving `dataset_Original` 100% pristine.
   - **Option 2:** Generate the individual `.txt` label files directly alongside the `.jpg` files inside `dataset_Original`.
2. **Class Scope for Training:**
   - Train on all 9 multi-class road damage categories (`D00` through `D50`).
   - Or filter/remap exclusively to single-class Pothole (`D40`) for dedicated pothole reporting.
