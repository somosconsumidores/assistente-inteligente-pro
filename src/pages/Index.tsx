
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AssistantCards from '@/components/AssistantCards';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="safe-area-top safe-area-bottom">
        <Hero />
        <section className="mobile-padding py-8 sm:py-12 lg:py-16">
          <AssistantCards />
        </section>
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
