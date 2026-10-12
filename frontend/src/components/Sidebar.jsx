import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanSearch, 
  FilePlus, 
  History, 
  BarChart3, 
  Info 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/detect', label: 'Detect Pothole', icon: ScanSearch },
  { path: '/report', label: 'Report Road Damage', icon: FilePlus },
  { path: '/history', label: 'Reports History', icon: History },
  { path: '/performance', label: 'Model Performance', icon: BarChart3 },
  { path: '/about', label: 'About Project', icon: Info },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '1.5rem 1rem'
    }}>
      <div style={{ marginBottom: '1.5rem', paddingLeft: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
          Navigation
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563eb' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
          RDD-India Detection Engine
        </p>
        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
          YOLOv8 Object Detection with 9 Damage Classes
        </p>
      </div>
    </aside>
  );
}
