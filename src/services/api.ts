import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gridmind-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor: Inyecta el JWT automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gridmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Si el servidor responde 401/403, redirige al login (excepto en rutas de auth)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/api/v1/users/login') || 
                         error.config?.url?.includes('/api/v1/users/register') ||
                         error.config?.url?.includes('/api/v1/users/forgot-password') ||
                         error.config?.url?.includes('/api/v1/users/reset-password');

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRequest) {
      localStorage.removeItem('gridmind_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const loginUser = (email: string, password: string) =>
  api.post('/api/v1/users/login', { email, password });

export const registerUser = (name: string, email: string, password: string) =>
  api.post('/api/v1/users/register', { name, email, password });

export const forgotPassword = (email: string) => 
  api.post('/api/v1/users/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) => 
  api.post('/api/v1/users/reset-password', { token, newPassword });

export const getUserProfile = () => api.get('/api/v1/users/me');

export const updateSettings = (data: { name?: string; electricityRate?: number; alertThreshold?: number }) =>
  api.put('/api/v1/users/settings', data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/api/v1/users/change-password', { currentPassword, newPassword });

// --- Devices ---
export const getDevices = () => api.get('/api/v1/devices');
export const createDevice = (device: { name: string; type: string; powerRating: number; esp32Id: string }) =>
  api.post('/api/v1/devices', device);

// --- Energy Consumption ---
export const getEnergyByDevice = (deviceId: number) =>
  api.get(`/api/v1/energy/${deviceId}`);

// --- Analytics ---
export const getDailyAnalytics = () => api.get('/api/v1/analytics/daily');
export const getForecast = () => api.get('/api/v1/analytics/forecast');
export const getComparison = () => api.get('/api/v1/analytics/comparison');

// --- Bills ---
export const uploadBill = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/v1/bills/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMyBills = () => api.get('/api/v1/bills');
export const getBillImage = (id: number) => api.get(`/api/v1/bills/${id}/image`, { responseType: 'blob' });

// --- Alerts ---
export const getAlerts = () => api.get('/api/v1/alerts');
export const getUnreadCount = () => api.get('/api/v1/alerts/unread-count');
export const markAlertAsRead = (alertId: number) => api.patch(`/api/v1/alerts/${alertId}/read`);

export default api;
