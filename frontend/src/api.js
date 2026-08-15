// src/api.js
import axios from "axios";

// --------------------------------------------------
// Backend API URL
// --------------------------------------------------
// Local development:
//   VITE_API_BASE=http://localhost:8000
//
// Vercel production:
//   /api
//
// If VITE_API_BASE is not defined, use /api.
// --------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_BASE || "/api";

// --------------------------------------------------
// Axios instance
// --------------------------------------------------
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --------------------------------------------------
// Attach JWT token automatically
// --------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --------------------------------------------------
// Normalize errors
// --------------------------------------------------
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const normalizedError = {
      message:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Network Error",

      status: error?.response?.status || null,

      data: error?.response?.data || null,
    };

    return Promise.reject(normalizedError);
  }
);

// ==================================================
// AUTH
// ==================================================

export async function postSignup(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function postLogin(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

// ==================================================
// LOCATION / PLACE RECOMMENDER
// ==================================================

export async function postRecommend(params) {
  try {
    const response = await api.post("/recommend", params);
    return response.data;
  } catch (error) {
    // Retry once on timeout
    if (
      error?.message &&
      error.message.toLowerCase().includes("timeout")
    ) {
      const retry = await api.post("/recommend", params);
      return retry.data;
    }

    throw error;
  }
}

// ==================================================
// CATEGORIES
// ==================================================

export async function getCategories() {
  try {
    const response = await api.get("/categories");
    return response.data || [];
  } catch {
    return [];
  }
}

// ==================================================
// PROFILE-AWARE SERVICE RECOMMENDER
// ==================================================

export async function getMyServices() {
  const response = await api.get("/services/recommend/me");
  return response.data;
}

// ==================================================
// DEFAULT AXIOS INSTANCE
// ==================================================

export default api;