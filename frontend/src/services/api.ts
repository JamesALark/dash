import axios from 'axios';

// Use environment variable if set, otherwise use relative URL in production or localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks API
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Recommendations API
export const recommendationsApi = {
  getAll: (params?: { type?: string; status?: string }) => 
    api.get('/recommendations', { params }),
  getById: (id: string) => api.get(`/recommendations/${id}`),
  create: (data: any) => api.post('/recommendations', data),
  update: (id: string, data: any) => api.put(`/recommendations/${id}`, data),
  delete: (id: string) => api.delete(`/recommendations/${id}`),
};

// News API
export const newsApi = {
  getAll: (params?: { sourceId?: string; read?: boolean }) =>
    api.get('/news', { params }),
  getById: (id: string) => api.get(`/news/${id}`),
  refresh: () => api.post('/news/refresh'),
  markRead: (id: string, read: boolean) => api.put(`/news/${id}/read`, { read }),
  getSources: () => api.get('/news/sources'),
  createSource: (data: any) => api.post('/news/sources', data),
  deleteSource: (id: string) => api.delete(`/news/sources/${id}`),
  fetchNewsAPI: (query?: string) => api.post('/news/newsapi', { query }),
};

// Feed API
export const feedApi = {
  getAll: () => api.get('/feed'),
};

export default api;
