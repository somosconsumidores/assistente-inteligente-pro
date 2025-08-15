
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { fetchUserProfile, checkSubscriptionStatus } from '@/utils/authUtils';
import { logUserAccess } from '@/utils/loginLogger';

export const useAuthState = () => {
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
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setProfile(userProfile);
            }
            // Check subscription status after profile is loaded
            await checkSubscriptionStatus();
            
            // Log access for session restoration (if it's a SIGNED_IN event)
            if (event === 'SIGNED_IN') {
              await logUserAccess(session.user.id, session.user.email || '', true);
            }
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
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (userProfile) {
            setProfile(userProfile);
          }
          checkSubscriptionStatus();
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    session,
    isLoading,
    setProfile
  };
};
