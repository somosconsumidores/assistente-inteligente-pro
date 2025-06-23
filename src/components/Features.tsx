
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Zap, Clock, Users, Target, CheckCircle, Star } from 'lucide-react';

const Features = () => {
  const features = [{
    icon: Brain,
    title: 'IA Especializada',
    description: 'Cada assistente é treinado especificamente para sua área de atuação.',
    gradient: 'from-purple-500 to-pink-500'
  }, {
    icon: Shield,
    title: 'Seguro e Confiável',
    description: 'Suas informações são protegidas com criptografia de ponta.',
    gradient: 'from-green-500 to-teal-500'
  }, {
    icon: Zap,
    title: 'Respostas Rápidas',
    description: 'Obtenha soluções instantâneas para seus problemas.',
    gradient: 'from-yellow-500 to-orange-500'
  }, {
    icon: Clock,
    title: 'Disponível 24/7',
    description: 'Nossos assistentes estão sempre prontos para ajudar.',
    gradient: 'from-blue-500 to-cyan-500'
  }, {
    icon: Users,
    title: 'Para Toda Família',
    description: 'Assistentes úteis para diferentes necessidades do dia a dia.',
    gradient: 'from-red-500 to-pink-500'
  }, {
    icon: Target,
    title: 'Resultados Precisos',
    description: 'Soluções personalizadas baseadas em suas necessidades específicas.',
    gradient: 'from-indigo-500 to-purple-500'
  }];

  const benefits = [
    'Escolha gratuitamente 1 assistente',
    'Interface otimizada para mobile',
    'Suporte técnico especializado',
    'Atualizações constantes da IA',
    'Histórico de conversas salvo',
    'Exportação de documentos'
  ];

  return (
    <section id="funcionalidades" className="mobile-padding py-12 sm:py-16 lg:py-20 bg-gray-950/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Por que escolher a Biblioteca IA?</h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Tecnologia de ponta para resolver seus problemas do dia a dia com eficiência e precisão
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover-lift transition-all duration-300 group">
                <CardHeader className="p-4 sm:p-6 text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-white mb-2 sm:mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardContent className="p-0">
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-gray-800">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 mb-3 sm:mb-4">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-green-300">
                    Benefícios Inclusos
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Tudo que você precisa em um só lugar
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed">
                  Nossa plataforma oferece recursos completos para facilitar seu dia a dia
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
