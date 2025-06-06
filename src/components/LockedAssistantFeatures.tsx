
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import SubscriptionButton from '@/components/SubscriptionButton';
import { Lock, Crown, CheckCircle, Eye, X } from 'lucide-react';
import { Assistant } from '@/data/assistants';

interface LockedAssistantFeaturesProps {
  assistant: Assistant;
  userPlan: 'free' | 'premium';
}

const LockedAssistantFeatures: React.FC<LockedAssistantFeaturesProps> = ({
  assistant,
  userPlan
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = assistant.icon;

  // Features detalhadas específicas para cada assistente
  const getDetailedFeatures = (assistantId: string) => {
    const featuresMap = {
      financas: [
        'Análise completa da situação financeira',
        'Planejamento de orçamento personalizado',
        'Estratégias de investimento inteligentes',
        'Controle de gastos em tempo real',
        'Simulador de aposentadoria',
        'Relatórios financeiros mensais'
      ],
      produtos: [
        'Comparação de produtos em tempo real',
        'Análise de custo-benefício detalhada',
        'Alertas de promoções personalizadas',
        'Histórico de preços dos produtos',
        'Recomendações baseadas em IA',
        'Scanner de códigos de barras'
      ],
      viagens: [
        'Roteiros personalizados por IA',
        'Comparação de preços de voos',
        'Sugestões de hospedagem otimizadas',
        'Planejamento de atividades locais',
        'Orçamento de viagem detalhado',
        'Documentação e vistos necessários'
      ],
      supermercado: [
        'Scanner inteligente de produtos',
        'Comparação nutricional automática',
        'Listas de compras otimizadas',
        'Alertas de validade e qualidade',
        'Recomendações de produtos saudáveis',
        'Análise de economia por compra'
      ]
    };
    
    return featuresMap[assistantId as keyof typeof featuresMap] || assistant.benefits;
  };

  const detailedFeatures = getDetailedFeatures(assistant.id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Features Premium
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mr-3`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              {assistant.title}
            </DialogTitle>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Descrição */}
          <div className="text-gray-300 text-lg leading-relaxed">
            {assistant.description}
          </div>

          {/* Features Premium */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Features Exclusivas Premium:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detailedFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demonstração visual */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Preview da Interface</CardTitle>
              <CardDescription className="text-gray-400">
                Veja como seria usar este assistente premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Mockup da interface */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-6 h-6 bg-gradient-to-br ${assistant.color} rounded`}></div>
                    <span className="text-white font-medium">{assistant.title}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Overlay de bloqueio */}
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-white font-medium">Desbloqueie com Premium</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparação de planos */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Upgrade para Premium</h4>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Economia de até 60%
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-medium text-gray-300 mb-2">Plano Gratuito</h5>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• 1 assistente apenas</li>
                  <li>• Funcionalidades básicas</li>
                  <li>• Sem atualizações premium</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-orange-300 mb-2">Plano Premium</h5>
                <ul className="space-y-1 text-sm text-orange-200">
                  <li>• Todos os 5 assistentes</li>
                  <li>• Todas as funcionalidades</li>
                  <li>• Atualizações prioritárias</li>
                  <li>• Suporte premium</li>
                </ul>
              </div>
            </div>
            
            <SubscriptionButton className="w-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LockedAssistantFeatures;
