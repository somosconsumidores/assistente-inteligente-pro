import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductComparison } from '@/hooks/useProductComparison';
import ProductComparison from '@/components/ProductComparison';

const Produtos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading, analysis, error, compareProducts, clearAnalysis } = useProductComparison();

  const handleCompare = async () => {
    await compareProducts(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCompare();
    }
  };

  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 'R$ 7.299',
      rating: 4.8,
      reviews: 2341,
      image: '/placeholder.svg',
      pros: ['Câmera excelente', 'Performance top', 'Design premium'],
      cons: ['Preço alto', 'Bateria mediana']
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      price: 'R$ 5.999',
      rating: 4.6,
      reviews: 1876,
      image: '/placeholder.svg',
      pros: ['Custo-benefício', 'Tela incrível', 'Bateria durável'],
      cons: ['Interface complexa', 'Muitos apps pré-instalados']
    },
    {
      id: 3,
      name: 'Google Pixel 8',
      price: 'R$ 4.599',
      rating: 4.7,
      reviews: 954,
      image: '/placeholder.svg',
      pros: ['Android puro', 'IA avançada', 'Câmera com IA'],
      cons: ['Disponibilidade limitada', 'Assistência técnica']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-orange-600">
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
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏆 Comparar Produtos com IA</CardTitle>
            <CardDescription>
              Digite o produto que você quer comprar e nosso especialista IA vai analisar e comparar as melhores opções do mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ex: smartphone Samsung, notebook Dell, fone de ouvido Bluetooth..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleCompare}
                disabled={isLoading || !searchQuery.trim()}
              >
                {isLoading ? 'Analisando...' : 'Comparar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Comparison Results */}
        <ProductComparison 
          isLoading={isLoading}
          analysis={analysis}
          error={error}
          onClear={clearAnalysis}
        />

        {/* Example Results - only show if no analysis */}
        {!analysis && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Exemplo: Resultados para "smartphone"</h2>
              <div className="text-sm text-gray-600">3 produtos encontrados</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-24 h-24 object-contain" />
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{product.price}</span>
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Pontos Positivos:</h4>
                      <ul className="text-sm space-y-1">
                        {product.pros.map((pro, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Pontos de Atenção:</h4>
                      <ul className="text-sm space-y-1">
                        {product.cons.map((con, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="text-red-500">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">Ver Detalhes</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendation */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🎯 Experimente nossa IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  Digite qualquer produto na busca acima e nosso especialista IA fará uma análise completa com 
                  comparações, Score Mestre, selos de qualidade e recomendações personalizadas baseadas em 
                  dados reais do mercado brasileiro.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Produtos;
