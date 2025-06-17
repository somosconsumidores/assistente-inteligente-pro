import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star, Zap, Clock } from 'lucide-react';

const Pricing = () => {
  const plans = [{
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar',
    icon: Star,
    gradient: 'from-gray-600 to-gray-800',
    features: ['1 Assistente especializado', 'Escolha seu Assistente Preferido', 'Consultas ilimitadas', 'Suporte por email', 'Histórico de 30 dias'],
    cta: 'Começar Gratuitamente',
    ctaVariant: 'outline' as const,
    popular: false
  }, {
    name: 'Premium',
    price: 'R$ 9,90',
    period: '/mês',
    description: 'Acesso completo a todos os assistentes',
    icon: Crown,
    gradient: 'from-blue-600 to-purple-600',
    features: ['Todos os 5 assistentes', 'Consultas ilimitadas', 'Suporte prioritário 24/7', 'Histórico completo', 'Exportação de documentos', 'Análises avançadas', 'Atualizações em primeira mão'],
    cta: 'Upgrade para Premium',
    ctaVariant: 'default' as const,
    popular: true
  }];
  return <section id="precos" className="mobile-padding py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Acesso gratuito. Upgrade opcional. Liberdade total.</h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Comece gratuitamente e faça upgrade quando precisar de mais assistentes
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isFree = plan.name === 'Gratuito';
          return <Card key={index} className={`relative overflow-hidden border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500/50 hover:ring-blue-400/70 hover:shadow-2xl hover:shadow-blue-500/20' : 'hover:shadow-xl'} hover:-translate-y-1`}>
                <CardHeader className="p-6 sm:p-8 text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  {/* Selo "Acesso gratuito por tempo limitado" - logo abaixo do ícone */}
                  {isFree && <div className="mb-4">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 shadow-lg animate-pulse mx-auto w-fit">
                        <Clock className="w-3 h-3" />
                        Acesso gratuito por tempo limitado
                      </div>
                    </div>}

                  {/* Selo "Mais Popular" - logo abaixo do ícone */}
                  {plan.popular && <div className="mb-4">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm font-semibold mx-auto">
                        ⭐ Mais Popular
                      </Badge>
                    </div>}
                  
                  <CardTitle className="text-xl sm:text-2xl text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-base sm:text-lg text-gray-400">{plan.period}</span>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-400">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 pt-0">
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-300 leading-relaxed">
                          {feature}
                        </span>
                      </li>)}
                  </ul>

                  <Button asChild variant={plan.ctaVariant} size="lg" className={`w-full font-semibold py-3 sm:py-4 text-sm sm:text-base touch-target ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0'}`}>
                    <Link to="/register">
                      {plan.cta}
                    </Link>
                  </Button>

                  {plan.popular && <p className="text-xs sm:text-sm text-center text-gray-500 mt-3 sm:mt-4">
                      Cancele a qualquer momento
                    </p>}
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            💳 Aceitamos cartão de crédito, PIX e boleto bancário
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Todos os preços são em reais (BRL) e incluem impostos
          </p>
        </div>
      </div>
    </section>;
};
export default Pricing;
