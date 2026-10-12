import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def create_test_image(format="JPEG", color="blue", size=(416, 416)) -> io.BytesIO:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf

# 1. Health check test
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "service" in data

# 2. Model info test
def test_model_info():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "classes" in data
    assert "5" in data["classes"] or 5 in data["classes"]
    assert "Pothole" in data["classes"].get(5, "") or "Pothole" in data["classes"].get("5", "")

# 3. Detection with invalid file extension
def test_detection_invalid_file_extension():
    fake_txt = io.BytesIO(b"This is a text file, not a road image.")
    response = client.post(
        "/api/detection",
        files={"image": ("test.txt", fake_txt, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]

# 4. Detection with corrupt image
def test_detection_corrupt_image():
    corrupt_bytes = io.BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00corrupt-bytes-here")
    response = client.post(
        "/api/detection",
        files={"image": ("bad.jpg", corrupt_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "Corrupt or invalid image" in response.json()["detail"]

# 5. Detection with valid image (clean asphalt image)
def test_detection_valid_image():
    img_buf = create_test_image(format="JPEG", color="gray")
    response = client.post(
        "/api/detection",
        files={"image": ("road_sample.jpg", img_buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "detection_count" in data
    assert "annotated_image_url" in data
    assert data["image_width"] == 416
    assert data["image_height"] == 416

# 6. Report creation & retrieval workflow
def test_create_and_retrieve_report():
    # Submit report
    payload = {
        "image_filename": "upload_sample.jpg",
        "annotated_filename": "annotated_upload_sample.jpg",
        "location_address": "MG Road, Test Sector 12",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "description": "Deep crater near bus shelter",
        "severity": "High",
        "detection_count": 2,
        "detected_classes": "[\"D40: 2\"]"
    }
    create_res = client.post("/api/reports", json=payload)
    assert create_res.status_code == 200
    report = create_res.json()
    assert "report_id" in report
    assert report["report_id"].startswith("RPT-")
    assert report["location_address"] == "MG Road, Test Sector 12"
    assert report["status"] == "Pending"

    # Retrieve by ID
    get_res = client.get(f"/api/reports/{report['report_id']}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["report_id"] == report["report_id"]

    # Update status to Scheduled
    patch_res = client.patch(
        f"/api/reports/{report['report_id']}",
        json={"status": "Scheduled"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Scheduled"

# 7. Report validation failures
def test_report_validation_failures():
    # Empty location
    bad_payload = {
        "image_filename": "sample.jpg",
        "location_address": "  ",
        "severity": "Medium"
    }
    res = client.post("/api/reports", json=bad_payload)
    # Pydantic or handler will reject
    assert res.status_code in [400, 422]

    # Invalid coordinates
    bad_coords = {
        "image_filename": "sample.jpg",
        "location_address": "Valid Road",
        "latitude": 250.0  # Latitude > 90
    }
    res = client.post("/api/reports", json=bad_coords)
    assert res.status_code == 422

# 8. Non-existent report retrieval
def test_get_nonexistent_report():
    res = client.get("/api/reports/RPT-99999999-NOTFOUND")
    assert res.status_code == 404

# 9. Dashboard summary metrics
def test_dashboard_summary():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()
    assert "total_reports" in summary
    assert "total_analyzed_images" in summary
    assert "status_breakdown" in summary
    assert "severity_breakdown" in summary
    assert "recent_reports" in summary
    assert "detection_trend" in summary
    assert summary["total_reports"] >= 1
