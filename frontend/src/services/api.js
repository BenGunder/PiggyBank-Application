import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const budgetAPI = {
  getAll: () => apiClient.get('/budgets/'),
  getById: (id) => apiClient.get(`/budgets/${id}`),
  create: (budgetData) => apiClient.post('/budgets/', budgetData),
  update: (id, budgetData) => apiClient.put(`/budgets/${id}`, budgetData),
  delete: (id) => apiClient.delete(`/budgets/${id}`),
};

export const expenseAPI = {
  getAll: (params) => apiClient.get('/expenses/', { params }),
  getById: (id) => apiClient.get(`/expenses/${id}`),
  create: (expenseData) => apiClient.post('/expenses/', expenseData),
  update: (id, expenseData) => apiClient.put(`/expenses/${id}`, expenseData),
  delete: (id) => apiClient.delete(`/expenses/${id}`),
  getAnalytics: () => apiClient.get('/expenses/analytics/summary'),
};

export default apiClient;
