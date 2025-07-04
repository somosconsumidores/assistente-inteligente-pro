
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AssistantCards from '@/components/AssistantCards';
import ExampleFlow from '@/components/ExampleFlow';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import { AddToHomeScreenDialog } from '@/components/AddToHomeScreenDialog';

const Index = () => {
  return (
    <div className="min-h-screen bg-futuristic text-foreground">
      <Header />
      <main className="safe-area-top safe-area-bottom">
        <Hero />
        
        {/* Independent Stats Section - Centered */}
        <section className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl pointer-events-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">6</div>
              <div className="text-sm sm:text-base text-gray-400">Assistentes Especializados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm sm:text-base text-gray-400">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm sm:text-base text-gray-400">Gratuito para começar</div>
            </div>
          </div>
        </section>
        <Hero />
        <section className="mobile-padding py-8 sm:py-12 lg:py-16">
          <AssistantCards />
        </section>
        <ExampleFlow />
        <Features />
        <Pricing />
        <SocialProof />
      </main>
      <Footer />
      <AddToHomeScreenDialog />
    </div>
  );
};

export default Index;
