from typing import Optional, List
import datetime
from pydantic import BaseModel, Field

class CivicReportCreate(BaseModel):
    image_filename: str
    annotated_filename: Optional[str] = None
    location_address: str = Field(..., min_length=3, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    description: Optional[str] = Field(None, max_length=1000)
    severity: str = Field("Medium", pattern="^(Low|Medium|High|Critical)$")
    detection_count: int = Field(0, ge=0)
    detected_classes: Optional[str] = "[]"

class CivicReportUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|In Progress|Scheduled|Resolved)$")
    admin_notes: Optional[str] = None

class CivicReportResponse(BaseModel):
    id: int
    report_id: str
    image_filename: str
    annotated_filename: Optional[str] = None
    original_image_url: str
    annotated_image_url: Optional[str] = None
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    severity: str
    detection_count: int
    detected_classes: str
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_reports: int
    total_analyzed_images: int
    total_detected_potholes: int
    pending_reports: int
    in_progress_reports: int
    resolved_reports: int
    severity_breakdown: dict
    status_breakdown: dict
    recent_reports: List[CivicReportResponse]
    detection_trend: List[dict]
