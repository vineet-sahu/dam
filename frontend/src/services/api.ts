import axios from 'axios';
const DAM_API_BASE_URL = import.meta.env.VITE_DAM_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: DAM_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        window.location.href = '/401';
        break;
      case 403:
        window.location.href = '/403';
        break;
      case 404:
        window.location.href = '/404';
        break;
      case 500:
      case 502:
      case 503:
        window.location.href = '/500';
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

export default api;
