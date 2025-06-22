
import { Assistant } from '@/data/assistants';

interface UseAssistantCardLogicProps {
  assistant: Assistant;
  userPlan: 'free' | 'premium';
  selectedAssistantId?: string | null;
}

interface AssistantCardState {
  isLocked: boolean;
  isSelected: boolean;
  cardActionText: string;
  isClickable: boolean;
}

export const useAssistantCardLogic = ({
  assistant,
  userPlan,
  selectedAssistantId
}: UseAssistantCardLogicProps): AssistantCardState => {
  let isLocked = false;
  let isSelected = false;
  let cardActionText = "Usar Assistente";
  let isClickable = true;

  // Se é premium, todos os assistentes estão disponíveis
  if (userPlan === 'premium') {
    cardActionText = "Usar Assistente";
    return {
      isLocked,
      isSelected,
      cardActionText,
      isClickable
    };
  }

  // Se é gratuito e assistente é premium, está bloqueado
  if (userPlan === 'free' && assistant.isPremium) {
    isLocked = true;
    isClickable = false;
    cardActionText = "Premium";
    return {
      isLocked,
      isSelected,
      cardActionText,
      isClickable
    };
  }

  // Se é usuário gratuito e assistente é gratuito
  if (userPlan === 'free' && !assistant.isPremium) {
    if (selectedAssistantId) {
      // Usuário já escolheu um assistente
      if (assistant.id === selectedAssistantId) {
        isSelected = true;
        cardActionText = "Usar Assistente";
      } else {
        isLocked = true;
        isClickable = false;
        cardActionText = "Bloqueado";
      }
    } else {
      // Primeiro acesso - pode escolher qualquer assistente gratuito
      cardActionText = "Selecionar Assistente";
    }
  }

  return {
    isLocked,
    isSelected,
    cardActionText,
    isClickable
  };
};
