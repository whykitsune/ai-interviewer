import axios, { InternalAxiosRequestConfig } from "axios";
import { AuthResponse } from "./types";

const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
  baseURL: "",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post<AuthResponse>(
            "http://127.0.0.1:8000/auth/refresh",
            { refresh_token: refreshToken }
          );

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          originalRequest.headers.set("Authorization", `Bearer ${data.access_token}`);
          return api(originalRequest);

        } catch (refreshError) {
          console.error("Session expired", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
          window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;