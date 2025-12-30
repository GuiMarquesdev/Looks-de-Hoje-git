// src/config/api.ts
import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "https://lookdehoje.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// --- MOVA ESTO PARA CIMA DO EXPORT ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// -------------------------------------

export default api; // <--- Exporte POR ÚLTIMO
