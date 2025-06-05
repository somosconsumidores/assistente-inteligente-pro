
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
  const validProducts = products.filter(
    product => product.name && product.name.length >= 3 && 
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
      setTimeout(() => setIsSaved(false), 3000); // Reset após 3 segundos
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">🏆 Produtos em Destaque</h2>
          <p className="text-gray-600">
            {validProducts.length === 1 
              ? '1 produto selecionado' 
              : `${validProducts.length} produtos selecionados`} pelo Mestre dos Produtos
          </p>
        </div>
        
        {query && recommendations && (
          <Button 
            onClick={handleSaveRecommendation} 
            disabled={isLoading || isSaved} 
            className="flex items-center gap-2" 
            variant={isSaved ? "default" : "outline"}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Salvo no Painel
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar no Painel
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className={`grid gap-6 ${
        validProducts.length === 1 
          ? 'md:grid-cols-1 max-w-md mx-auto' 
          : validProducts.length === 2 
          ? 'md:grid-cols-2' 
          : 'md:grid-cols-3'
      }`}>
        {validProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
