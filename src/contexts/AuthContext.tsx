// Caminho: /src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../config/api";

// 1. Definição da Interface
export interface AuthUser {
  // Adicionado 'export'
  username: string;
  // Adicione outras propriedades do usuário aqui (ex: id, email)
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  isLoading: boolean; // Estado essencial para evitar redirecionamento instantâneo
}

// 2. Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. O Componente Provedor
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true

  // Lógica para inicializar e validar a autenticação ao carregar
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userDataString = localStorage.getItem("authUser");

      if (!token || !userDataString) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = JSON.parse(userDataString) as AuthUser;
        // Valida silenciosamente a sessão ativa com o servidor
        const response = await api.get<{ authenticated: boolean; user?: any }>("/auth/me");
        
        if (isMounted) {
          if (response.data && response.data.authenticated) {
            setIsAuthenticated(true);
            setUser(response.data.user || userData);
          } else {
            // Sessão expirada ou token inválido
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      // Non-blocking if offline or expired
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook Customizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
