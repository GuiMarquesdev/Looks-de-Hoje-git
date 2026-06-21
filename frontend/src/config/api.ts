import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://lookdehoje.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de Requisição (Envia o token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NOVO: Interceptor de Resposta (Trata token expirado)
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu certo, apenas retorna a resposta
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não Autorizado), significa que o token é inválido ou expirou
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada. Redirecionando para login...");
      
      // Remove o token inválido
      localStorage.removeItem("authToken");
      
      // Redireciona o usuário para a tela de login (ajuste a rota conforme o seu projeto)
      window.location.href = "/admin/login"; 
    }
    
    // Repassa o erro para ser tratado pelo bloco catch do componente, se necessário
    return Promise.reject(error);
  }
);

export default api;