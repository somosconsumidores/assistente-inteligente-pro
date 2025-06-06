
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, MessageSquare, Scale, BarChart3 } from 'lucide-react';
import ProductChat from '@/components/ProductChat';
import ProductComparison from '@/components/ProductComparison';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const Produtos = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Mestre dos Produtos</h1>
                {!isMobile && (
                  <p className="text-xs sm:text-sm text-slate-400">
                    Compare produtos, encontre as melhores ofertas e receba recomendações personalizadas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full grid-cols-3 bg-gray-800 border-gray-700 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-300"
                >
                  <MessageSquare className="w-4 h-4" />
                  {!isMobile && <span>Chat</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="comparacao" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-300"
                >
                  <Scale className="w-4 h-4" />
                  {!isMobile && <span>Comparação</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="analise" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-300"
                >
                  <BarChart3 className="w-4 h-4" />
                  {!isMobile && <span>Análise</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-6">
                <Card className="border-gray-700 bg-gray-800/50 shadow-xl">
                  <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4 sm:pb-6'}`}>
                    <CardTitle className={`${isMobile ? 'text-lg' : 'text-lg sm:text-xl'} text-white`}>
                      🏆 Chat com o Mestre dos Produtos
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      {isMobile ? 
                        'Converse com nosso especialista IA para comparar produtos e receber recomendações' :
                        'Converse diretamente com nosso especialista IA para comparar produtos, encontrar as melhores ofertas e receber recomendações personalizadas'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={`${isMobile ? 'p-3' : 'p-4 sm:p-6'}`}>
                    <ProductChat />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparacao" className="space-y-6">
                <Card className="border-gray-700 bg-gray-800/50 shadow-xl">
                  <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4 sm:pb-6'}`}>
                    <CardTitle className={`${isMobile ? 'text-lg' : 'text-lg sm:text-xl'} text-white`}>
                      ⚖️ Comparação de Produtos
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      {isMobile ? 
                        'Envie fotos de produtos para comparação visual detalhada' :
                        'Envie fotos de até 3 produtos para análise e comparação visual detalhada'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={`${isMobile ? 'p-3' : 'p-4 sm:p-6'}`}>
                    <ProductComparison />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analise" className="space-y-6">
                <Card className="border-gray-700 bg-gray-800/50 shadow-xl">
                  <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4 sm:pb-6'}`}>
                    <CardTitle className={`${isMobile ? 'text-lg' : 'text-lg sm:text-xl'} text-white`}>
                      📊 Análise de Mercado
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      Análises detalhadas e insights sobre tendências de produtos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={`${isMobile ? 'p-3' : 'p-4 sm:p-6'}`}>
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-lg font-medium mb-2 text-gray-400">Em breve</h3>
                      <p className="text-sm leading-relaxed text-gray-500">
                        Funcionalidade de análise de mercado em desenvolvimento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
