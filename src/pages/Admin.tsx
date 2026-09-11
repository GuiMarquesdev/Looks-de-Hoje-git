// Caminho: frontend/src/pages/Admin.tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

const Admin = () => {
  return (
    // Usa flexbox para a sidebar e o conteúdo
    <div className="flex h-screen bg-gray-50">
      {/* 1. A Sidebar é o componente de navegação fixo
        2. O restante da tela é a área principal (main) 
      */}
      <AdminSidebar />

      {/*
        O main se expande para o resto da tela (flex-1)
        e o 'p-4' adiciona padding.
      */}
      <main className="flex-1 overflow-auto p-4">
        {/*
          O Outlet renderiza o componente da rota correspondente:
          (Dashboard, PiecesManagement, CategoriesManagement, etc.)
          NÃO DEVE HAVER NENHUM CONTEÚDO ESTÁTICO AQUI
        */}
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
