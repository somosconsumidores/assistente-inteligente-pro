
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import ProductCard from './product/ProductCard';
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
    return null;
  }

  const handleSaveRecommendation = async () => {
    if (!query || !recommendations) {
      console.warn('Query ou recommendations não disponíveis para salvar');
      return;
    }
    
    const success = await saveRecommendation(query, recommendations, validProducts);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} baseado na sua consulta
        </p>
        
        {query && recommendations && (
          <Button 
            onClick={handleSaveRecommendation} 
            disabled={isLoading || isSaved}
            size="sm"
            className="flex items-center gap-2" 
            variant={isSaved ? "default" : "outline"}
          >
            {isSaved ? (
              <>
                <Check className="w-3 h-3" />
                Salvo
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                Salvar no Painel
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className={`grid gap-4 ${
        validProducts.length === 1 
          ? 'grid-cols-1 max-w-sm mx-auto' 
          : validProducts.length === 2 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {validProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
