import axios from "axios";
const DAM_API_BASE_URL =
  import.meta.env.VITE_DAM_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: DAM_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized!...");
    }
    return Promise.reject(error);
  },
);

export default api;
