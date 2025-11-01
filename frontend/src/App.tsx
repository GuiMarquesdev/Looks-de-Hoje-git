// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AdminProvider } from "./contexts/AdminContext"; // REMOVIDO
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import AdminLogin from "./pages/admin/AdminLogin"; // REMOVIDO
import AdminDashboard from "./pages/admin/AdminDashboard";
import PiecesManagement from "./pages/admin/PiecesManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import Settings from "./pages/admin/Settings";
import HeroManagement from "./pages/admin/HeroManagement";
import AdminLayout from "./components/admin/AdminLayout";
// import { useAdmin } from "./contexts/AdminContext"; // REMOVIDO

const queryClient = new QueryClient();

// Componente simples de Layout (o AdminLayout agora não verifica autenticação)
const SimpleAdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* AdminProvider REMOVIDO */}
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Acesso aberto ao painel administrativo */}
          <Route 
            path="/admin" 
            element={
              <SimpleAdminLayout>
                <AdminDashboard />
              </SimpleAdminLayout>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <SimpleAdminLayout>
                <AdminDashboard />
              </SimpleAdminLayout>
            } 
          />
          <Route 
            path="/admin/pieces" 
            element={
              <SimpleAdminLayout>
                <PiecesManagement />
              </SimpleAdminLayout>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <SimpleAdminLayout>
                <CategoriesManagement />
              </SimpleAdminLayout>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <SimpleAdminLayout>
                <Settings />
              </SimpleAdminLayout>
            } 
          />
          <Route 
            path="/admin/hero" 
            element={
              <SimpleAdminLayout>
                <HeroManagement />
              </SimpleAdminLayout>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;