import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import CivicReport
from app.schemas.report import CivicReportCreate, CivicReportUpdate, CivicReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

def generate_report_id() -> str:
    today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"RPT-{today_str}-{short_uuid}"

def report_to_dict(r: CivicReport) -> dict:
    base_url = "/uploads"
    return {
        "id": r.id,
        "report_id": r.report_id,
        "image_filename": r.image_filename,
        "annotated_filename": r.annotated_filename,
        "original_image_url": f"{base_url}/{r.image_filename}",
        "annotated_image_url": f"{base_url}/{r.annotated_filename}" if r.annotated_filename else None,
        "location_address": r.location_address,
        "latitude": r.latitude,
        "longitude": r.longitude,
        "description": r.description,
        "severity": r.severity,
        "detection_count": r.detection_count,
        "detected_classes": r.detected_classes,
        "status": r.status,
        "created_at": r.created_at,
        "updated_at": r.updated_at
    }

@router.post("", response_model=CivicReportResponse)
def create_report(payload: CivicReportCreate, db: Session = Depends(get_db)):
    rid = generate_report_id()
    new_report = CivicReport(
        report_id=rid,
        image_filename=payload.image_filename,
        annotated_filename=payload.annotated_filename,
        location_address=payload.location_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        description=payload.description,
        severity=payload.severity,
        detection_count=payload.detection_count,
        detected_classes=payload.detected_classes,
        status="Pending"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return report_to_dict(new_report)

@router.get("", response_model=List[CivicReportResponse])
def list_reports(
    status: Optional[str] = Query(None, pattern="^(Pending|In Progress|Scheduled|Resolved)$"),
    severity: Optional[str] = Query(None, pattern="^(Low|Medium|High|Critical)$"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(CivicReport)
    if status:
        query = query.filter(CivicReport.status == status)
    if severity:
        query = query.filter(CivicReport.severity == severity)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (CivicReport.location_address.ilike(search_filter)) |
            (CivicReport.report_id.ilike(search_filter)) |
            (CivicReport.description.ilike(search_filter))
        )
    reports = query.order_by(desc(CivicReport.created_at)).offset(skip).limit(limit).all()
    return [report_to_dict(r) for r in reports]

@router.get("/{report_id}", response_model=CivicReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(CivicReport).filter(CivicReport.report_id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Report with ID '{report_id}' not found.")
    return report_to_dict(r)

@router.patch("/{report_id}", response_model=CivicReportResponse)
def update_report_status(report_id: str, payload: CivicReportUpdate, db: Session = Depends(get_db)):
    r = db.query(CivicReport).filter(CivicReport.report_id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Report with ID '{report_id}' not found.")
    r.status = payload.status
    db.commit()
    db.refresh(r)
    return report_to_dict(r)
