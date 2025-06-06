
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAssistantAccess = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const checkAssistantAccess = (assistantId: string): boolean => {
    // Se não tem profile carregado ainda
    if (!profile) return false;

    // Usuários premium têm acesso a tudo
    if (profile.plan === 'premium') return true;

    // Usuários gratuitos só têm acesso ao assistente selecionado
    if (profile.plan === 'free') {
      // Se ainda não selecionou um assistente, pode acessar qualquer um para escolher
      if (!profile.selected_assistant_id) return true;
      
      // Se já selecionou, só pode acessar o selecionado
      return profile.selected_assistant_id === assistantId;
    }

    return false;
  };

  const handleBlockedAccess = () => {
    toast({
      title: "Acesso Restrito",
      description: "Você já escolheu seu assistente gratuito. Faça upgrade para Premium para acessar todos os assistentes.",
      variant: "destructive"
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
    isAssistantSelected,
    hasSelectedAssistant,
    userPlan: profile?.plan || 'free',
    selectedAssistantId: profile?.selected_assistant_id
  };
};
