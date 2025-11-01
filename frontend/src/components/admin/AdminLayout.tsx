// frontend/src/components/admin/AdminLayout.tsx

import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar.tsx";
// useAdmin e Loader2 REMOVIDOS

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Toda a lógica de autenticação e carregamento (isLoading, isAuthenticated) FOI REMOVIDA

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Componente de navegação */}
      <AdminSidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-4 sm:p-6 lg:p-8">
          {/* O children renderiza o componente da rota (Dashboard, Settings, etc.) */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
