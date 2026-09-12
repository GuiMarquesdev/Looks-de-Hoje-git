import React, { useState } from "react";
import { useAuth, AuthUser } from "../contexts/AuthContext";
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
import LogoAdmin from "../assets/logo-admin.png";
import { Eye, EyeOff } from "lucide-react";

// 1. Ajuste na Interface para bater com o AuthController do Laravel
// O Laravel retorna: { token: "...", user: { username: "...", ... } }
interface LoginResponseData {
  token?: string;
  requires2FA?: boolean;
  tempToken?: string;
  message?: string;
  user?: {
    username: string;
    role?: string;
  };
}

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA States
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post<LoginResponseData>("/login", {
        username,
        password,
      });

      // Check if 2FA is required
      if (response.data.requires2FA && response.data.tempToken) {
        setTempToken(response.data.tempToken);
        setStep("2fa");
        toast({
          title: "Autenticação em 2 Etapas",
          description: "Insira o código de 6 dígitos para continuar.",
          variant: "default",
        });
        return;
      }

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        const loggedInUsername = user.username;
        const userData: AuthUser = { username: loggedInUsername };

        login(token, userData);

        toast({
          title: "Sucesso!",
          description: `Bem-vindo, ${loggedInUsername}. Redirecionando...`,
          variant: "default",
        });

        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message ||
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

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código 2FA deve conter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<LoginResponseData>("/login/verify-2fa", {
        tempToken,
        code: twoFactorCode,
      });

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        login(token, { username: user.username });

        toast({
          title: "2FA Validado!",
          description: "Identidade confirmada com sucesso.",
          variant: "default",
        });

        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Código 2FA incorreto ou expirado.";
      toast({
        title: "Erro no 2FA",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-sm shadow-xl border border-border">
        <CardHeader className="space-y-1 text-center">
          <img src={LogoAdmin} alt="Logo Admin" className="h-10 mx-auto mb-2" />
          <CardTitle className="text-2xl font-playfair font-bold">
            {step === "credentials" ? "Acesso Administrador" : "Verificação em 2 Etapas"}
          </CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Entre com suas credenciais protegidas."
              : "Digite o código PIN de 6 dígitos gerado para a sua conta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
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
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-0 transition-colors"
                    aria-label={showPassword ? "Esconder senha" : "Ver senha"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Validando credenciais..." : "Entrar com Segurança"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="grid gap-4">
              <div className="grid gap-2 text-center">
                <Label htmlFor="twoFactorCode" className="text-sm font-medium">
                  Código de 6 dígitos
                </Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={isLoading}
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono font-bold"
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading || twoFactorCode.length !== 6}>
                {isLoading ? "Verificando 2FA..." : "Confirmar Código 2FA"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={() => {
                  setStep("credentials");
                  setTwoFactorCode("");
                }}
              >
                ← Voltar ao login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
