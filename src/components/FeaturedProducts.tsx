
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, DollarSign } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  if (products.length === 0) {
    return null;
  }

  const getSealInfo = (seal: string) => {
    switch (seal) {
      case 'melhor':
        return {
          label: '🏆 Melhor da Avaliação',
          description: 'Melhor desempenho técnico',
          color: 'bg-yellow-500 text-white',
          icon: <Award className="w-4 h-4" />
        };
      case 'barato':
        return {
          label: '💰 Barato da Avaliação',
          description: 'Melhor custo-benefício',
          color: 'bg-green-500 text-white',
          icon: <DollarSign className="w-4 h-4" />
        };
      case 'recomendacao':
        return {
          label: '⭐ Nossa Recomendação',
          description: 'Melhor equilíbrio geral',
          color: 'bg-blue-500 text-white',
          icon: <Star className="w-4 h-4" />
        };
      default:
        return {
          label: 'Produto',
          description: '',
          color: 'bg-gray-500 text-white',
          icon: null
        };
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Produtos em Destaque</h2>
        <p className="text-gray-600">Produtos selecionados pelo Mestre dos Produtos com base em análise técnica e avaliações</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => {
          const sealInfo = getSealInfo(product.seal);
          
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Badge className={`absolute top-3 left-3 ${sealInfo.color}`}>
                  <div className="flex items-center gap-1">
                    {sealInfo.icon}
                    <span className="text-xs font-semibold">{sealInfo.label}</span>
                  </div>
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                <p className="text-sm text-gray-600">{sealInfo.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Preço Médio</p>
                    <p className="text-xl font-bold text-green-600">{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score Mestre</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-orange-600">{product.scoreMestre}</span>
                      <span className="text-sm text-gray-500">/10</span>
                    </div>
                  </div>
                </div>
                
                {product.link && (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                  >
                    Ver Produto
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;
