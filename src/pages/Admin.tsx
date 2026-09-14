// Caminho: frontend/src/pages/Admin.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import logoAdmin from "@/assets/logo-admin-circular.png";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <img
            src={logoAdmin}
            alt="Logo LooksdeHoje"
            className="w-8 h-8 rounded-full object-contain"
          />
          <span className="font-playfair font-semibold text-foreground text-base">
            LooksdeHoje Admin
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar (drawer on mobile, static on desktop) */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-muted/20">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
