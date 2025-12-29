
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

export const useAssistantAccess = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { subscribed, subscription_tier } = useSubscription();

  const checkAssistantAccess = (assistantId: string): boolean => {
    console.log('[useAssistantAccess] Checking access for assistant:', assistantId);
    console.log('[useAssistantAccess] User profile:', profile);
    console.log('[useAssistantAccess] Subscription:', { subscribed, subscription_tier });

    // Se não tem profile carregado ainda
    if (!profile) {
      console.log('[useAssistantAccess] No profile loaded, denying access');
      return false;
    }

    // Usuários com assinatura ativa (premium ou trial) têm acesso a tudo
    if (subscribed || profile.plan === 'premium') {
      console.log('[useAssistantAccess] Subscribed/Premium user, granting access');
      return true;
    }

    // Usuários gratuitos só têm acesso ao assistente selecionado
    if (profile.plan === 'free') {
      // Se ainda não selecionou um assistente, NÃO tem acesso
      if (!profile.selected_assistant_id) {
        console.log('[useAssistantAccess] Free user without selected assistant, denying access');
        return false;
      }
      
      // Se já selecionou, só pode acessar o selecionado
      const hasAccess = profile.selected_assistant_id === assistantId;
      console.log('[useAssistantAccess] Free user access check:', {
        selectedAssistant: profile.selected_assistant_id,
        requestedAssistant: assistantId,
        hasAccess
      });
      return hasAccess;
    }

    console.log('[useAssistantAccess] Unknown plan, denying access');
    return false;
  };

  const handleBlockedAccess = () => {
    toast({
      title: "Acesso Restrito",
      description: "Você já escolheu seu assistente gratuito. Faça upgrade para Premium para acessar todos os assistentes.",
      variant: "destructive"
    });
  };

  const handleNoAssistantSelected = () => {
    toast({
      title: "Escolha seu Assistente",
      description: "Primeiro você precisa escolher um assistente na página de seleção.",
      variant: "default"
    });
  };

  const isAssistantSelected = (assistantId: string): boolean => {
    return profile?.selected_assistant_id === assistantId;
  };

  const hasSelectedAssistant = (): boolean => {
    return !!profile?.selected_assistant_id;
  };

  return {
    checkAssistantAccess,
    handleBlockedAccess,
    handleNoAssistantSelected,
    isAssistantSelected,
    hasSelectedAssistant,
    userPlan: profile?.plan || 'free',
    selectedAssistantId: profile?.selected_assistant_id
  };
};
