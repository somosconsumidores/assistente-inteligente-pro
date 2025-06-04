
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AssistantCards from '@/components/AssistantCards';
import QuickStartSection from '@/components/QuickStartSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* Banner promocional roxo */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-center py-3 px-4">
        <p className="text-sm font-medium">
          🎉 Experimente nossos assistentes IA gratuitamente - Sem cartão de crédito necessário
        </p>
      </div>
      
      <Hero />
      
      {/* Seção principal de assistentes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O que você gostaria de criar?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Escolha um dos nossos assistentes especializados e transforme suas ideias em realidade
            </p>
          </div>
          
          <AssistantCards />
        </div>
      </section>
      
      <QuickStartSection />
      <Footer />
    </div>
  );
};

export default Index;
