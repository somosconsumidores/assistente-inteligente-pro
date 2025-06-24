
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        plan: data.plan as 'free' | 'premium',
        selected_assistant_id: data.selected_assistant_id
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const checkSubscriptionStatus = async () => {
  try {
    await supabase.functions.invoke('check-subscription');
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }
};
