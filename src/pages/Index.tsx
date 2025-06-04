
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AssistantCards from '@/components/AssistantCards';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <Hero />
      <AssistantCards />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
