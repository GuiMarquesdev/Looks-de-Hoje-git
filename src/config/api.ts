import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "/api";

export const isRemoteProductionHost = (): boolean => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "";
    if (
      hostname.includes("lookdehoje") ||
      hostname.includes("vercel.app") ||
      API_URL.includes("lookdehoje")
    ) {
      return true;
    }
  }
  return API_URL.includes("lookdehoje");
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor de Requisição (Envia o token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta (Trata token expirado)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não Autorizado), limpa o estado de autenticação
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada ou não autorizada.");
      
      // Remove tokens do storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      
      // Redireciona para o login apenas se estiver em uma rota de admin e não já no login
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.includes("/admin/login")
      ) {
        window.location.href = "/admin/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;