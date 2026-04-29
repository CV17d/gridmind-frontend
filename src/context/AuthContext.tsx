import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getUserProfile } from '../services/api';

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  userName: string | null;
  login: (token: string, email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gridmind_token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('gridmind_email'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('gridmind_name'));

  const login = (newToken: string, email: string, name: string) => {
    localStorage.setItem('gridmind_token', newToken);
    localStorage.setItem('gridmind_email', email);
    localStorage.setItem('gridmind_name', name);
    setToken(newToken);
    setUserEmail(email);
    setUserName(name);
  };

  const logout = () => {
    localStorage.removeItem('gridmind_token');
    localStorage.removeItem('gridmind_email');
    localStorage.removeItem('gridmind_name');
    setToken(null);
    setUserEmail(null);
    setUserName(null);
  };

  // 🔄 Autorecuperación del nombre si falta
  useEffect(() => {
    if (token && !userName) {
      getUserProfile()
        .then(res => {
          const name = res.data.name;
          localStorage.setItem('gridmind_name', name);
          setUserName(name);
        })
        .catch(err => console.error("Error recuperando perfil:", err));
    }
  }, [token, userName]);

  return (
    <AuthContext.Provider value={{ token, userEmail, userName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
