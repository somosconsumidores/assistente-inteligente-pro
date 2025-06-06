
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium';
  selected_assistant_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateSelectedAssistant: (assistantId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when authenticated
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            // Check subscription status after profile is loaded
            await checkSubscriptionStatus();
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(() => {
          checkSubscriptionStatus();
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          plan: data.plan as 'free' | 'premium',
          selected_assistant_id: data.selected_assistant_id
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      await supabase.functions.invoke('check-subscription');
      // Refetch profile to get updated plan
      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
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
        setProfile(prevProfile => prevProfile ? { ...prevProfile, selected_assistant_id: assistantId } : null);
      }
    } catch (error: any) {
      console.error('Error updating selected assistant:', error);
      throw new Error(error.message || 'Erro ao salvar escolha do assistente');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      login, 
      register, 
      logout, 
      isLoading,
      updateSelectedAssistant
    }}>
      {children}
    </AuthContext.Provider>
  );
};
