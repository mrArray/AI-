import axios from 'axios';

// ✅ Create axios instance with full API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          sessionStorage.clear();
          // window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        sessionStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.clear();
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('register/', userData),
  login: (credentials) => api.post('login/', credentials),
  verify: (data) => api.post('verify/', data),
  resendVerification: (email) => api.post('resend-verification/', { email }),
  forgotPassword: (email) => api.post('forgot-password/', { email }),
  resetPassword: (data) => api.post('reset-password/', data),
  changePassword: (data) => api.post('change-password/', data),
};

// ✅ Chat API endpoints
export const chatAPI = {
  getSessions: () => api.get('chat/sessions/'),
  getMessages: (sessionId) => api.get(`chat/messages/${sessionId}/`),
  startChat: (prompt) => api.post('chat/start/', { prompt }),
  followupChat: (sessionId, prompt) => api.post('chat/followup/', { session_id: sessionId, prompt }),
};

// ✅ Credits API endpoints
export const creditsAPI = {
  getHistory: () => api.get('credits/history/'),
};

// ✅ Admin API endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('admin/dashboard/'),
  getUsers: () => api.get('admin/users/'),
  getUser: (userId) => api.get(`admin/users/${userId}/`),
  updateUser: (userId, userData) => api.put(`admin/users/${userId}/`, userData),
  getTasks: () => api.get('admin/tasks/'),
  getTask: (taskId) => api.get(`admin/tasks/${taskId}/`),
};

export default api;
