// Caminho: /src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

  // Lógica para inicializar a autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("authUser");
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString) as AuthUser;
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error("Erro ao fazer parse do usuário do localStorage:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      }
    }
    setIsLoading(false); // Termina o carregamento
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
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
