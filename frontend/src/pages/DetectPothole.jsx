import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Scan, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Sliders, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DetectPothole() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confThreshold, setConfThreshold] = useState(0.20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('annotated'); // 'annotated' | 'original'

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await api.detectPotholes(formData, { conf: confThreshold });
      setResult(res.data);
      setActiveTab('annotated');
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error occurred during inference';
      setError(`Detection failed: ${msg}`);
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!result?.annotated_image_url) return;
    const downloadUrl = `${API_BASE_URL}${result.annotated_image_url}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = result.annotated_filename || 'roadpothole_annotated.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateReport = () => {
    if (!result) return;
    navigate('/report', {
      state: {
        prefilledImage: result.original_filename,
        prefilledAnnotated: result.annotated_filename,
        detectionCount: result.detection_count,
        classesSummary: result.classes_summary
      }
    });
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <Scan size={28} color="#2563eb" /> AI Road Defect & Pothole Detector
        </h1>
        <p className="page-subtitle">
          Upload road imagery to identify potholes, alligator cracking, and road hazards using real-time YOLO computer vision.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Upload & Controls */}
        <div className="card">
          <div className="card-title">
            <span>Upload Road Image</span>
            {selectedFile && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                onClick={resetAll}
              >
                <RefreshCw size={12} /> Clear
              </button>
            )}
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              transition: 'border-color 0.2s ease',
              marginBottom: '1.25rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
            <UploadCloud size={44} color="#3b82f6" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
              Drag & drop road image here, or <span style={{ color: '#2563eb' }}>browse</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Supports JPG, JPEG, PNG (max 15MB)
            </p>
          </div>

          {/* Confidence Slider */}
          <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                <Sliders size={15} /> Confidence Threshold:
              </span>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>
                {(confThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              <span>High Sensitivity (10%)</span>
              <span>Default (20%)</span>
              <span>High Precision (80%)</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            disabled={!selectedFile || loading}
            onClick={handleAnalyze}
          >
            {loading ? 'Analyzing with YOLO...' : 'Run Pothole Detection'}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>

        {/* Right Column: Preview & Results */}
        <div className="card">
          <div className="card-title">
            <span>Detection Output</span>
            {result && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn ${activeTab === 'annotated' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveTab('annotated')}
                >
                  Annotated View
                </button>
                <button
                  className={`btn ${activeTab === 'original' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveTab('original')}
                >
                  Original Image
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <LoadingSpinner text="Running YOLO neural network inference on road image..." size={32} />
          ) : result ? (
            <div>
              {/* Image Output Container */}
              <div style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                backgroundColor: '#0f172a',
                textAlign: 'center',
                maxHeight: '400px'
              }}>
                <img
                  src={
                    activeTab === 'annotated'
                      ? `${API_BASE_URL}${result.annotated_image_url}`
                      : `${API_BASE_URL}${result.original_image_url}`
                  }
                  alt="Detection output"
                  style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Metrics & Detection Statistics */}
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    Results: {result.detection_count} Damage Defect(s)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Inference: {result.inference_time_ms} ms
                  </span>
                </div>

                {result.detection_count > 0 ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {Object.entries(result.classes_summary).map(([clsName, count]) => (
                        <span 
                          key={clsName} 
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: clsName.includes('Pothole') ? '#fef2f2' : '#eff6ff',
                            color: clsName.includes('Pothole') ? '#dc2626' : '#2563eb',
                            border: `1px solid ${clsName.includes('Pothole') ? '#fca5a5' : '#bfdbfe'}`
                          }}
                        >
                          {clsName}: {count}
                        </span>
                      ))}
                    </div>

                    {/* Detected Boxes Table */}
                    <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <table className="data-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>Class</th>
                            <th>Confidence</th>
                            <th>Bounding Box (x1, y1, x2, y2)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.boxes.map((box, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{box.class_name}</td>
                              <td>{(box.confidence * 100).toFixed(1)}%</td>
                              <td style={{ fontFamily: 'monospace' }}>
                                [{box.x1}, {box.y1}, {box.x2}, {box.y2}]
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', textAlign: 'center', color: '#059669', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
                    <CheckCircle size={20} style={{ margin: '0 auto 0.25rem auto' }} />
                    <p style={{ fontWeight: 600 }}>No road surface defects detected</p>
                    <p style={{ fontSize: '0.75rem' }}>Road surface appears intact at the selected confidence threshold.</p>
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDownloadImage}>
                    <Download size={16} /> Download Result Image
                  </button>
                  <button className="btn btn-teal" style={{ flex: 1 }} onClick={handleCreateReport}>
                    <FileText size={16} /> Submit as Civic Report
                  </button>
                </div>
              </div>
            </div>
          ) : previewUrl ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <img
                src={previewUrl}
                alt="Selected preview"
                style={{ maxHeight: '350px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
              />
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>
                Click <strong>"Run Pothole Detection"</strong> to process this image.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              <ImageIcon size={48} className="empty-state-icon" />
              <p className="empty-state-title">No image selected</p>
              <p className="empty-state-text">
                Select or drag a road photograph on the left to preview and run computer vision analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
