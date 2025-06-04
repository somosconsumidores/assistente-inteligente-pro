
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowDown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 animate-fade-in">
          🚀 5 Assistentes IA Especializados
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
          Seus <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Copilotos Inteligentes
          </span> para o Dia a Dia
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
          Resolva problemas complexos com facilidade. 5 assistentes de IA especializados em 
          Direito do Consumidor, Finanças, Produtos, Viagens e Supermercado.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold animate-scale-in"
          >
            Começar Grátis Agora
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 text-lg animate-scale-in"
          >
            Ver Demonstração
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Grátis para começar</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Disponível no WhatsApp</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>IA 100% em Português</span>
          </div>
        </div>

        <div className="animate-bounce">
          <ArrowDown className="w-6 h-6 text-gray-400 mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
