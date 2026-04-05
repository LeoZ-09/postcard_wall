import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const postcardApi = {
  getAll: (params) => api.get('/postcards', { params }),
  getById: (id) => api.get(`/postcards/${id}`),
  getByCode: (code) => api.get(`/postcards/code/${code}`),
  getStatistics: () => api.get('/postcards/statistics'),
  create: (data) => api.post('/postcards', data),
  update: (id, data) => api.put(`/postcards/${id}`, data),
  delete: (id) => api.delete(`/postcards/${id}`),
};

export const imageApi = {
  getAll: (params) => api.get('/images', { params }),
  getById: (id) => api.get(`/images/${id}`),
  upload: (formData) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/images/${id}`),
};

export default api;
