// src/api.js
import axios from "axios";

// Backend URL (env override or fallback)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

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
// Attach JWT token automatically to every request
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
  (res) => res,
  (error) => {
    const out = {
      message: error?.response?.data?.detail || error.message || "Network Error",
      status: error?.response?.status || null,
      data: error?.response?.data || null,
    };
    return Promise.reject(out);
  }
);

// ==================================================
// AUTH
// ==================================================
export async function postSignup(payload) {
  const res = await api.post("/auth/signup", payload);
  return res.data;
}

export async function postLogin(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

// ==================================================
// LOCATION / PLACE RECOMMENDER
// ==================================================
export async function postRecommend(params) {
  try {
    const res = await api.post("/recommend", params);
    return res.data;
  } catch (err) {
    // Retry once on timeout
    if (err?.message?.toLowerCase().includes("timeout")) {
      const retry = await api.post("/recommend", params);
      return retry.data;
    }
    throw err;
  }
}

export async function getCategories() {
  try {
    const res = await api.get("/categories");
    return res.data || [];
  } catch {
    return [];
  }
}

// ==================================================
// 🔥 PROFILE-AWARE SERVICE RECOMMENDER (FIXED)
// ==================================================
export async function getMyServices() {
  const res = await api.get("/services/recommend/me");
  return res.data;
}

export default api;
