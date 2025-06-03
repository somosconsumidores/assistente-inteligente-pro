
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, FileText, Search, BookOpen, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "Interface Intuitiva",
    description: "Conversation natural em português brasileiro, fácil de usar para qualquer idade"
  },
  {
    icon: Calendar,
    title: "Histórico Completo",
    description: "Todas suas interações salvas por agente, sempre disponíveis quando precisar"
  },
  {
    icon: FileText,
    title: "Relatórios em PDF",
    description: "Exporte planos financeiros, roteiros de viagem e petições em formato profissional"
  },
  {
    icon: Search,
    title: "IA Especializada",
    description: "Cada assistente treinado especificamente para sua área de atuação"
  },
  {
    icon: BookOpen,
    title: "Updates Automáticos",
    description: "Receba lembretes e atualizações semanais via WhatsApp"
  },
  {
    icon: CheckCircle,
    title: "100% Seguro",
    description: "Seus dados protegidos e conversas privadas, conforme LGPD"
  }
];

const Features = () => {
  return (
    <section id="funcionalidades" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades que Fazem a Diferença
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desenvolvido pensando na praticidade e necessidades reais do consumidor brasileiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para Transformar sua Rotina?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Junte-se a milhares de brasileiros que já estão tomando decisões mais inteligentes com nossa IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors">
              Começar Gratuitamente
            </button>
            <button className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
              Falar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
