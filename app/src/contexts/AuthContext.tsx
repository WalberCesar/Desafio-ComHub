'use client';

// =============================================================================
// CONTEXTO DE AUTENTICAÇÃO - Frontend PitchLab
// =============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import type { User, AuthFormData } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Métodos de autenticação
  identify: (name: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: AuthFormData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Socket.IO
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER DO CONTEXTO
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // =============================================================================
  // VERIFICAR USUÁRIO LOGADO AO INICIALIZAR
  // =============================================================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        apiClient.setToken(token);
        const response = await apiClient.getMe();
        
        if (response.success && response.data) {
          // Handle both response formats: data directly or data.user
          const userData = response.data.user || response.data;
          setUser(userData);
          connectSocket();
        } else {
          // Token inválido, limpar
          localStorage.removeItem('token');
          apiClient.setToken(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        apiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // =============================================================================
  // MÉTODOS DE AUTENTICAÇÃO
  // =============================================================================

  const identify = async (name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.identify({ name });
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Salvar token no localStorage
        localStorage.setItem('token', token);
        apiClient.setToken(token);
        setUser(userData);
        connectSocket();
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erro ao se identificar' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(data);
      
      if (response.success && response.data) {
        // Registro bem-sucedido, mas não faz login automático
        // O usuário será direcionado para fazer login manualmente
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Erro ao criar conta' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Salvar token no localStorage
        localStorage.setItem('token', token);
        apiClient.setToken(token);
        setUser(userData);
        connectSocket();
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Credenciais inválidas' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
      disconnectSocket();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // =============================================================================
  // SOCKET.IO MANAGEMENT
  // =============================================================================

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (token) {
      socketClient.connect(token);
    }
  };

  const disconnectSocket = () => {
    socketClient.disconnect();
  };

  // =============================================================================
  // CLEANUP AO DESMONTAR
  // =============================================================================

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // =============================================================================
  // VALOR DO CONTEXTO
  // =============================================================================

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    identify,
    register,
    login,
    logout,
    connectSocket,
    disconnectSocket,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// HOOK PARA USAR O CONTEXTO
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}