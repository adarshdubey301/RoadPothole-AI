import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for ML inference
});

export const api = {
  // Health
  getHealth: () => apiClient.get('/health'),

  // Detection
  detectPotholes: (formData, params = {}) =>
    apiClient.post('/api/detection', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Reports
  createReport: (reportData) => apiClient.post('/api/reports', reportData),
  getReports: (params = {}) => apiClient.get('/api/reports', { params }),
  getReportById: (reportId) => apiClient.get(`/api/reports/${reportId}`),
  updateReportStatus: (reportId, updateData) =>
    apiClient.patch(`/api/reports/${reportId}`, updateData),

  // Dashboard
  getDashboardSummary: () => apiClient.get('/api/dashboard/summary'),

  // Model Info
  getModelInfo: () => apiClient.get('/api/model-info'),
};

export default apiClient;
