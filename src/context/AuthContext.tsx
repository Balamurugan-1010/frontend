import React, { createContext, useContext, useState, useEffect } from 'react';
import { Manager } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  manager: Manager | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager, setManager] = useState<Manager | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('talentmatch_token');
      const storedManager = localStorage.getItem('talentmatch_manager');

      if (storedToken && storedManager) {
        try {
          setToken(storedToken);
          setManager(JSON.parse(storedManager));
          // Verify with backend
          const me = await authService.getMe();
          setManager(me);
          localStorage.setItem('talentmatch_manager', JSON.stringify(me));
        } catch {
          // Token is invalid or expired
          localStorage.removeItem('talentmatch_token');
          localStorage.removeItem('talentmatch_manager');
          setToken(null);
          setManager(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    setToken(data.access_token);
    setManager(data.manager);
    localStorage.setItem('talentmatch_token', data.access_token);
    localStorage.setItem('talentmatch_manager', JSON.stringify(data.manager));
  };

  const loginWithOtp = async (email: string, otp: string) => {
    const data = await authService.verifyOtp(email, otp);
    setToken(data.access_token);
    setManager(data.manager);
    localStorage.setItem('talentmatch_token', data.access_token);
    localStorage.setItem('talentmatch_manager', JSON.stringify(data.manager));
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setManager(null);
  };

  return (
    <AuthContext.Provider
      value={{
        manager,
        token,
        isAuthenticated: !!token && !!manager,
        isLoading,
        login,
        loginWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
