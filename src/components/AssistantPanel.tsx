
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
      {/* Show special message for first access */}
      {isFirstAccess && userPlan === 'free' && (
        <div className="mb-8 text-center">
          <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-4">
            <p className="text-green-700 font-semibold mb-2">
              👇 Seu assistente gratuito está destacado abaixo
            </p>
            <p className="text-sm text-green-600">
              Clique no card verde para começar a usar o Mestre do Direito do Consumidor
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
