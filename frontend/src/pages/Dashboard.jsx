import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Scan, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  'Pending': '#f59e0b',
  'In Progress': '#2563eb',
  'Scheduled': '#9333ea',
  'Resolved': '#10b981'
};

const SEVERITY_COLORS = {
  'Low': '#64748b',
  'Medium': '#d97706',
  'High': '#ea580c',
  'Critical': '#ef4444'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.getDashboardSummary();
        if (mounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to reach backend API. Ensure FastAPI server is running on port 8000.');
          setLoading(false);
        }
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Civic Dashboard data..." size={32} />;

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: '#fca5a5' }}>
          <AlertOctagon size={40} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>Backend Server Connection Error</h2>
          <p style={{ color: '#64748b', margin: '0.5rem auto 1.5rem auto', maxWidth: '500px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const statusPieData = data?.status_breakdown
    ? Object.entries(data.status_breakdown)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const severityPieData = data?.severity_breakdown
    ? Object.entries(data.severity_breakdown)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">
            Civic Road Safety Dashboard
          </h1>
          <p className="page-subtitle">
            Live analytics on road distress, pothole detections, and civic resolution progress.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/detect" className="btn btn-teal">
            <Scan size={16} /> Analyze Image
          </Link>
          <Link to="/report" className="btn btn-primary">
            <FileText size={16} /> New Report
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard 
          title="Total Reports" 
          value={data?.total_reports ?? 0} 
          subtitle="Citizen & AI road submissions" 
          icon={FileText} 
          color="#2563eb" 
          bgLight="#eff6ff" 
        />
        <StatCard 
          title="Analyzed Images" 
          value={data?.total_analyzed_images ?? 0} 
          subtitle="Processed via YOLO inference" 
          icon={Scan} 
          color="#0d9488" 
          bgLight="#f0fdfa" 
        />
        <StatCard 
          title="Detected Defects" 
          value={data?.total_detected_potholes ?? 0} 
          subtitle="Potholes and structural damages" 
          icon={AlertOctagon} 
          color="#dc2626" 
          bgLight="#fef2f2" 
        />
        <StatCard 
          title="Pending Action" 
          value={data?.pending_reports ?? 0} 
          subtitle={`${data?.resolved_reports ?? 0} resolved`} 
          icon={Clock} 
          color="#f59e0b" 
          bgLight="#fffbeb" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Trend Bar Chart */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#2563eb" /> 7-Day Road Activity Trend
            </span>
          </div>
          <div style={{ height: '260px' }}>
            {data?.detection_trend && data.detection_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.detection_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
                  />
                  <Bar dataKey="detections" name="Damage Detections" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reports" name="Reports Filed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p>No activity recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={18} color="#0d9488" /> Report Status Breakdown
            </span>
          </div>
          <div style={{ height: '260px' }}>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <CheckCircle2 size={36} className="empty-state-icon" />
                <p className="empty-state-title">No reports filed yet</p>
                <p className="empty-state-text">Submit your first road pothole report to view live resolution statuses.</p>
                <Link to="/report" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                  Create First Report
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="card">
        <div className="card-title">
          <span>Recent Civic Reports</span>
          <Link to="/history" style={{ fontSize: '0.85rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All Reports <ArrowRight size={14} />
          </Link>
        </div>

        {data?.recent_reports && data.recent_reports.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Location</th>
                  <th>Defect Count</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_reports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      <Link to={`/history?search=${report.report_id}`} style={{ color: '#2563eb' }}>
                        {report.report_id}
                      </Link>
                    </td>
                    <td>{report.location_address}</td>
                    <td>{report.detection_count} detected</td>
                    <td><StatusBadge status={report.severity} type="severity" /></td>
                    <td><StatusBadge status={report.status} type="status" /></td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={36} className="empty-state-icon" />
            <p className="empty-state-title">No recent reports found</p>
            <p className="empty-state-text">Start by analyzing road imagery in the detector or filing a civic report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
