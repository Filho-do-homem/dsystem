
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  type User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import the auth instance

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null; // Expose Firebase user object if needed
  login: (emailAttempt: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Comentário:
// Esta implementação do AuthContext agora usa o Firebase Authentication.
// A responsabilidade principal pela segurança da autenticação (armazenamento de senhas,
// gerenciamento de sessão, etc.) foi transferida para o Firebase.
// Certifique-se de que seu projeto Firebase está configurado corretamente
// e que as regras de segurança do Firestore/Realtime Database/Storage (se usadas)
// estão configuradas para proteger seus dados.

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged lida com a persistência da sessão automaticamente
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (emailAttempt: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailAttempt, passwordAttempt);
      // onAuthStateChanged irá atualizar o estado do usuário e isLoading
      // router.replace('/dashboard') é geralmente tratado no useEffect da página de login ou no layout
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setUser(null); 
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged irá atualizar o estado do usuário
      router.push('/login'); // Redireciona após o logout
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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
