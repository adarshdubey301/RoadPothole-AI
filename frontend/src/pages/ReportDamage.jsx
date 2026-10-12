import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FilePlus, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle, 
  UploadCloud, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function ReportDamage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State prefilled from DetectPothole page if redirected
  const prefilled = location.state || {};

  const [formData, setFormData] = useState({
    location_address: '',
    latitude: '',
    longitude: '',
    description: '',
    severity: prefilled.detectionCount > 2 ? 'High' : (prefilled.detectionCount > 0 ? 'Medium' : 'Low'),
    image_filename: prefilled.prefilledImage || '',
    annotated_filename: prefilled.prefilledAnnotated || '',
    detection_count: prefilled.detectionCount || 0,
    detected_classes: JSON.stringify(prefilled.classesSummary || {})
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    prefilled.prefilledAnnotated 
      ? `${API_BASE_URL}/uploads/${prefilled.prefilledAnnotated}` 
      : null
  );

  const [submitting, setSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState(null);
  const [error, setError] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        setGeoLocating(false);
      },
      (err) => {
        alert(`Location retrieval failed: ${err.message}`);
        setGeoLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location_address.trim()) {
      setError('Please provide a specific street address or road location.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let imageFilenameToUse = formData.image_filename;
      let annotatedFilenameToUse = formData.annotated_filename;
      let detectionCountToUse = formData.detection_count;

      // If user uploaded a new image file on this screen, run detection on it first
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        const detRes = await api.detectPotholes(uploadData);
        imageFilenameToUse = detRes.data.original_filename;
        annotatedFilenameToUse = detRes.data.annotated_filename;
        detectionCountToUse = detRes.data.detection_count;
      }

      if (!imageFilenameToUse) {
        setError('Please attach an image of the road damage.');
        setSubmitting(false);
        return;
      }

      const payload = {
        image_filename: imageFilenameToUse,
        annotated_filename: annotatedFilenameToUse || null,
        location_address: formData.location_address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        description: formData.description.trim() || null,
        severity: formData.severity,
        detection_count: detectionCountToUse,
        detected_classes: formData.detected_classes
      };

      const res = await api.createReport(payload);
      setSuccessReport(res.data);
      setSubmitting(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error creating report';
      setError(`Failed to submit civic report: ${msg}`);
      setSubmitting(false);
    }
  };

  if (successReport) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Civic Report Successfully Submitted!
          </h2>

          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Your road defect report has been registered in the municipal database.
          </p>

          <div style={{
            margin: '1.5rem 0',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Report Reference ID:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                {successReport.report_id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Location:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {successReport.location_address}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Severity Level:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {successReport.severity}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Detected Defects:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {successReport.detection_count} identified
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSuccessReport(null);
                setFormData({
                  location_address: '',
                  latitude: '',
                  longitude: '',
                  description: '',
                  severity: 'Medium',
                  image_filename: '',
                  annotated_filename: '',
                  detection_count: 0,
                  detected_classes: '[]'
                });
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
            >
              Submit Another Report
            </button>
            <Link to="/history" className="btn btn-primary">
              View In Reports History <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <FilePlus size={28} color="#2563eb" /> Report Road Damage
        </h1>
        <p className="page-subtitle">
          Submit official civic reports with AI-verified defect bounding boxes, GPS coordinates, and urgency ratings.
        </p>
      </div>

      <div className="grid-2">
        {/* Form Column */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Location / Road Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ring Road, Near Metro Pillar 142, Sector 5"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                required
              />
            </div>

            {/* Coordinates Fields with GPS Helper */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  GPS Coordinates (Optional)
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={handleGetLocation}
                  disabled={geoLocating}
                >
                  <Navigation size={12} /> {geoLocating ? 'Locating...' : 'Use My Current Location'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Latitude (e.g. 28.6139)"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Longitude (e.g. 77.2090)"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            {/* Severity Level */}
            <div className="form-group">
              <label className="form-label">Damage Severity Rating</label>
              <select
                className="form-select"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="Low">Low - Superficial cracking / minor defect</option>
                <option value="Medium">Medium - Noticeable pothole, regular vehicle hazard</option>
                <option value="High">High - Deep pothole or extensive alligator cracking</option>
                <option value="Critical">Critical - Severe hazard, imminent structural collapse / accident risk</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe road conditions, approximate depth, visibility, or nearby landmarks..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              disabled={submitting}
            >
              {submitting ? 'Registering Civic Report...' : 'Submit Civic Report'}
            </button>
          </form>
        </div>

        {/* Image Attachment Column */}
        <div className="card">
          <div className="card-title">
            <span>Attached Road Evidence</span>
            {formData.detection_count > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                AI Verified ({formData.detection_count} defect(s))
              </span>
            )}
          </div>

          {previewUrl ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                maxHeight: '340px'
              }}>
                <img
                  src={previewUrl}
                  alt="Attached evidence"
                  style={{ maxHeight: '340px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              {prefilled.prefilledAnnotated && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  backgroundColor: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#0f766e'
                }}>
                  Evidence auto-transferred from your recent AI computer vision detection session.
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <label className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                  <UploadCloud size={16} /> Choose Different Image
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <label
                style={{
                  display: 'block',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
              >
                <UploadCloud size={40} color="#3b82f6" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontWeight: 600, color: '#1e293b' }}>Upload road photograph</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Attach image to verify road damage</p>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>

              <div style={{ marginTop: '1rem' }}>
                <Link to="/detect" style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                  Or run AI Pothole Detection first &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
