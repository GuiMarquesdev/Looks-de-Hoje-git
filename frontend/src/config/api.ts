import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Cria e configura a instância do Axios
const api = axios.create({
  baseURL: API_URL,
});

// Exporta a instância do Axios como o default export
export default api;
