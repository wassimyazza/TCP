import axios from "axios";

const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:3001/api";

const internalApiUrl =
  process.env.NEXT_INTERNAL_API_URL?.replace(/\/+$/, "") || publicApiUrl;

const apiUrl = typeof window === "undefined" ? internalApiUrl : publicApiUrl;

export const API_URL = apiUrl;
export const API_BASE_URL = `${apiUrl}`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
