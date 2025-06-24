
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, session, isLoading, setProfile } = useAuthState();
  const [actionLoading, setActionLoading] = useState(false);
  const { login, register, logout, updateSelectedAssistant } = useAuthActions(user, setProfile);

  const wrappedLogin = async (email: string, password: string) => {
    setActionLoading(true);
    try {
      await login(email, password);
    } finally {
      setActionLoading(false);
    }
  };

  const wrappedRegister = async (name: string, email: string, password: string, isPremium?: boolean) => {
    setActionLoading(true);
    try {
      await register(name, email, password, isPremium);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      login: wrappedLogin, 
      register: wrappedRegister, 
      logout, 
      isLoading: isLoading || actionLoading,
      updateSelectedAssistant
    }}>
      {children}
    </AuthContext.Provider>
  );
};
