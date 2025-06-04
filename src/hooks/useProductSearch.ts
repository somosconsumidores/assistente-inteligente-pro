
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductRecommendation {
  name: string;
  brand: string;
  price: string;
  reason: string;
  where_to_find: string;
  rating: number;
}

interface SearchResult {
  category: string;
  products: {
    cost_benefit: ProductRecommendation;
    best_quality: ProductRecommendation;
    premium: ProductRecommendation;
  };
  recommendation: string;
}

export const useProductSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setError('Digite o nome do produto para buscar');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-products', {
        body: {
          query: query.trim()
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao buscar produtos');
      }

      setSearchResult(data);
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado na busca');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResult(null);
    setError(null);
  };

  return {
    isSearching,
    searchResult,
    error,
    searchProducts,
    clearSearch
  };
};
