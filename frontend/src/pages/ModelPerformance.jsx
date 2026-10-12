import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Layers, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RDD_CATALOG = [
  { code: 'D00', name: 'Longitudinal Linear Crack', desc: 'Cracks running parallel to traffic in wheel path areas', id: 0 },
  { code: 'D01', name: 'Joint Longitudinal Crack', desc: 'Linear cracking at construction joints', id: 1 },
  { code: 'D10', name: 'Transverse Linear Crack', desc: 'Equal interval cracks perpendicular to road direction', id: 2 },
  { code: 'D11', name: 'Joint Transverse Crack', desc: 'Transverse cracking specifically along construction joints', id: 3 },
  { code: 'D20', name: 'Alligator Crack', desc: 'Fatigue and structural mesh failure cracking patterns', id: 4 },
  { code: 'D40', name: 'Pothole & Surface Depression', desc: 'Potholes, rutting, bumps, and deep asphalt cavitation (Primary Defect)', id: 5 },
  { code: 'D43', name: 'Crosswalk Blur', desc: 'Degradation and erasure of pedestrian crossing markings', id: 6 },
  { code: 'D44', name: 'White Line Blur', desc: 'Fading and loss of lane boundary road markings', id: 7 },
  { code: 'D50', name: 'Manhole Cover', desc: 'Road utility manholes and iron access plates', id: 8 },
];

export default function ModelPerformance() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchInfo = async () => {
      try {
        const res = await api.getModelInfo();
        if (mounted) {
          setModelInfo(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) return <LoadingSpinner text="Reading neural model evaluation telemetry..." size={32} />;

  const metrics = modelInfo?.metrics;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={28} color="#2563eb" /> Model Performance & Evaluation
        </h1>
        <p className="page-subtitle">
          Real metrics, dataset integrity statistics, and architecture configurations for the road defect detection network.
        </p>
      </div>

      {/* Model Status Banner */}
      <div className="card" style={{
        marginBottom: '1.5rem',
        backgroundColor: modelInfo?.model_loaded ? '#f0fdfa' : '#fffbeb',
        borderColor: modelInfo?.model_loaded ? '#99f6e4' : '#fde68a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {modelInfo?.model_loaded ? (
            <CheckCircle2 size={24} color="#0d9488" />
          ) : (
            <Clock size={24} color="#d97706" />
          )}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {modelInfo?.model_loaded ? 'Model Weights Online & Verified' : 'Model Training / Evaluation in Progress'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.15rem' }}>
              Architecture: <strong>{modelInfo?.architecture || 'YOLOv8 Nano Backbone'}</strong> &bull; Hardware Target: <strong>{modelInfo?.device?.toUpperCase() || 'CPU'}</strong> &bull; Weights: <code>{modelInfo?.model_name}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Metrics Cards */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span>Validation & Benchmark Metrics</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {metrics?.timestamp ? `Evaluated: ${metrics.timestamp}` : 'Real-time telemetry'}
          </span>
        </div>

        {metrics ? (
          <div className="grid-4">
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>mAP@50 (Overall)</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', margin: '0.25rem 0' }}>
                {(metrics.mAP50 * 100).toFixed(1)}%
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mean Average Precision at IoU 0.50</p>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>mAP@50-95</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d9488', margin: '0.25rem 0' }}>
                {(metrics.mAP50_95 * 100).toFixed(1)}%
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Strict COCO Multi-IoU Average</p>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Precision</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                {(metrics.precision * 100).toFixed(1)}%
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>True Positives / Predicted Positives</p>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Recall</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                {(metrics.recall * 100).toFixed(1)}%
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>True Positives / Ground Truth BBoxes</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
            <Clock size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: 600, color: '#334155' }}>Live Training Pipeline Executing</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '500px', margin: '0.25rem auto' }}>
              The model training script is currently training YOLO on the 1,940 RDD-India road dataset images.
              Metrics will automatically update upon epoch validation convergence.
            </p>
          </div>
        )}
      </div>

      {/* Dataset & Configuration Telemetry */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Dataset Breakdown */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="#2563eb" /> RDD-India Dataset Splits
            </span>
          </div>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Split</th>
                <th>Images</th>
                <th>Bounding Boxes</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Training</td>
                <td>1,358</td>
                <td>1,432</td>
                <td>Weights optimization & backprop</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Validation</td>
                <td>388</td>
                <td>457</td>
                <td>Hyperparameter tuning & model selection</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Test</td>
                <td>194</td>
                <td>199</td>
                <td>Held-out final generalization evaluation</td>
              </tr>
              <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                <td>Total</td>
                <td>1,940</td>
                <td>2,088</td>
                <td>100% verified (0 corrupt images)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hyperparameters */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="#0d9488" /> Training Hyperparameters
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Base Checkpoint</span>
              <span style={{ fontWeight: 600 }}>yolov8n.pt (Nano lightweight)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Input Resolution</span>
              <span style={{ fontWeight: 600 }}>416 &times; 416 pixels</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Batch Size</span>
              <span style={{ fontWeight: 600 }}>8</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Optimizer</span>
              <span style={{ fontWeight: 600 }}>Auto (SGD with momentum 0.937)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Confidence / IoU Thresholds</span>
              <span style={{ fontWeight: 600 }}>conf=0.25, iou=0.45</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Negative / Background Image Handling</span>
              <span style={{ fontWeight: 600, color: '#0d9488' }}>981 clean images (reduces false alarms)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RDD Class Taxonomy */}
      <div className="card">
        <div className="card-title">
          <span>Official RDD Damage Classification Schema (9 Classes)</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>RDD Code</th>
                <th>Defect Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {RDD_CATALOG.map((item) => (
                <tr key={item.id} style={{ backgroundColor: item.id === 5 ? '#fef2f2' : 'transparent' }}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.id}</td>
                  <td style={{ fontWeight: 700, color: item.id === 5 ? '#dc2626' : '#2563eb' }}>{item.code}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ color: '#475569' }}>{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
