
import React from 'react';
import { Star } from 'lucide-react';
import FeaturedProducts from '../FeaturedProducts';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

interface RecommendationsTabProps {
  featuredProducts: FeaturedProduct[];
  lastQuery: string;
  lastRecommendations: any;
}

const RecommendationsTab = ({ featuredProducts, lastQuery, lastRecommendations }: RecommendationsTabProps) => {
  const validProducts = featuredProducts.filter(
    product => product.name && product.name.length >= 3 && 
    product.scoreMestre >= 1 && product.scoreMestre <= 10
  );

  if (validProducts.length > 0) {
    return (
      <div className="h-full overflow-y-auto">
        <FeaturedProducts 
          products={featuredProducts} 
          query={lastQuery} 
          recommendations={lastRecommendations} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center text-gray-500">
        <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Nenhuma recomendação ainda</h3>
        <p className="text-sm">
          Faça uma pergunta no chat para receber recomendações de produtos personalizadas
        </p>
      </div>
    </div>
  );
};

export default RecommendationsTab;
