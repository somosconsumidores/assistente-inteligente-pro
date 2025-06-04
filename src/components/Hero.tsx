
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowDown, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-20 pb-16 px-4 bg-slate-900">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-full text-violet-300 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 mr-2" />
          5 Assistentes IA Especializados
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          Seus <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Copilotos Inteligentes
          </span>
          <br />
          para o Dia a Dia
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Resolva problemas complexos com facilidade. 5 assistentes de IA especializados em 
          Direito do Consumidor, Finanças, Produtos, Viagens e Supermercado.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-violet-500/25 animate-scale-in"
          >
            Começar Grátis Agora
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-10 py-4 text-lg border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl animate-scale-in"
          >
            Ver Demonstração
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="font-medium">Grátis para começar</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="font-medium">Disponível no WhatsApp</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="font-medium">IA 100% em Português</span>
          </div>
        </div>

        <div className="animate-bounce">
          <ArrowDown className="w-6 h-6 text-slate-500 mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
