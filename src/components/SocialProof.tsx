
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, MessageCircle, ThumbsUp } from 'lucide-react';

const SocialProof = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empreendedora",
      comment: "Os assistentes de IA mudaram completamente como eu gerencio meus negócios. Especialmente o assistente financeiro tem me ajudado muito!",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Advogado",
      comment: "O assistente de direito do consumidor é incrível. Me ajuda a entender processos complexos de forma simples e rápida.",
      rating: 5,
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Consultora de Viagens",
      comment: "Nunca foi tão fácil planejar viagens! O assistente de viagens cria roteiros perfeitos em segundos.",
      rating: 5,
      avatar: "AC"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Usuários Ativos", icon: Users },
    { value: "50,000+", label: "Consultas Realizadas", icon: MessageCircle },
    { value: "4.9/5", label: "Avaliação Média", icon: Star },
    { value: "98%", label: "Satisfação", icon: ThumbsUp }
  ];

  return (
    <section className="mobile-padding py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Mais de 10 mil pessoas já confiam em nossos assistentes
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
            Veja o que nossos usuários estão dizendo sobre os assistentes IA
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-300 text-sm sm:text-base mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-sm sm:text-base text-gray-400">
            Junte-se a milhares de usuários satisfeitos
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
