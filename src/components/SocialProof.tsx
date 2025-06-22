import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, MessageCircle, ThumbsUp, ArrowRight, Rocket } from 'lucide-react';

const SocialProof = () => {
  const testimonials = [{
    name: "Maria Silva",
    role: "Empreendedora",
    comment: "Eu uso o Chat Inteligente todo dia. Só nisso eu economizo US$20 por mês",
    rating: 5,
    avatar: "MS"
  }, {
    name: "João Santos",
    role: "Advogado",
    comment: "Usei o assistente jurídico pra resolver uma treta com operadora de internet. Em 3 minutos tinha um modelo de mensagem pra enviar no Procon. Economizei tempo e ganhei respeito.",
    rating: 5,
    avatar: "JS"
  }, {
    name: "Ana Costa",
    role: "Assistente Administrativa",
    comment: "Meu maior desafio era entender onde estava gastando errado. O assistente financeiro me deu um plano em 5 minutos. Comecei a guardar 400 reais por mês.",
    rating: 5,
    avatar: "AC"
  }];
  const stats = [{
    value: "1,000+",
    label: "Usuários Ativos",
    icon: Users
  }, {
    value: "5,000+",
    label: "Consultas Realizadas",
    icon: MessageCircle
  }, {
    value: "4.9/5",
    label: "Avaliação Média",
    icon: Star
  }, {
    value: "98%",
    label: "Satisfação",
    icon: ThumbsUp
  }];
  const faqs = [
    {
      question: "É realmente grátis?",
      answer: "Sim. O plano inicial é 100% gratuito. Você só paga se quiser liberar todos os assistentes."
    },
    {
      question: "Isso é melhor que usar o ChatGPT?",
      answer: "Muito. Aqui, os assistentes são especializados, já vêm com conhecimento específico, e te poupam horas ajustando prompt."
    },
    {
      question: "É seguro colocar minhas informações?",
      answer: "Sim. Seus dados são criptografados e privados."
    },
    {
      question: "Preciso instalar algo?",
      answer: "Nada. Funciona direto do navegador, no celular ou computador."
    },
    {
      question: "E se eu não gostar?",
      answer: "Cancele a qualquer momento. Sem taxas. Sem perguntas."
    }
  ];

  return (
    <section className="mobile-padding py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Quem usa, não volta atrás.</h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
            Veja o que nossos usuários estão dizendo sobre os assistentes IA
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, index) => {
          const Icon = stat.icon;
          return <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>;
        })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
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
            </Card>)}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Ainda com dúvidas? Então vamos acabar com elas:
            </h3>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="text-blue-400 font-bold text-lg flex-shrink-0">→</div>
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-lg">{faq.question}</h4>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-16 sm:mt-20">
          <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-blue-500/20 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-6">
              <Rocket className="w-8 h-8 text-blue-400 mr-3" />
              <span className="text-2xl">🚀</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Comece agora com zero custo. Resolva mais, se preocupe menos.
            </h3>
            
            <div className="flex items-center justify-center gap-2 mb-6 text-base sm:text-lg text-gray-300">
              <span className="text-blue-400">📌</span>
              <p>Em menos de 2 minutos você já pode ter seu especialista digital respondendo suas perguntas.</p>
            </div>
            
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg mb-4 touch-target">
              <Link to="/register" className="flex items-center">
                Acessar gratuitamente agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <p className="text-gray-400 text-sm">
              Tenha mais inteligência à sua disposição.
            </p>
          </div>
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
