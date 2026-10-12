import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Calendar, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function ReportsHistory() {
  const urlParams = new URLSearchParams(useLocation().search);
  const initialSearch = urlParams.get('search') || '';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await api.getReports(params);
      setReports(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedReport) return;
    setUpdatingStatus(true);
    try {
      const res = await api.updateReportStatus(selectedReport.report_id, { status: newStatus });
      setSelectedReport(res.data);
      // Update in reports list
      setReports((prev) =>
        prev.map((r) => (r.report_id === selectedReport.report_id ? res.data : r))
      );
      setUpdatingStatus(false);
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <History size={28} color="#2563eb" /> Civic Reports Archive
        </h1>
        <p className="page-subtitle">
          Search, filter, track status, and audit verified road defect reports submitted to the municipal database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Report ID, street address, or notes..."
              style={{ paddingLeft: '2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <button type="submit" className="btn btn-primary">
              <Search size={14} /> Search
            </button>
            {(search || statusFilter || severityFilter) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setSeverityFilter('');
                  setTimeout(fetchReports, 50);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text="Querying civic reports..." size={28} />
        ) : reports.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Location Address</th>
                  <th>Damage Detections</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#2563eb' }}>
                      {report.report_id}
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.location_address}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{report.detection_count}</span> defect(s)
                    </td>
                    <td><StatusBadge status={report.severity} type="severity" /></td>
                    <td><StatusBadge status={report.status} type="status" /></td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <History size={40} className="empty-state-icon" />
            <p className="empty-state-title">No matching reports found</p>
            <p className="empty-state-text">
              Try adjusting your filter criteria or submit a new road damage report.
            </p>
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Report: {selectedReport.report_id}
              </h2>
              <StatusBadge status={selectedReport.status} type="status" />
              <StatusBadge status={selectedReport.severity} type="severity" />
            </div>

            {/* Evidence Image */}
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              backgroundColor: '#0f172a',
              textAlign: 'center',
              marginBottom: '1.25rem',
              maxHeight: '320px'
            }}>
              <img
                src={
                  selectedReport.annotated_image_url
                    ? `${API_BASE_URL}${selectedReport.annotated_image_url}`
                    : `${API_BASE_URL}${selectedReport.original_image_url}`
                }
                alt="Report road evidence"
                style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Location Address</p>
                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {selectedReport.location_address}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>GPS Coordinates</p>
                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {selectedReport.latitude && selectedReport.longitude
                    ? `${selectedReport.latitude}, ${selectedReport.longitude}`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Detected Defect Count</p>
                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {selectedReport.detection_count} damage defect(s)
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Submission Timestamp</p>
                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedReport.description && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Citizen Notes</p>
                <p style={{ fontSize: '0.85rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '6px' }}>
                  {selectedReport.description}
                </p>
              </div>
            )}

            {/* Municipal Status Management (Demo Admin Controls) */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Municipal Administrative Status Update (Demonstration)
                </span>
                {updatingStatus && <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Updating...</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pending', 'In Progress', 'Scheduled', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    className={`btn ${selectedReport.status === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    disabled={updatingStatus || selectedReport.status === st}
                    onClick={() => handleStatusUpdate(st)}
                  >
                    Set to {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
