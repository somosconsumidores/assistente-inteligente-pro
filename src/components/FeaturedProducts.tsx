
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, DollarSign, ExternalLink } from 'lucide-react';

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
          label: 'Melhor da Avaliação',
          emoji: '🏆',
          description: 'Melhor desempenho técnico',
          color: 'bg-yellow-500 text-white',
          bgColor: 'from-yellow-50 to-orange-50',
          icon: <Award className="w-4 h-4" />
        };
      case 'barato':
        return {
          label: 'Barato da Avaliação',
          emoji: '💰',
          description: 'Melhor custo-benefício',
          color: 'bg-green-500 text-white',
          bgColor: 'from-green-50 to-emerald-50',
          icon: <DollarSign className="w-4 h-4" />
        };
      case 'recomendacao':
        return {
          label: 'Nossa Recomendação',
          emoji: '⭐',
          description: 'Melhor equilíbrio geral',
          color: 'bg-blue-500 text-white',
          bgColor: 'from-blue-50 to-indigo-50',
          icon: <Star className="w-4 h-4" />
        };
      default:
        return {
          label: 'Produto',
          emoji: '',
          description: '',
          color: 'bg-gray-500 text-white',
          bgColor: 'from-gray-50 to-slate-50',
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
            <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br ${sealInfo.bgColor} border-2`}>
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para uma imagem de tênis genérica
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                <Badge className={`absolute top-3 left-3 ${sealInfo.color} shadow-lg`}>
                  <div className="flex items-center gap-1">
                    {sealInfo.icon}
                    <span className="text-xs font-semibold">{sealInfo.emoji} {sealInfo.label}</span>
                  </div>
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight text-gray-900">{product.name}</CardTitle>
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
                      <span className="text-2xl font-bold text-orange-600">{product.scoreMestre.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver Ofertas
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;
