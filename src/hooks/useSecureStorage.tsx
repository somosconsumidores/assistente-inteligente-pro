
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export function useSecureStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const setSecureItem = async (key: string, value: string) => {
    try {
      setIsLoading(true);
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key, value });
      } else {
        // Fallback para localStorage em web
        localStorage.setItem(`secure_${key}`, value);
      }
      
      toast({
        title: "Dados salvos",
        description: "Os dados foram salvos com segurança",
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSecureItem = async (key: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      if (Capacitor.isNativePlatform()) {
        const result = await Preferences.get({ key });
        return result.value;
      } else {
        // Fallback para localStorage em web
        return localStorage.getItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      toast({
        title: "Erro ao recuperar",
        description: "Não foi possível recuperar os dados",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSecureItem = async (key: string) => {
    try {
      setIsLoading(true);
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key });
      } else {
        // Fallback para localStorage em web
        localStorage.removeItem(`secure_${key}`);
      }
      
      toast({
        title: "Dados removidos",
        description: "Os dados foram removidos com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      setIsLoading(true);
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.clear();
      } else {
        // Fallback para localStorage em web
        const keys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
        keys.forEach(key => localStorage.removeItem(key));
      }
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados foram removidos",
      });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast({
        title: "Erro ao limpar",
        description: "Não foi possível limpar os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    clearAll,
    isLoading
  };
}
