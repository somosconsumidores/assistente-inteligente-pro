
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const assistants = [
  {
    id: 1,
    name: "Mestre do Direito do Consumidor",
    icon: "👨‍⚖️",
    description: "Seu advogado pessoal para direitos do consumidor",
    features: [
      "Responde dúvidas jurídicas",
      "Redige petições para o JEC",
      "Passo a passo para ações judiciais",
      "Suporte 24/7 humanizado"
    ],
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50",
    problem: "Não sabe como agir diante de abusos de empresas"
  },
  {
    id: 2,
    name: "Mestre das Finanças",
    icon: "💰",
    description: "Planejador financeiro pessoal inteligente",
    features: [
      "Plano de recuperação financeira",
      "Dashboard semanal no WhatsApp",
      "Metas e alertas personalizados",
      "Controle de despesas automatizado"
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    problem: "Falta de orientação financeira prática e personalizada"
  },
  {
    id: 3,
    name: "Mestre dos Produtos",
    icon: "🛍️",
    description: "Consultor de compras inteligentes",
    features: [
      "Compara produtos similares",
      "Perguntas inteligentes sobre uso",
      "Recomendações personalizadas",
      "Melhor custo-benefício"
    ],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    problem: "Dificuldade em comparar produtos de forma confiável"
  },
  {
    id: 4,
    name: "Mestre das Viagens",
    icon: "✈️",
    description: "Planejador de viagens completo",
    features: [
      "Roteiro diário personalizado",
      "Sugestões de hospedagem e passeios",
      "Links diretos para reservas",
      "Opções econômicas e premium"
    ],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    problem: "Planejamento de viagem é estressante e desorganizado"
  },
  {
    id: 5,
    name: "Mestre do Supermercado",
    icon: "🛒",
    description: "Avaliador de produtos de supermercado",
    features: [
      "Análise por foto ou nome",
      "Compara qualidade e preço",
      "Recomenda melhor escolha",
      "Funciona com qualquer item"
    ],
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    problem: "Escolher itens é confuso e caro, com pouca transparência"
  }
];

const AssistantCards = () => {
  return (
    <section id="assistentes" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Conheça Seus Assistentes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada assistente é especializado em resolver problemas específicos do seu dia a dia, 
            funcionando como verdadeiros copilotos inteligentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assistants.map((assistant, index) => (
            <Card 
              key={assistant.id} 
              className={`${assistant.bgColor} border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {assistant.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {assistant.name}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  {assistant.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-2">❌ Problema:</p>
                  <p className="text-sm text-gray-700">{assistant.problem}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">✨ Funcionalidades:</p>
                  <ul className="space-y-1">
                    {assistant.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity`}
                >
                  Experimentar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AssistantCards;
