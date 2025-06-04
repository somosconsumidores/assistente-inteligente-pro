
import React from 'react';
import AssistantCards from './AssistantCards';

interface AssistantPanelProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
  isFirstAccess?: boolean;
}

const AssistantPanel = ({ userPlan, onUpgrade, isFirstAccess = false }: AssistantPanelProps) => {
  return (
    <div className="w-full">
      {/* Show message for first access */}
      {isFirstAccess && userPlan === 'free' && (
        <div className="mb-8 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-green-100 border-2 border-blue-300 rounded-xl p-4">
            <p className="text-blue-700 font-semibold mb-2">
              🎯 Escolha seu primeiro assistente
            </p>
            <p className="text-sm text-blue-600">
              Como usuário gratuito, você tem acesso ao <strong>Mestre do Direito do Consumidor</strong>. Para acessar todos os assistentes, faça upgrade para Premium.
            </p>
          </div>
        </div>
      )}
      
      <AssistantCards 
        userPlan={userPlan} 
        onUpgrade={onUpgrade}
        isFirstAccess={isFirstAccess}
      />
    </div>
  );
};

export default AssistantPanel;
