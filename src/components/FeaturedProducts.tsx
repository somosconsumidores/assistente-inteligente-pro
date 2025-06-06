
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
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2 text-gray-300">Aguardando recomendações</h3>
        <p className="text-sm leading-relaxed max-w-xs text-gray-400">
          Faça uma pergunta sobre produtos no chat e receba recomendações personalizadas aqui!
        </p>
      </div>
    );
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
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-300">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} baseado na sua consulta
        </p>
        
        {query && recommendations && (
          <Button 
            onClick={handleSaveRecommendation} 
            disabled={isLoading || isSaved}
            size="sm"
            className="w-full flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white border-orange-600" 
            variant={isSaved ? "default" : "outline"}
          >
            {isSaved ? (
              <>
                <Check className="w-3 h-3" />
                Salvo no Painel
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
      
      <div className="space-y-4">
        {validProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
