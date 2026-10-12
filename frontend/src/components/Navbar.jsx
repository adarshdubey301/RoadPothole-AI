import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar() {
  const [healthStatus, setHealthStatus] = useState({ online: false, checking: true });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) {
          setHealthStatus({ online: res.data.status === 'healthy', checking: false });
        }
      } catch {
        if (mounted) {
          setHealthStatus({ online: false, checking: false });
        }
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.875rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #0d9488)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            RoadPothole<span style={{ color: '#2563eb' }}>-AI</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Civic Road Safety & Defect Detection System
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: healthStatus.online ? '#ecfdf5' : '#fef2f2',
          color: healthStatus.online ? '#059669' : '#dc2626',
          border: `1px solid ${healthStatus.online ? '#a7f3d0' : '#fecaca'}`
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: healthStatus.online ? '#10b981' : '#ef4444',
            display: 'inline-block'
          }}></span>
          {healthStatus.checking ? 'Connecting...' : (healthStatus.online ? 'Model API Live' : 'Backend Offline')}
        </div>
      </div>
    </header>
  );
}
