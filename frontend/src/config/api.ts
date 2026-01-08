import axios from "axios";

// REMOVA O import.meta.env... E DEIXE APENAS A STRING:
export const API_URL = "https://lookdehoje.com/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
