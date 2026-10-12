import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#2563eb', bgLight = '#eff6ff' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
          {title}
        </p>
        <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '12px',
          backgroundColor: bgLight,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
