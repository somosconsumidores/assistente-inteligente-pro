
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

  if (userPlan === 'free') {
    if (selectedAssistantId) {
      // Usuário já escolheu um assistente
      if (assistant.id === selectedAssistantId) {
        isSelected = true;
        cardActionText = "Usar Assistente";
      } else {
        isLocked = true;
        isClickable = false;
      }
    } else {
      // Primeiro acesso - pode escolher qualquer assistente
      cardActionText = "Selecionar Assistente";
    }
  }
  // Usuários premium podem acessar tudo

  return {
    isLocked,
    isSelected,
    cardActionText,
    isClickable
  };
};
