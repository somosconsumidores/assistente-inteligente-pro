
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
        {/* Mobile-optimized content wrapper */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 safe-area-bottom">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
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

          {/* Chat Section */}
          <Card className="mb-6 sm:mb-8 border-gray-700 bg-gray-800/50">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">🏆 Chat com o Mestre dos Produtos</CardTitle>
              <CardDescription className="text-sm">
                Converse diretamente com nosso especialista IA para comparar produtos, encontrar as melhores ofertas e receber recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductChat />
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-700/50">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-orange-400 text-lg sm:text-xl">🎯 Como funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6'}`}>
                <div className="text-center p-4">
                  <div className="text-3xl sm:text-4xl mb-3">🔍</div>
                  <h4 className="font-semibold mb-2 text-orange-300 text-sm sm:text-base">Pesquise</h4>
                  <p className="text-xs sm:text-sm text-orange-200">Digite qualquer produto que você quer comprar</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl sm:text-4xl mb-3">⚖️</div>
                  <h4 className="font-semibold mb-2 text-orange-300 text-sm sm:text-base">Compare</h4>
                  <p className="text-xs sm:text-sm text-orange-200">Receba análises técnicas com Score Mestre e selos de qualidade</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl sm:text-4xl mb-3">🛒</div>
                  <h4 className="font-semibold mb-2 text-orange-300 text-sm sm:text-base">Compre</h4>
                  <p className="text-xs sm:text-sm text-orange-200">Acesse links diretos para as melhores ofertas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
