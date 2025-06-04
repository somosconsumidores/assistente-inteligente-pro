import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import ProductChat from '@/components/ProductChat';
import { DashboardLayout } from '@/components/DashboardLayout';
const Produtos = () => {
  return <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-50">Mestre dos Produtos</h1>
                <p className="text-slate-50">
                  Compare produtos, encontre as melhores ofertas e receba recomendações personalizadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏆 Chat com o Mestre dos Produtos</CardTitle>
            <CardDescription>
              Converse diretamente com nosso especialista IA para comparar produtos, encontrar as melhores ofertas e receber recomendações personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductChat />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🎯 Como funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-green-700">
              <div className="text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-semibold mb-1">Pesquise</h4>
                <p className="text-sm">Digite qualquer produto que você quer comprar</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚖️</div>
                <h4 className="font-semibold mb-1">Compare</h4>
                <p className="text-sm">Receba análises técnicas com Score Mestre e selos de qualidade</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🛒</div>
                <h4 className="font-semibold mb-1">Compre</h4>
                <p className="text-sm">Acesse links diretos para as melhores ofertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
};
export default Produtos;