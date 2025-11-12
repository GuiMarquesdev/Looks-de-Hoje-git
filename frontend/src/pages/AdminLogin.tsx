import React, { useState } from "react";
import { useAuth, AuthUser } from "../contexts/AuthContext"; // CAMINHO CORRIGIDO AQUI (contexts)
import { useNavigate, Navigate } from "react-router-dom";
import api from "../config/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/use-toast";
import LogoAdmin from "../assets/logo-admin.png"; // Verifique o caminho da sua logo

// Define o formato esperado da resposta de sucesso do login do backend
interface LoginResponseData {
  token: string;
  username: string;
}

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redireciona se o usuário já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chama a nova rota de login do backend, tipando a resposta
      const response = await api.post<LoginResponseData>("/admin/login", {
        username,
        password,
      });

      const { token, username: loggedInUsername } = response.data;

      // Criar o objeto AuthUser, conforme esperado pela função login
      const userData: AuthUser = { username: loggedInUsername };

      login(token, userData); // Salva o token e o objeto de usuário no contexto

      toast({
        title: "Sucesso!",
        description: `Bem-vindo, ${loggedInUsername}. Redirecionando...`,
        variant: "default",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      // Captura a mensagem de erro do backend ou usa uma genérica
      const errorMessage =
        (error as any).response?.data?.message ||
        "Erro de conexão ou credenciais inválidas.";
      toast({
        title: "Erro de Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <img src={LogoAdmin} alt="Logo Admin" className="h-10 mx-auto mb-2" />
          <CardTitle className="text-2xl">Acesso Administrador</CardTitle>
          <CardDescription>Entre com seu usuário e senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
