
import React, { useState } from 'react';
import ProductCard from './product/ProductCard';
import SaveRecommendationDialog from './SaveRecommendationDialog';
import { useSaveRecommendation } from '@/hooks/useSaveRecommendation';

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
  query?: string;
  recommendations?: any;
}

const FeaturedProducts = ({
  products,
  query,
  recommendations
}: FeaturedProductsProps) => {
  const {
    saveRecommendation,
    isLoading
  } = useSaveRecommendation();
  const [isSaved, setIsSaved] = useState(false);

  // Filter valid products
  const validProducts = products.filter(product => 
    product.name && product.name.length >= 3 && 
    product.scoreMestre >= 1 && product.scoreMestre <= 10
  );

  if (validProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2 text-gray-700">Aguardando recomendações</h3>
        <p className="text-sm leading-relaxed max-w-xs">
          Faça uma pergunta sobre produtos no chat e receba recomendações personalizadas aqui!
        </p>
      </div>
    );
  }

  const handleSaveRecommendation = async (customName?: string) => {
    if (!query || !recommendations) {
      console.warn('Query ou recommendations não disponíveis para salvar');
      return;
    }
    
    const success = await saveRecommendation(query, recommendations, validProducts, customName);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} baseado na sua consulta
        </p>
        
        {query && recommendations && (
          <SaveRecommendationDialog
            onSave={handleSaveRecommendation}
            isLoading={isLoading}
            isSaved={isSaved}
            disabled={!query || !recommendations}
          />
        )}
      </div>
      
      <div className="space-y-4">
        {validProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
