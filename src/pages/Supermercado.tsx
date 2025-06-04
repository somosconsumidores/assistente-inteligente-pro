
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Search, Star, ShoppingBasket } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const Supermercado = () => {
  const [activeTab, setActiveTab] = useState('scanner');

  const comparisons = [
    {
      category: 'Molho de Tomate',
      products: [
        { name: 'Pomarola Tradicional', price: 'R$ 2,89', rating: 4.2, recommendation: 'Melhor custo-benefício' },
        { name: 'Quero Basilico', price: 'R$ 3,49', rating: 4.6, recommendation: 'Melhor sabor' },
        { name: 'Fugini Premium', price: 'R$ 4,29', rating: 4.8, recommendation: 'Premium' }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assistente de Compras no Supermercado</h1>
                <p className="text-gray-600">
                  Scanner de produtos, comparação de preços e recomendações inteligentes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant={activeTab === 'scanner' ? 'default' : 'outline'}
            onClick={() => setActiveTab('scanner')}
            className="flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Scanner</span>
          </Button>
          <Button 
            variant={activeTab === 'search' ? 'default' : 'outline'}
            onClick={() => setActiveTab('search')}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </Button>
        </div>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scanner de Produtos</CardTitle>
                <CardDescription>Tire uma foto do produto na gôndola para comparar qualidade e preços</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Fotografe o produto</h3>
                  <p className="text-gray-600 mb-4">Aponte a câmera para o produto que você quer analisar</p>
                  <Button>Abrir Câmera</Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">ou</p>
                  <Button variant="outline">Enviar Foto da Galeria</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-medium mb-2">1. Fotografe</h4>
                    <p className="text-sm text-gray-600">Tire uma foto do produto na prateleira</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-medium mb-2">2. Analisamos</h4>
                    <p className="text-sm text-gray-600">Nossa IA identifica e compara o produto</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-medium mb-2">3. Recomendamos</h4>
                    <p className="text-sm text-gray-600">Receba a melhor recomendação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produto</CardTitle>
                <CardDescription>Digite o nome do produto para ver comparações e recomendações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Ex: molho de tomate, azeite, sabão em pó..."
                      className="pl-10"
                    />
                  </div>
                  <Button>Buscar</Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {comparisons.map((comparison, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Comparação: {comparison.category}</CardTitle>
                  <CardDescription>3 opções encontradas na sua região</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparison.products.map((product, productIndex) => (
                      <div key={productIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBasket className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-lg font-bold text-green-600">{product.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{product.rating}</span>
                        </div>
                        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {product.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800">🎯 Minha Recomendação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700 mb-4">
                  Para molho de tomate, recomendo o <strong>Pomarola Tradicional</strong>. 
                  Tem ótima qualidade, ingredientes simples e o melhor custo-benefício. 
                  Ideal para uso diário na cozinha.
                </p>
                <div className="space-y-2 text-sm text-emerald-600">
                  <p>✓ Sem conservantes artificiais</p>
                  <p>✓ Consistência ideal para massas</p>
                  <p>✓ Marca tradicional e confiável</p>
                  <p>✓ Preço justo pelo que oferece</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Supermercado;
