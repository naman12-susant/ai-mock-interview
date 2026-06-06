import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-mock-interview-hqci.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect for non-auth routes (expired token scenario)
      // Don't redirect when login/register fails with 401 — let the error toast show
      const isAuthRoute = error.config?.url?.startsWith('/auth/');
      if (!isAuthRoute) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Resume API
export const resumeAPI = {
  upload: (formData) => {
    return api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getActive: () => api.get('/resume/active'),
  getAll: () => api.get('/resume/all'),
  delete: (id) => api.delete(`/resume/${id}`),
  
  // AI Resume Gap Analysis & ATS Optimization
  performGapAnalysis: (data) => api.post('/resume/gap-analysis', data),
  getGapAnalysis: () => api.get('/resume/gap-analysis'),
  rewriteSection: (data) => api.post('/resume/rewrite-section', data),
  getIndustrySkills: (role) => api.get('/resume/industry-skills', { params: { role } }),
  optimizeResume: (data) => api.post('/resume/optimize', data),
  getResumeScore: () => api.get('/resume/score'),
};

// Interview API
export const interviewAPI = {
  create: (data) => api.post('/interview/create', data),
  generate: (data) => api.post('/interview/generate', data),
  getLiveGreeting: (data) => api.post('/interview/live/greeting', data),
  getLiveChatReply: (data) => api.post('/interview/live/chat', data),
  submitAnswer: (data) => api.post('/interview/answer', data),
  complete: (id) => api.post(`/interview/${id}/complete`),
  getInterview: (id) => api.get(`/interview/${id}`),
  getAll: (params) => api.get('/interview/all', { params }),
  getStatistics: () => api.get('/interview/statistics'),
  checkResume: () => api.get('/interview/check-resume'),
};

// Coding API
export const codingAPI = {
  getChallenges: () => api.get('/coding/challenges'),
  submit: (data) => api.post('/coding/submit', data),
};

export default api;
