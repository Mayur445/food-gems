import axios from 'axios';

// This is like Django's BASE_URL setting
// All API calls will use this as the base
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// This runs before every request automatically
// It checks if a token exists and adds it to the header
// Like Django's authentication middleware but on the frontend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;