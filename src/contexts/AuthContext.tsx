
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameAttempt: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// !!! PROTOTYPE ONLY - INSECURE FOR PRODUCTION !!!
// Estas credenciais são fixas no código apenas para fins de demonstração deste protótipo.
// Em uma aplicação real, a autenticação DEVE ser tratada de forma segura em um servidor backend,
// com senhas armazenadas usando hash e outras práticas de segurança robustas.
const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "password";
// !!! END PROTOTYPE ONLY !!!

const AUTH_STORAGE_KEY = "dsystem-auth-status";

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Para fins de protótipo, o estado de autenticação é verificado no localStorage.
    // Isso é conveniente para desenvolvimento, mas pode ter implicações de segurança
    // se dados sensíveis fossem armazenados ou se vulnerabilidades XSS existissem.
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuthStatus === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Could not access localStorage for auth status:", error);
      // Se o localStorage não estiver disponível, o padrão é não autenticado.
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (usernameAttempt: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    // Simula um atraso de chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));

    // !!! PROTOTYPE ONLY - INSECURE !!!
    // A verificação de login está sendo feita no lado do cliente com credenciais fixas.
    // NUNCA FAÇA ISSO EM PRODUÇÃO.
    if (usernameAttempt === HARDCODED_USERNAME && passwordAttempt === HARDCODED_PASSWORD) {
      setIsAuthenticated(true);
      try {
        // Persiste o estado de autenticação no localStorage para o protótipo.
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch (error) {
        console.error("Could not set auth status in localStorage:", error);
      }
      setIsLoading(false);
      return true;
    }
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Could not remove auth status from localStorage:", error);
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Could not remove auth status from localStorage:", error);
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

