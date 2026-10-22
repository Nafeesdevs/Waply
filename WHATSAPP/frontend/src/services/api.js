import axios from "axios";

// Base server URL (no /api suffix) — used directly by messageservice, which
// hits the public /api/v1/whatsapp/messages endpoint the way an external
// developer would (with a raw API key, not the dashboard JWT).
export const SERVER_URL = import.meta.env.BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach the dashboard JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and bounce back to login
// instead of leaving the app stuck showing stale auth errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const onAuthPage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/register";

    if (status === 401 && !onAuthPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
