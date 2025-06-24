
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium';
  selected_assistant_id?: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, isPremium?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateSelectedAssistant: (assistantId: string) => Promise<void>;
}
