import React from 'react';
import { 
  Info, 
  Target, 
  Workflow, 
  Cpu, 
  Database, 
  Globe2, 
  Compass, 
  ShieldCheck,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export default function AboutProject() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <Info size={28} color="#2563eb" /> About RoadPothole-AI
        </h1>
        <p className="page-subtitle">
          Intelligent Road Damage Detection and Civic Reporting System &bull; Academic & Engineering Overview
        </p>
      </div>

      {/* Problem & Vision */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="#2563eb" /> Problem Statement & Civic Mission
          </span>
        </div>
        <p style={{ color: '#334155', lineHeight: 1.7, marginBottom: '1rem' }}>
          Road potholes and surface degradation constitute major public safety hazards in developing infrastructure. Unaddressed road distress causes thousands of vehicular accidents, fatal traffic collisions, vehicle suspension wear, and severe traffic congestion. Conventional municipal road auditing relies on manual inspections, sporadic citizen complaints, or costly specialized sensor vans, creating prolonged response latencies.
        </p>
        <p style={{ color: '#334155', lineHeight: 1.7 }}>
          <strong>RoadPothole-AI</strong> introduces an automated computer vision and civic intelligence platform. By combining real-time <strong>YOLO object detection</strong> trained on Indian road damage imagery with an accessible civic reporting interface, the system empowers citizens and municipalities to identify, classify, and track road surface repairs with audit-grade transparency.
        </p>
      </div>

      {/* Architecture & Workflow */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Workflow size={20} color="#0d9488" /> End-to-End System Architecture
          </span>
        </div>
        <div className="grid-3" style={{ marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              1. Citizen & Imagery Ingestion
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              Civic uploads or dashcam imagery validated for dimensions and formats. Geolocation coordinates acquired via browser GPS API or manual address indexing.
            </p>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#0d9488', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              2. YOLO Neural Inference
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              Single-stage YOLO detector extracts localized bounding boxes, confidence probabilities, and categorizes across 9 RDD pavement distress classes (D00 - D50).
            </p>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
              3. Civic Registry & Analytics
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              Structured reports stored in SQLite with SQLAlchemy, exposing REST endpoints for analytics dashboards, municipal triage, and lifecycle status audits.
            </p>
          </div>
        </div>
      </div>

      {/* UN Sustainable Development Goals (SDGs) */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe2 size={20} color="#10b981" /> Alignment with UN Sustainable Development Goals
          </span>
        </div>
        <div className="grid-3">
          <div style={{
            padding: '1.25rem',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>
              SDG 3 &bull; Target 3.6
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', marginTop: '0.25rem' }}>
              Good Health & Well-being
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '0.5rem', lineHeight: 1.5 }}>
              Halving the global number of injuries and deaths from road traffic accidents by identifying deep potholes and surface collapse before collisions occur.
            </p>
          </div>

          <div style={{
            padding: '1.25rem',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
              SDG 9 &bull; Target 9.1
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginTop: '0.25rem' }}>
              Industry, Innovation & Infrastructure
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginTop: '0.5rem', lineHeight: 1.5 }}>
              Developing resilient, high-quality, and reliable road transportation networks through AI-assisted automated asset health monitoring.
            </p>
          </div>

          <div style={{
            padding: '1.25rem',
            borderRadius: '10px',
            background: '#f0fdfa',
            border: '1px solid #99f6e4'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
              SDG 11 &bull; Target 11.2
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#115e59', marginTop: '0.25rem' }}>
              Sustainable Cities & Communities
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#134e4a', marginTop: '0.5rem', lineHeight: 1.5 }}>
              Enhancing urban governance and civic transparency by providing accessible, participatory road reporting for all neighborhood residents.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies & Dataset */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="#2563eb" /> Technology Stack
            </span>
          </div>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: '35%' }}>Frontend</td>
                <td>React 18, Vite, React Router, Recharts, Lucide-React</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Backend API</td>
                <td>FastAPI, Uvicorn, Pydantic v2, Python 3.12</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Computer Vision</td>
                <td>Ultralytics YOLO (YOLOv8), OpenCV, Pillow, PyTorch</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Database</td>
                <td>SQLite with SQLAlchemy ORM (ACID compliant)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Testing & QA</td>
                <td>Pytest, FastAPI TestClient, validation scripts</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="#0d9488" /> Dataset Specifications & Lineage
            </span>
          </div>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: '35%' }}>Dataset</td>
                <td>RDD-India (Road Damage Detection - India)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Benchmark</td>
                <td>Global Road Damage Detection Challenge (GRDDC)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Images</td>
                <td>1,940 verified images (1,358 train / 388 val / 194 test)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Annotations</td>
                <td>2,088 bounding boxes (879 pothole instances in D40)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>License</td>
                <td>Creative Commons Attribution 4.0 International (CC BY 4.0)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations & Future Scope */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={18} color="#f59e0b" /> Limitations & Future Engineering Scope
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
          <p>
            &bull; <strong>Edge Acceleration:</strong> Quantization to ONNX / TensorRT for deployment on low-power NVIDIA Jetson edge processors mounted on municipal buses.
          </p>
          <p>
            &bull; <strong>3D Volumetric Depth:</strong> Integrating stereo-vision or LiDAR to estimate pothole volume (cubic meters of asphalt needed for repair).
          </p>
          <p>
            &bull; <strong>Automated Work Order Dispatch:</strong> Integrating with municipal ERP and open municipal work-order systems for direct contractor assignment.
          </p>
        </div>
      </div>
    </div>
  );
}
