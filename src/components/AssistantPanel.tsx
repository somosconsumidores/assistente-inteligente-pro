
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, Lock, Crown, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssistantPanelProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ userPlan, onUpgrade }) => {
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
    if (assistant.isPremium && userPlan !== 'premium') {
      return; // Não faz nada se for premium e o usuário não tem acesso
    }
    navigate(assistant.path);
  };

  const hasAccess = (assistant: typeof assistants[0]) => {
    return !assistant.isPremium || userPlan === 'premium';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assistants.map((assistant) => {
        const IconComponent = assistant.icon;
        const isAccessible = hasAccess(assistant);
        
        return (
          <Card 
            key={assistant.id} 
            className={`relative overflow-hidden transition-all duration-300 ${
              isAccessible 
                ? `hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${assistant.bgColor} border-0` 
                : 'bg-gray-50 border-2 border-gray-200 opacity-75'
            }`}
            onClick={() => handleAssistantClick(assistant)}
          >
            {/* Premium Badge */}
            {assistant.isPremium && (
              <div className="absolute top-4 right-4 z-10">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  userPlan === 'premium' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              </div>
            )}

            {/* Lock Overlay for Blocked Assistants */}
            {!isAccessible && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    Este assistente requer plano Premium
                  </p>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgrade();
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Faça Upgrade para Acessar
                  </Button>
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mb-4 ${
                !isAccessible ? 'opacity-50' : ''
              }`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <CardTitle className={`text-xl font-bold ${isAccessible ? 'text-gray-900' : 'text-gray-500'}`}>
                {assistant.title}
              </CardTitle>
              <CardDescription className={`leading-relaxed ${isAccessible ? 'text-gray-600' : 'text-gray-400'}`}>
                {assistant.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {assistant.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${
                      isAccessible ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${isAccessible ? 'text-gray-700' : 'text-gray-400'}`}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              
              {isAccessible && (
                <Button 
                  className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity`}
                >
                  Usar Assistente
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
