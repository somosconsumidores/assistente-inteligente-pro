
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SelectedAssistantCardProps {
  selectedAssistantId: string | null;
}

const SelectedAssistantCard: React.FC<SelectedAssistantCardProps> = ({ selectedAssistantId }) => {
  const navigate = useNavigate();

  const assistants = {
    direito: {
      title: 'Mestre do Direito do Consumidor',
      description: 'Advogado pessoal para questões de consumo, petições e orientação jurídica.',
      icon: Scale,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      path: '/direito-consumidor'
    },
    financas: {
      title: 'Mestre das Finanças',
      description: 'Planejador financeiro que cria planos de recuperação e metas personalizadas.',
      icon: DollarSign,
      color: 'from-green-600 to-blue-600',
      bgColor: 'from-green-50 to-blue-50',
      path: '/financas'
    },
    produtos: {
      title: 'Mestre dos Produtos',
      description: 'Consultor de compras que compara produtos e recomenda a melhor escolha.',
      icon: ShoppingCart,
      color: 'from-orange-600 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      path: '/produtos'
    },
    viagens: {
      title: 'Mestre das Viagens',
      description: 'Planejador completo que cria roteiros personalizados para suas viagens.',
      icon: Plane,
      color: 'from-sky-600 to-indigo-600',
      bgColor: 'from-sky-50 to-indigo-50',
      path: '/viagens'
    },
    supermercado: {
      title: 'Mestre do Supermercado',
      description: 'Avaliador de produtos que compara qualidade, preço e recomenda opções.',
      icon: ShoppingBasket,
      color: 'from-emerald-600 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      path: '/supermercado'
    }
  };

  if (!selectedAssistantId || !assistants[selectedAssistantId as keyof typeof assistants]) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-700">Meu Assistente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            Nenhum assistente selecionado ainda.
          </p>
          <Button 
            onClick={() => navigate('/select-assistant')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Selecionar Assistente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const assistant = assistants[selectedAssistantId as keyof typeof assistants];
  const IconComponent = assistant.icon;

  return (
    <Card className={`bg-gradient-to-br ${assistant.bgColor} border-2 border-blue-200 hover:shadow-lg transition-all duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={`w-10 h-10 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-800">Meu Assistente</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{assistant.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {assistant.description}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate(assistant.path)}
          className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
        >
          <span>Usar Assistente</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SelectedAssistantCard;
