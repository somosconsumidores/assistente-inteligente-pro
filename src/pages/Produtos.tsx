
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import ProductChat from '@/components/ProductChat';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const Produtos = () => {
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Mobile-optimized content wrapper with better spacing */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Mestre dos Produtos</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Compare produtos, encontre as melhores ofertas e receba recomendações personalizadas
                </p>
              </div>
            </div>
          </div>

          {/* Chat Section - Melhor espaçamento */}
          <div className="mb-16">
            <Card className="border-gray-700 bg-gray-800/50 shadow-xl">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-white">🏆 Chat com o Mestre dos Produtos</CardTitle>
                <CardDescription className="text-sm text-gray-300">
                  Converse diretamente com nosso especialista IA para comparar produtos, encontrar as melhores ofertas e receber recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ProductChat />
              </CardContent>
            </Card>
          </div>

          {/* Info Card - Espaçamento aumentado para evitar sobreposição */}
          <div className="mt-20">
            <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-700/50 shadow-xl">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-orange-400 text-lg sm:text-xl">🎯 Como funciona?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-3 gap-8'}`}>
                  <div className="text-center p-6 bg-orange-900/20 rounded-lg border border-orange-700/30">
                    <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                    <h4 className="font-semibold mb-3 text-orange-300 text-base sm:text-lg">Pesquise</h4>
                    <p className="text-sm sm:text-base text-orange-200 leading-relaxed">Digite qualquer produto que você quer comprar</p>
                  </div>
                  <div className="text-center p-6 bg-orange-900/20 rounded-lg border border-orange-700/30">
                    <div className="text-4xl sm:text-5xl mb-4">⚖️</div>
                    <h4 className="font-semibold mb-3 text-orange-300 text-base sm:text-lg">Compare</h4>
                    <p className="text-sm sm:text-base text-orange-200 leading-relaxed">Receba análises técnicas com Score Mestre e selos de qualidade</p>
                  </div>
                  <div className="text-center p-6 bg-orange-900/20 rounded-lg border border-orange-700/30">
                    <div className="text-4xl sm:text-5xl mb-4">🛒</div>
                    <h4 className="font-semibold mb-3 text-orange-300 text-base sm:text-lg">Compre</h4>
                    <p className="text-sm sm:text-base text-orange-200 leading-relaxed">Acesse links diretos para as melhores ofertas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
