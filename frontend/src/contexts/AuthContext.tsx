import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
}

export interface UserData {
  username: string;
  papel: 'admin' | 'operador' | 'visualizador' | 'tecnico';
  nomeCompleto?: string;
  unidadeVinculada?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ditel_token');
    const storedUser = localStorage.getItem('ditel_user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      try { setUser(JSON.parse(storedUser) as UserData); } catch { localStorage.removeItem('ditel_user'); localStorage.removeItem('ditel_token'); }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: UserData) => {
    localStorage.setItem('ditel_token', token);
    localStorage.setItem('ditel_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ditel_token');
    localStorage.removeItem('ditel_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen w-screen bg-background flex items-center justify-center text-muted-foreground font-bold">CARREGANDO SISTEMA PMPA...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
