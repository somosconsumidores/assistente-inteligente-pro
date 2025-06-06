import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubscriptionButton from '@/components/SubscriptionButton';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, Lock, Crown, CheckCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAccess } from '@/hooks/useAssistantAccess';

interface AssistantPanelProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
  selectedAssistantId?: string | null;
  onSelectAssistant?: (assistantId: string) => Promise<void>;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ userPlan, onUpgrade, selectedAssistantId, onSelectAssistant }) => {
  const navigate = useNavigate();
  const { checkAssistantAccess } = useAssistantAccess();

  const assistants = [
    {
      id: 'direito',
      title: 'Mestre do Direito do Consumidor',
      description: 'Advogado pessoal para questões de consumo, petições e orientação jurídica.',
      icon: Scale,
      color: 'from-blue-400 to-purple-400',
      bgColor: 'from-blue-900/20 to-purple-900/20',
      path: '/direito-consumidor',
      benefits: ['Consultoria jurídica 24/7', 'Geração de petições', 'Guia passo a passo'],
      isPremium: false
    },
    {
      id: 'financas',
      title: 'Mestre das Finanças',
      description: 'Planejador financeiro que cria planos de recuperação e metas personalizadas.',
      icon: DollarSign,
      color: 'from-green-400 to-blue-400',
      bgColor: 'from-green-900/20 to-blue-900/20',
      path: '/financas',
      benefits: ['Plano financeiro personalizado', 'Dashboard de controle', 'Metas inteligentes'],
      isPremium: true
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Consultor de compras que compara produtos e recomenda a melhor escolha.',
      icon: ShoppingCart,
      color: 'from-orange-400 to-red-400',
      bgColor: 'from-orange-900/20 to-red-900/20',
      path: '/produtos',
      benefits: ['Comparação inteligente', 'Análise de custo-benefício', 'Recomendações precisas'],
      isPremium: true
    },
    {
      id: 'viagens',
      title: 'Mestre das Viagens',
      description: 'Planejador completo que cria roteiros personalizados para suas viagens.',
      icon: Plane,
      color: 'from-sky-400 to-indigo-400',
      bgColor: 'from-sky-900/20 to-indigo-900/20',
      path: '/viagens',
      benefits: ['Roteiros personalizados', 'Sugestões de hospedagem', 'Planejamento completo'],
      isPremium: true
    },
    {
      id: 'supermercado',
      title: 'Mestre do Supermercado',
      description: 'Avaliador de produtos que compara qualidade, preço e recomenda opções.',
      icon: ShoppingBasket,
      color: 'from-emerald-400 to-green-400',
      bgColor: 'from-emerald-900/20 to-green-900/20',
      path: '/supermercado',
      benefits: ['Scanner de produtos', 'Comparação de qualidade', 'Escolhas inteligentes'],
      isPremium: true
    }
  ];

  const handleAssistantClick = (assistant: typeof assistants[0]) => {
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
      // Se ainda não selecionou um assistente, pode escolher qualquer um
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
      <div className="flex justify-center">
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Acessar Meu Painel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => {
          const IconComponent = assistant.icon;
          
          // Lógica para determinar o estado do card baseado no plano e assistente selecionado
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
        
          return (
            <Card 
              key={assistant.id} 
              className={`relative overflow-hidden transition-all duration-300 ${
                isSelected 
                  ? 'border-2 border-green-400 shadow-lg bg-gray-800/50' 
                  : isClickable 
                    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gray-800/30 border-gray-700' 
                    : 'border-2 border-gray-600 bg-gray-800/20'
              } bg-gradient-to-br ${assistant.bgColor} backdrop-blur-sm`}
              onClick={() => isClickable && handleAssistantClick(assistant)}
            >
              {/* Badge do assistente */}
              <div className="absolute top-4 right-4 z-10">
                {isSelected && userPlan === 'free' ? (
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-blue-400 text-white">
                    <CheckCircle className="w-3 h-3" />
                    <span>Plano Gratuito</span>
                  </div>
                ) : assistant.isPremium ? (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    userPlan === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    <Crown className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                ) : null}
              </div>

              {/* Lock Overlay para assistentes bloqueados */}
              {isLocked && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {assistant.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 font-medium">
                      Você já selecionou outro assistente gratuito.
                    </p>
                    <SubscriptionButton 
                      size="sm"
                    />
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  {assistant.title}
                </CardTitle>
                <CardDescription className="leading-relaxed text-gray-300">
                  {assistant.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {assistant.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
                      <span className="text-sm text-gray-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                
                {!isLocked && (
                  <Button 
                    className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity text-white`}
                  >
                    {cardActionText}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AssistantPanel;
