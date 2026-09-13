// frontend/src/components/admin/AdminSidebar.tsx

import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  LogOut,
  Image,
  FileText,
  Type,
  Settings as SettingsIcon,
  ExternalLink,
  User,
} from "lucide-react";
import logoAdmin from "@/assets/logo-admin-circular.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão de Peças",
    url: "/admin/pieces",
    icon: Package,
  },
  {
    title: "Categorias",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Gerenciar HeroSection",
    url: "/admin/hero",
    icon: Image,
  },
  {
    title: "Regras de Aluguel",
    url: "/admin/rules",
    icon: FileText,
  },
  {
    title: "Conteúdo do Site",
    url: "/admin/content",
    icon: Type,
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: SettingsIcon,
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleOpenStore = () => {
    window.open("/", "_blank");
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col shadow-sm select-none">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src={logoAdmin}
              alt="LooksdeHoje Logo"
              className="w-full h-full object-contain rounded-full shadow-sm"
            />
          </div>
          <div>
            <h1 className="font-playfair text-lg font-semibold text-foreground tracking-tight">
              LooksdeHoje
            </h1>
            <p className="text-xs text-muted-foreground font-montserrat">
              Painel Administrativo
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all font-montserrat",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile & Actions */}
      <div className="p-4 border-t border-border bg-card/50 space-y-2">
        {/* User Info Badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground font-montserrat">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="truncate flex-1">
            <span className="font-medium text-foreground block truncate">
              {user?.username || "Administrador"}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Sessão Ativa
            </span>
          </div>
        </div>

        {/* View Store */}
        <Button
          onClick={handleOpenStore}
          variant="outline"
          size="sm"
          className="w-full justify-between text-xs font-montserrat h-9"
        >
          <span>Ver Loja Online</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>

        {/* Real Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-montserrat h-9"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
