
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAccess } from '@/hooks/useAssistantAccess';
import { useAssistantCardLogic } from '@/hooks/useAssistantCardLogic';
import { assistants, Assistant } from '@/data/assistants';
import AssistantCard from '@/components/AssistantCard';
import DashboardNavigation from '@/components/DashboardNavigation';

interface AssistantPanelProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
  selectedAssistantId?: string | null;
  onSelectAssistant?: (assistantId: string) => Promise<void>;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ 
  userPlan, 
  onUpgrade, 
  selectedAssistantId, 
  onSelectAssistant 
}) => {
  const navigate = useNavigate();
  const { checkAssistantAccess } = useAssistantAccess();

  // Show all assistants, but users will only be able to interact with appropriate ones
  const availableAssistants = assistants;

  const handleAssistantClick = (assistant: Assistant) => {
    console.log('[AssistantPanel] Clicked on assistant:', assistant.id);
    console.log('[AssistantPanel] User plan:', userPlan);
    console.log('[AssistantPanel] Selected assistant:', selectedAssistantId);

    // Se é usuário premium, pode acessar qualquer assistente
    if (userPlan === 'premium') {
      console.log('[AssistantPanel] Premium user, navigating to:', assistant.path);
      navigate(assistant.path);
      return;
    }

    // Se é usuário gratuito
    if (userPlan === 'free') {
      // Verificar se o assistente é premium
      if (assistant.isPremium) {
        console.log('[AssistantPanel] Free user tried to access premium assistant');
        onUpgrade();
        return;
      }

      // Se ainda não selecionou um assistente, pode escolher qualquer um gratuito
      if (!selectedAssistantId && onSelectAssistant) {
        console.log('[AssistantPanel] Free user selecting first assistant:', assistant.id);
        onSelectAssistant(assistant.id);
        return;
      }
      
      // Se já selecionou um assistente, verifica se tem acesso
      const hasAccess = checkAssistantAccess(assistant.id);
      if (hasAccess) {
        console.log('[AssistantPanel] Free user has access, navigating to:', assistant.path);
        navigate(assistant.path);
        return;
      }
      
      // Se clicou em um assistente diferente do selecionado, não faz nada (está bloqueado)
      console.log('[AssistantPanel] Free user access denied for assistant:', assistant.id);
      return;
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão para acessar o dashboard */}
      <DashboardNavigation />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableAssistants.map((assistant) => {
          const cardLogic = useAssistantCardLogic({
            assistant,
            userPlan,
            selectedAssistantId
          });

          return (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              userPlan={userPlan}
              selectedAssistantId={selectedAssistantId}
              onAssistantClick={handleAssistantClick}
              {...cardLogic}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AssistantPanel;
