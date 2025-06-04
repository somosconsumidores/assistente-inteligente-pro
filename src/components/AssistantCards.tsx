
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
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AssistantCardsProps {
  userPlan?: 'free' | 'premium';
  onUpgrade?: () => void;
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
      gradient: 'gradient-blue-purple',
      gradientClass: 'from-blue-500 to-purple-600',
      available: true,
      isFree: true
    },
    {
      id: 'financas',
      title: 'Consultor Financeiro',
      description: 'Gestão financeira pessoal, investimentos e planejamento econômico inteligente.',
      icon: Calculator,
      path: '/financas',
      gradient: 'gradient-green-blue',
      gradientClass: 'from-emerald-500 to-blue-600',
      available: userPlan === 'premium',
      isFree: false
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Comparação de produtos, análise de custo-benefício e recomendações personalizadas.',
      icon: Package,
      path: '/produtos',
      gradient: 'gradient-purple-pink',
      gradientClass: 'from-violet-500 to-pink-600',
      available: userPlan === 'premium',
      isFree: false
    },
    {
      id: 'viagens',
      title: 'Consultor de Viagens',
      description: 'Planejamento de viagens, dicas de destinos e otimização de roteiros turísticos.',
      icon: MapPin,
      path: '/viagens',
      gradient: 'gradient-orange-red',
      gradientClass: 'from-orange-500 to-red-600',
      available: userPlan === 'premium',
      isFree: false
    },
    {
      id: 'supermercado',
      title: 'Assistente de Compras',
      description: 'Listas inteligentes de compras, comparação de preços e economia doméstica.',
      icon: ShoppingCart,
      path: '/supermercado',
      gradient: 'gradient-indigo-purple',
      gradientClass: 'from-indigo-500 to-purple-600',
      available: userPlan === 'premium',
      isFree: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {assistants.map((assistant) => {
        const Icon = assistant.icon;
        const isAvailable = userPlan ? assistant.available : true;
        
        return (
          <Card 
            key={assistant.id} 
            className={`relative overflow-hidden transition-all duration-300 group ${
              isAvailable 
                ? 'hover:scale-105 cursor-pointer hover:shadow-2xl hover:shadow-violet-500/20' 
                : 'opacity-60'
            } bg-slate-800 border-slate-700 rounded-2xl`}
          >
            {/* Background Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${assistant.gradientClass} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Premium Badge */}
            {userPlan && !isAvailable && (
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}

            {/* Free Badge */}
            {userPlan === 'free' && assistant.isFree && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gratuito
                </Badge>
              </div>
            )}
            
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${assistant.gradientClass} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-white mb-1">
                    {assistant.title}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed text-slate-400">
                {assistant.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              {userPlan ? (
                // Authenticated user view
                isAvailable ? (
                  <Link to={assistant.path}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${assistant.gradientClass} hover:opacity-90 text-white font-medium py-3 transition-all duration-200 rounded-xl shadow-lg group`}
                    >
                      <span>Acessar Assistente</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={onUpgrade}
                    variant="outline" 
                    className="w-full border-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 font-medium py-3 transition-all duration-200 rounded-xl"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                )
              ) : (
                // Landing page view
                <Link to="/login">
                  <Button 
                    className={`w-full bg-gradient-to-r ${assistant.gradientClass} hover:opacity-90 text-white font-medium py-3 transition-all duration-200 rounded-xl shadow-lg group`}
                  >
                    <span>Começar Agora</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssistantCards;
