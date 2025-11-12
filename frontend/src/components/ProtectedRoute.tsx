// Caminho: /src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Componente que verifica a autenticação antes de renderizar as rotas filhas.
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Destrutura isLoading

  // 1. Mostrar estado de carregamento enquanto a autenticação é verificada
  if (isLoading) {
    return <div>Carregando autenticação...</div>;
  }

  // 2. Redirecionar se não estiver autenticado
  if (!isAuthenticated) {
    // Redireciona para a página de login
    return <Navigate to="/admin/login" replace />;
  }

  // 3. Renderizar rotas filhas se estiver autenticado
  return <Outlet />;
};

export default ProtectedRoute;
