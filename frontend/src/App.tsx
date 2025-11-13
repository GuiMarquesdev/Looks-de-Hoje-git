import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin"; // Layout do Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import PiecesManagement from "./pages/admin/PiecesManagement";
import HeroManagement from "./pages/admin/HeroManagement";
import Settings from "./pages/admin/Settings";
import AdminNotFound from "./pages/Admin.NotFound";
import AdminLogin from "./pages/AdminLogin"; // <-- Importe a página de login
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Importe o Protetor de Rota

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Home/Pública */}
        <Route path="/" element={<Index />} />

        {/* Rota de Login do Admin (PÚBLICA) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ROTAS DE ADMINISTRAÇÃO (PROTEGIDAS) */}
        {/* Todas as rotas dentro deste <Route> serão protegidas pelo ProtectedRoute */}
        <Route path="/admin" element={<ProtectedRoute />}>
          {/* O elemento Admin contém o layout (Sidebar + Header + Content) */}
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Navigate to="dashboard" replace />} />{" "}
            {/* Redireciona /admin para /admin/dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pieces" element={<PiecesManagement />} />{" "}
            {/* CORRIGIDO: de "pecas" para "pieces" */}
            <Route path="categories" element={<CategoriesManagement />} />{" "}
            {/* CORRIGIDO: de "categorias" para "categories" */}
            <Route path="hero" element={<HeroManagement />} />
            <Route path="settings" element={<Settings />} />{" "}
            {/* CORREÇÃO FINAL: de "config" para "settings" */}
            <Route path="*" element={<AdminNotFound />} />{" "}
            {/* Rota 404 para o Admin */}
          </Route>
        </Route>

        {/* Rota 404 para o público */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
