import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gridmind-backend.onrender.com';

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

// Interceptor: Si el servidor responde 401/403, redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
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

// --- Devices ---
export const getDevices = () => api.get('/api/v1/devices');
export const createDevice = (device: { name: string; type: string; powerRating: number; esp32Id: string }) =>
  api.post('/api/v1/devices', device);

// --- Energy Consumption ---
export const getEnergyByDevice = (deviceId: number) =>
  api.get(`/api/v1/energy/${deviceId}`);

// --- Analytics ---
export const getDailyAnalytics = () => api.get('/api/v1/analytics/daily');

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
