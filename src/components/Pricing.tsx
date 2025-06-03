
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para experimentar",
    features: [
      "1 assistente à sua escolha",
      "10 consultas por mês",
      "Histórico básico",
      "Suporte por email"
    ],
    buttonText: "Começar Grátis",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Premium",
    price: "R$ 29",
    period: "/mês",
    description: "Para uso completo e profissional",
    features: [
      "Todos os 5 assistentes",
      "Consultas ilimitadas",
      "Relatórios em PDF",
      "WhatsApp integrado",
      "Updates semanais",
      "Histórico completo",
      "Suporte prioritário"
    ],
    buttonText: "Assinar Premium",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "White Label",
    price: "R$ 297",
    period: "/mês",
    description: "Para empresas e influenciadores",
    features: [
      "Todos os recursos Premium",
      "Sua marca personalizada",
      "Domínio próprio",
      "API personalizada",
      "Suporte dedicado",
      "Treinamento incluído"
    ],
    buttonText: "Falar com Vendas",
    buttonVariant: "outline" as const,
    popular: false
  }
];

const Pricing = () => {
  return (
    <section id="precos" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comece gratuitamente e evolua conforme suas necessidades crescem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 bg-white scale-105' 
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full py-3 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : ''
                  }`}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            💳 Pagamento seguro • 🔄 Cancele quando quiser • 📱 Disponível 24/7
          </p>
          <p className="text-sm text-gray-500">
            Todos os planos incluem 7 dias de garantia. Não gostou? Devolvemos seu dinheiro.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
