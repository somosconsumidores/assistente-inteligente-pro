
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Calculator, 
  Package, 
  MapPin, 
  ShoppingCart, 
  Crown, 
  Lock,
  Sparkles
} from 'lucide-react';

interface AssistantCardsProps {
  userPlan: 'free' | 'premium';
  onUpgrade: () => void;
  isFirstAccess?: boolean;
}

const AssistantCards = ({ userPlan, onUpgrade, isFirstAccess = false }: AssistantCardsProps) => {
  const assistants = [
    {
      id: 'direito-consumidor',
      title: 'Mestre do Direito do Consumidor',
      description: 'Especialista em defesa dos direitos do consumidor, análise de contratos e orientações legais.',
      icon: Scale,
      path: '/direito-consumidor',
      gradient: 'from-blue-500 to-blue-700',
      available: true,
      highlight: userPlan === 'free'
    },
    {
      id: 'financas',
      title: 'Consultor Financeiro',
      description: 'Gestão financeira pessoal, investimentos e planejamento econômico inteligente.',
      icon: Calculator,
      path: '/financas',
      gradient: 'from-green-500 to-green-700',
      available: userPlan === 'premium',
      highlight: false
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Comparação de produtos, análise de custo-benefício e recomendações personalizadas.',
      icon: Package,
      path: '/produtos',
      gradient: 'from-purple-500 to-purple-700',
      available: userPlan === 'premium',
      highlight: false
    },
    {
      id: 'viagens',
      title: 'Consultor de Viagens',
      description: 'Planejamento de viagens, dicas de destinos e otimização de roteiros turísticos.',
      icon: MapPin,
      path: '/viagens',
      gradient: 'from-orange-500 to-orange-700',
      available: userPlan === 'premium',
      highlight: false
    },
    {
      id: 'supermercado',
      title: 'Assistente de Compras',
      description: 'Listas inteligentes de compras, comparação de preços e economia doméstica.',
      icon: ShoppingCart,
      path: '/supermercado',
      gradient: 'from-red-500 to-red-700',
      available: userPlan === 'premium',
      highlight: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assistants.map((assistant) => {
        const Icon = assistant.icon;
        const isAvailable = assistant.available;
        const shouldHighlight = isFirstAccess && assistant.highlight;
        
        return (
          <Card 
            key={assistant.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl group ${
              shouldHighlight 
                ? 'ring-4 ring-green-400 ring-opacity-75 shadow-2xl scale-105 animate-pulse' 
                : isAvailable 
                  ? 'hover:scale-105 cursor-pointer' 
                  : 'opacity-60'
            } ${shouldHighlight ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-white'}`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${assistant.gradient} opacity-5`} />
            
            {/* Premium Badge */}
            {!isAvailable && (
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}

            {/* First Access Highlight Badge */}
            {shouldHighlight && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-500 text-white border-green-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Seu Assistente!
                </Badge>
              </div>
            )}
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${assistant.gradient} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className={`text-xl ${shouldHighlight ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
                  {assistant.title}
                </CardTitle>
              </div>
              <CardDescription className={`text-sm leading-relaxed ${shouldHighlight ? 'text-green-600' : 'text-gray-600'}`}>
                {assistant.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {isAvailable ? (
                <Link to={assistant.path}>
                  <Button 
                    className={`w-full bg-gradient-to-r ${assistant.gradient} hover:opacity-90 text-white font-medium py-2 transition-all duration-200 ${
                      shouldHighlight ? 'ring-2 ring-green-400 ring-offset-2 shadow-lg' : ''
                    }`}
                  >
                    {shouldHighlight ? '🎯 Começar Agora!' : 'Acessar Assistente'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={onUpgrade}
                  variant="outline" 
                  className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50 font-medium py-2 transition-all duration-200"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssistantCards;
