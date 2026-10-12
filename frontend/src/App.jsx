import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DetectPothole from './pages/DetectPothole';
import ReportDamage from './pages/ReportDamage';
import ReportsHistory from './pages/ReportsHistory';
import ModelPerformance from './pages/ModelPerformance';
import AboutProject from './pages/AboutProject';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <main style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/detect" element={<DetectPothole />} />
              <Route path="/report" element={<ReportDamage />} />
              <Route path="/history" element={<ReportsHistory />} />
              <Route path="/performance" element={<ModelPerformance />} />
              <Route path="/about" element={<AboutProject />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
