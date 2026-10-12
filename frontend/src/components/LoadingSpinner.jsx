import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading data...', size = 24 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '0.75rem',
      color: '#64748b'
    }}>
      <Loader2 size={size} className="spin" style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
