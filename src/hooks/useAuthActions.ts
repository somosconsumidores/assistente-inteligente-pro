
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';
import { fetchUserProfile } from '@/utils/authUtils';

export const useAuthActions = (
  user: User | null,
  setProfile: (profile: UserProfile | null) => void
) => {
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const register = async (name: string, email: string, password: string, isPremium?: boolean) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Prepare metadata for premium registration
      const metadata: any = {
        name: name
      };
      
      if (isPremium) {
        metadata.is_premium = 'true';
        console.log('Registering premium user with metadata:', metadata);
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setProfile(null);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  const updateSelectedAssistant = async (assistantId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ selected_assistant_id: assistantId })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Update local profile state
        const updatedProfile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          plan: data.plan as 'free' | 'premium',
          selected_assistant_id: assistantId
        };
        setProfile(updatedProfile);
      }
    } catch (error: any) {
      console.error('Error updating selected assistant:', error);
      throw new Error(error.message || 'Erro ao salvar escolha do assistente');
    }
  };

  return {
    login,
    register,
    logout,
    updateSelectedAssistant
  };
};
