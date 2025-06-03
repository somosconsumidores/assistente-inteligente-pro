
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssistantCards = () => {
  const assistants = [
    {
      id: 'direito',
      title: 'Mestre do Direito do Consumidor',
      description: 'Seu advogado pessoal para questões de consumo. Redige petições, orienta sobre direitos e te guia no processo judicial.',
      icon: Scale,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      features: ['Consultoria jurídica 24/7', 'Geração de petições', 'Guia passo a passo para JEC'],
      path: '/direito-consumidor'
    },
    {
      id: 'financas',
      title: 'Mestre das Finanças',
      description: 'Planejador financeiro pessoal que cria planos de recuperação, dashboards e metas personalizadas.',
      icon: DollarSign,
      color: 'from-green-600 to-blue-600',
      bgColor: 'from-green-50 to-blue-50',
      features: ['Plano financeiro personalizado', 'Dashboard de acompanhamento', 'Metas e alertas'],
      path: '/financas'
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Consultor de compras que compara produtos, analisa custo-benefício e recomenda a melhor escolha.',
      icon: ShoppingCart,
      color: 'from-orange-600 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      features: ['Comparação inteligente', 'Análise de custo-benefício', 'Recomendações personalizadas'],
      path: '/produtos'
    },
    {
      id: 'viagens',
      title: 'Mestre das Viagens',
      description: 'Planejador completo que cria roteiros personalizados com base no seu perfil, orçamento e estilo.',
      icon: Plane,
      color: 'from-sky-600 to-indigo-600',
      bgColor: 'from-sky-50 to-indigo-50',
      features: ['Roteiros personalizados', 'Sugestões de hospedagem', 'Integração com reservas'],
      path: '/viagens'
    },
    {
      id: 'supermercado',
      title: 'Mestre do Supermercado',
      description: 'Avaliador de produtos de supermercado que compara qualidade, preço e recomenda as melhores opções.',
      icon: ShoppingBasket,
      color: 'from-emerald-600 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      features: ['Scanner de produtos', 'Comparação de qualidade', 'Escolhas inteligentes'],
      path: '/supermercado'
    }
  ];

  return (
    <section id="assistentes" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Conheça Seus <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              5 Assistentes Especializados
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada assistente é um especialista em sua área, pronto para resolver seus problemas específicos 
            com inteligência artificial avançada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assistants.map((assistant) => {
            const IconComponent = assistant.icon;
            return (
              <Card 
                key={assistant.id} 
                className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${assistant.bgColor} border-0`}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {assistant.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {assistant.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {assistant.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={assistant.path}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity`}
                    >
                      Usar Assistente
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
            🚀 Todos os assistentes disponíveis em uma única plataforma
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssistantCards;
