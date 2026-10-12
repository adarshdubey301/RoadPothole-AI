import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.session import get_db
from app.database.models import CivicReport, DetectionLog
from app.schemas.report import DashboardSummaryResponse, CivicReportResponse
from app.api.routes.reports import report_to_dict

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Total reports
    total_reports = db.query(CivicReport).count()
    
    # Total analyzed images from DetectionLog
    total_analyzed_images = db.query(DetectionLog).count()
    
    # Detected potholes sum
    total_detected_potholes = db.query(func.sum(CivicReport.detection_count)).scalar() or 0
    # Also include detection log count if reports are fewer
    log_detection_count = db.query(func.sum(DetectionLog.detection_count)).scalar() or 0
    total_detections = max(int(total_detected_potholes), int(log_detection_count))
    
    # Reports by status
    pending_count = db.query(CivicReport).filter(CivicReport.status == "Pending").count()
    in_progress_count = db.query(CivicReport).filter(CivicReport.status == "In Progress").count()
    resolved_count = db.query(CivicReport).filter(CivicReport.status == "Resolved").count()
    scheduled_count = db.query(CivicReport).filter(CivicReport.status == "Scheduled").count()
    
    status_breakdown = {
        "Pending": pending_count,
        "In Progress": in_progress_count,
        "Scheduled": scheduled_count,
        "Resolved": resolved_count
    }
    
    # Severity breakdown
    severity_breakdown = {
        "Low": db.query(CivicReport).filter(CivicReport.severity == "Low").count(),
        "Medium": db.query(CivicReport).filter(CivicReport.severity == "Medium").count(),
        "High": db.query(CivicReport).filter(CivicReport.severity == "High").count(),
        "Critical": db.query(CivicReport).filter(CivicReport.severity == "Critical").count()
    }
    
    # Recent 5 reports
    recent_records = db.query(CivicReport).order_by(desc(CivicReport.created_at)).limit(5).all()
    recent_reports = [CivicReportResponse(**report_to_dict(r)) for r in recent_records]
    
    # Detection activity timeline (last 7 days or sample grouped)
    trend = []
    today = datetime.datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        
        rep_count = db.query(CivicReport).filter(
            CivicReport.created_at >= day_start,
            CivicReport.created_at <= day_end
        ).count()
        
        det_count = db.query(DetectionLog).filter(
            DetectionLog.created_at >= day_start,
            DetectionLog.created_at <= day_end
        ).count()
        
        trend.append({
            "date": day.strftime("%b %d"),
            "reports": rep_count,
            "detections": det_count
        })
        
    return DashboardSummaryResponse(
        total_reports=total_reports,
        total_analyzed_images=total_analyzed_images,
        total_detected_potholes=total_detections,
        pending_reports=pending_count,
        in_progress_reports=in_progress_count,
        resolved_reports=resolved_count,
        severity_breakdown=severity_breakdown,
        status_breakdown=status_breakdown,
        recent_reports=recent_reports,
        detection_trend=trend
    )
