# RoadPothole-AI: Intelligent Road Damage Detection and Civic Reporting System

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![Ultralytics YOLO](https://img.shields.io/badge/YOLO-v8-00FFFF.svg)](https://ultralytics.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

RoadPothole-AI is an end-to-end full-stack computer vision platform and civic transparency system designed to detect, classify, and report pavement distress, potholes, and structural road failures in real-time.

---

## 1. Project Overview & Problem Statement

Road surface degradation—specifically potholes, alligator cracking, and road Cavitation—causes thousands of vehicular accidents, fatal traffic collisions, severe vehicle damage, and transport inefficiency in developing urban infrastructure.

Conventional municipal auditing relies on slow, manual inspections or sporadic citizen complaints. **RoadPothole-AI** automates this lifecycle by pairing:
1. **Ultralytics YOLO object detection** trained on benchmark Indian road damage imagery (**RDD-India**).
2. **FastAPI backend** serving safe inference, SQLite database persistence, and analytics.
3. **React + Vite civic interface** enabling citizens to analyze road photographs, obtain instant AI annotations with confidence scores, and register official civic repair reports.

---

## 2. System Architecture

```text
                        ┌──────────────────────────────────────────────┐
                        │              CITIZEN / MUNICIPAL UI          │
                        │           (React 18 + Vite + Recharts)       │
                        └──────────────────────┬───────────────────────┘
                                               │
                                 HTTP / JSON / Multipart
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │             FASTAPI REST API SERVER          │
                        │        (Endpoints, Auth, CORS, Static Files) │
                        └───────┬──────────────┬───────────────┬───────┘
                                │              │               │
                                ▼              ▼               ▼
                     ┌──────────────────┐ ┌─────────┐ ┌────────────────┐
                     │ COMPUTER VISION  │ │ SQLITE  │ │ STATIC STORAGE │
                     │   INFERENCE      │ │ DATABASE│ │                │
                     │ Ultralytics YOLO │ │ (ACID)  │ │ /uploads/      │
                     │ (9 RDD Classes)  │ └─────────┘ └────────────────┘
                     └──────────────────┘
```

---

## 3. Dataset Specifications & Verification

* **Dataset:** RDD-India (Road Damage Detection - India subset)
* **Lineage:** Global Road Damage Detection Challenge (GRDDC / CRDDC benchmark)
* **Total Images:** 1,940 verified images (100% readable, 0 corrupt files)
* **Resolution:** 416 &times; 416 RGB JPEG
* **Total Bounding Boxes:** 2,088 instances
* **Pothole Annotations:** Verified in Class ID `5` (`D40`) with **879 total instances** (most frequent defect)

### Taxonomic Class Schema (9 Classes)

| Class ID | Code | Classification | Description | Total Instances |
| :---: | :---: | :--- | :--- | :---: |
| `0` | `D00` | Linear Crack (Longitudinal) | Wheel mark longitudinal crack | 362 |
| `1` | `D01` | Linear Crack (Longitudinal) | Construction joint longitudinal crack | 43 |
| `2` | `D10` | Linear Crack (Transverse) | Equal interval transverse crack | 18 |
| `3` | `D11` | Linear Crack (Transverse) | Construction joint transverse crack | 14 |
| `4` | `D20` | Alligator Crack | Fatigue & structural mesh crack | 512 |
| **5** | **D40** | **Pothole / Bump / Rutting** | **Potholes & surface cavitation (Primary)** | **879** |
| `6` | `D43` | Crosswalk Blur | Pedestrian crossing degradation | 16 |
| `7` | `D44` | White Line Blur | Lane boundary line fading | 236 |
| `8` | `D50` | Manhole Cover | Utility access covers | 8 |

---

## 4. Screens & Features

1. **Dashboard (`/`):**
   * Real-time metrics: Total Reports, Analyzed Images, Detected Defect Count, Pending / Resolved ratio.
   * 7-day activity bar charts and report status pie charts powered by Recharts.
   * Recent reports table with click-to-audit navigation.

2. **Detect Pothole (`/detect`):**
   * Drag-and-drop road photograph uploader with client validation.
   * Adjustable confidence threshold slider (10% &ndash; 80%).
   * Side-by-side / tabbed view of original vs annotated bounding-box imagery.
   * Defect table with confidence scores and normalized coordinates.
   * One-click *"Submit as Civic Report"* button pre-filling evidence into the reporting pipeline.

3. **Report Road Damage (`/report`):**
   * Street location and address field.
   * Browser GPS Geolocation integration button (*"Use My Current Location"*).
   * Severity selection (Low, Medium, High, Critical).
   * Automatic image attachment and AI verification tagging.
   * Unique reference ID generation (e.g. `RPT-20261012-XXXX`).

4. **Reports History (`/history`):**
   * Instant keyword search across street addresses, report IDs, and notes.
   * Status and severity filtering dropdowns.
   * Detailed modal view with evidence inspection and administrative status updater (Pending &rarr; In Progress &rarr; Scheduled &rarr; Resolved).

5. **Model Performance (`/performance`):**
   * Actual Precision, Recall, mAP@50, and mAP@50-95 metrics.
   * Dataset breakdown across splits (Train: 1,358, Val: 388, Test: 194).
   * Training hyperparameters and complete 9-class RDD catalog.

6. **About Project (`/about`):**
   * Problem statement and engineering objectives.
   * End-to-end architecture walkthrough.
   * Alignment with UN Sustainable Development Goals (SDG 3, SDG 9, SDG 11).
   * Technology stack and future roadmap.

---

## 5. Getting Started & Installation

### Prerequisites
* **Python:** 3.10+ (tested on Python 3.12)
* **Node.js:** v18+ (tested on v24)
* **npm:** v9+

### Backend Setup

```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Prepare dataset (converts RDD-India into Ultralytics YOLO format)
python app/ml/prepare_dataset.py

# Validate dataset integrity
python app/ml/validate_dataset.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

---

## 6. API Documentation

Once the backend is running, access Swagger UI at:  
`http://localhost:8000/docs`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server and database health check |
| `POST` | `/api/detection` | Upload road image for YOLO defect inference |
| `GET` | `/api/dashboard/summary` | Aggregated metrics and timeline charts |
| `POST` | `/api/reports` | Submit a new civic road damage report |
| `GET` | `/api/reports` | List reports with search and filter parameters |
| `GET` | `/api/reports/{report_id}` | Retrieve report by unique reference ID |
| `PATCH`| `/api/reports/{report_id}` | Update municipal resolution status |
| `GET` | `/api/model-info` | Telemetry on model weights, classes, and mAP |

---

## 7. Running Tests

Execute the comprehensive Pytest suite:

```bash
cd backend
pytest -v tests/test_api.py
```

---

## 8. Alignment with UN Sustainable Development Goals (SDGs)

* **SDG 3: Good Health and Well-being (Target 3.6):** Halving road traffic deaths and injuries by detecting hazardous road craters before vehicles hit them.
* **SDG 9: Industry, Innovation, and Infrastructure (Target 9.1):** Developing resilient, high-quality, and sustainable road transportation infrastructure through proactive AI diagnostics.
* **SDG 11: Sustainable Cities and Communities (Target 11.2):** Fostering smart, participatory urban governance and equitable civic repair transparency.

---

## 9. License

This project is licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license based on RDD-India dataset terms.
