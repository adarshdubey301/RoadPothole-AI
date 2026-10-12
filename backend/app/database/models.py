import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database.session import Base

class CivicReport(Base):
    __tablename__ = "civic_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(64), unique=True, index=True, nullable=False)
    image_filename = Column(String(255), nullable=False)
    annotated_filename = Column(String(255), nullable=True)
    location_address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    severity = Column(String(32), default="Medium")
    detection_count = Column(Integer, default=0)
    detected_classes = Column(Text, default="[]")  # JSON-encoded array
    status = Column(String(32), default="Pending") # Pending, In Progress, Scheduled, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(255), nullable=False)
    annotated_filename = Column(String(255), nullable=True)
    detection_count = Column(Integer, default=0)
    detections_summary = Column(Text, default="[]")  # JSON string
    inference_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
