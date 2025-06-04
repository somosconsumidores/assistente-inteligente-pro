import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductChat from '@/components/ProductChat';

const Produtos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-orange-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mestre dos Produtos</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
    </div>
  );
};

export default Produtos;
