
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, Lock, Crown, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssistantPanelProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
  selectedAssistantId?: string | null; // Add this
  onSelectAssistant?: (assistantId: string) => Promise<void>; // Add this
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ userPlan, onUpgrade, selectedAssistantId, onSelectAssistant }) => {
  const navigate = useNavigate();

  const assistants = [
    {
      id: 'direito',
      title: 'Mestre do Direito do Consumidor',
      description: 'Advogado pessoal para questões de consumo, petições e orientação jurídica.',
      icon: Scale,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      path: '/direito-consumidor',
      benefits: ['Consultoria jurídica 24/7', 'Geração de petições', 'Guia passo a passo'],
      isPremium: false
    },
    {
      id: 'financas',
      title: 'Mestre das Finanças',
      description: 'Planejador financeiro que cria planos de recuperação e metas personalizadas.',
      icon: DollarSign,
      color: 'from-green-600 to-blue-600',
      bgColor: 'from-green-50 to-blue-50',
      path: '/financas',
      benefits: ['Plano financeiro personalizado', 'Dashboard de controle', 'Metas inteligentes'],
      isPremium: true
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Consultor de compras que compara produtos e recomenda a melhor escolha.',
      icon: ShoppingCart,
      color: 'from-orange-600 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      path: '/produtos',
      benefits: ['Comparação inteligente', 'Análise de custo-benefício', 'Recomendações precisas'],
      isPremium: true
    },
    {
      id: 'viagens',
      title: 'Mestre das Viagens',
      description: 'Planejador completo que cria roteiros personalizados para suas viagens.',
      icon: Plane,
      color: 'from-sky-600 to-indigo-600',
      bgColor: 'from-sky-50 to-indigo-50',
      path: '/viagens',
      benefits: ['Roteiros personalizados', 'Sugestões de hospedagem', 'Planejamento completo'],
      isPremium: true
    },
    {
      id: 'supermercado',
      title: 'Mestre do Supermercado',
      description: 'Avaliador de produtos que compara qualidade, preço e recomenda opções.',
      icon: ShoppingBasket,
      color: 'from-emerald-600 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      path: '/supermercado',
      benefits: ['Scanner de produtos', 'Comparação de qualidade', 'Escolhas inteligentes'],
      isPremium: true
    }
  ];

  const handleAssistantClick = (assistant: typeof assistants[0]) => {
    const currentIsActuallyPremium = assistant.isPremium;
    let currentIsLocked = currentIsActuallyPremium && userPlan === 'free';
    let currentIsCardSelectableForFreeUser = false;

    if (userPlan === 'free') {
      if (selectedAssistantId) { 
        if (assistant.id !== selectedAssistantId) currentIsLocked = true;
        else currentIsLocked = false; 
      } else { 
        if (!currentIsActuallyPremium) {
          currentIsCardSelectableForFreeUser = true;
          currentIsLocked = false;
        }
      }
    }
    if (userPlan === 'premium') currentIsLocked = false;
    
    if (userPlan === 'free' && !selectedAssistantId && !currentIsActuallyPremium && onSelectAssistant) {
      onSelectAssistant(assistant.id);
      return; 
    }

    if (!currentIsLocked) {
      navigate(assistant.path);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assistants.map((assistant) => {
        const IconComponent = assistant.icon;
        const isActuallyPremium = assistant.isPremium;
        let isCardSelectableForFreeUser = false;
        let isCardSelectedByFreeUser = false;
        let cardActionText = "Usar Assistente";
        let isLocked = isActuallyPremium && userPlan === 'free';

        if (userPlan === 'free') {
          if (selectedAssistantId) {
            if (assistant.id === selectedAssistantId) {
              isCardSelectedByFreeUser = true;
              isLocked = false; 
            } else {
              isLocked = true; 
            }
          } else { 
            if (!isActuallyPremium) {
              isCardSelectableForFreeUser = true;
              isLocked = false;
              cardActionText = "Selecionar Assistente";
            }
          }
        }
        if (userPlan === 'premium') isLocked = false;

        const isEffectivelyAccessible = !isLocked || isCardSelectedByFreeUser || (userPlan === 'premium' && !isActuallyPremium) || (userPlan === 'premium' && isActuallyPremium);
        
        return (
          <Card 
            key={assistant.id} 
            className={`relative overflow-hidden transition-all duration-300 ${isCardSelectedByFreeUser ? 'border-2 border-green-500 shadow-lg' : (isEffectivelyAccessible ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '')} bg-gradient-to-br ${assistant.bgColor} ${!isCardSelectedByFreeUser && !isEffectivelyAccessible ? 'border-2 border-gray-200' : 'border-0'}`}
            onClick={() => handleAssistantClick(assistant)}
          >
            {/* Premium Badge */}
            {assistant.isPremium && (
              <div className="absolute top-4 right-4 z-10">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  (userPlan === 'premium' || isCardSelectedByFreeUser) // Show green if premium user or if it's the selected free one (though free ones aren't premium)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              </div>
            )}

            {/* Lock Overlay for Blocked Assistants */}
            {(isLocked && !isCardSelectedByFreeUser && !(userPlan === 'free' && !selectedAssistantId && !assistant.isPremium)) && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {assistant.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    { userPlan === 'free' && selectedAssistantId && assistant.id !== selectedAssistantId 
                      ? "Você já selecionou outro assistente gratuito."
                      : "Este assistente requer plano Premium ou uma seleção (plano gratuito)."
                    }
                  </p>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgrade();
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Faça Upgrade para Acessar Todos
                  </Button>
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mb-4`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {assistant.title}
              </CardTitle>
              <CardDescription className="leading-relaxed text-gray-600">
                {assistant.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {assistant.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              
              { !isLocked && (
                <Button 
                  className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity`}
                >
                  {cardActionText}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssistantPanel;
