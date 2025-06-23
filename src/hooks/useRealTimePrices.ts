
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceResult {
  price: number;
  currency: string;
  source: string;
  store_name: string;
  product_url?: string;
  confidence: 'high' | 'medium' | 'low';
  last_updated: string;
}

interface ProductPriceData {
  product_name: string;
  brand?: string;
  prices: PriceResult[];
  average_price: number;
  min_price: number;
  max_price: number;
  confidence_level: 'real' | 'estimated';
}

export const useRealTimePrices = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProductPrices = useCallback(async (productName: string, brand?: string): Promise<ProductPriceData | null> => {
    if (!productName.trim()) {
      setError('Nome do produto é obrigatório');
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`Searching real-time prices with multi-source integration for: ${productName}`);
      
      const { data, error: functionError } = await supabase.functions.invoke('search-product-prices', {
        body: {
          product_name: productName.trim(),
          brand: brand?.trim()
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao buscar preços');
      }

      console.log('Multi-source price data received:', data);
      
      // Log source breakdown for debugging
      if (data?.prices) {
        const sourceBreakdown = data.prices.reduce((acc: any, price: PriceResult) => {
          acc[price.source] = (acc[price.source] || 0) + 1;
          return acc;
        }, {});
        console.log('Price sources breakdown:', sourceBreakdown);
      }
      
      return data;
    } catch (err) {
      console.error('Error searching product prices:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado na busca de preços');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchMultipleProducts = useCallback(async (products: Array<{name: string, brand?: string}>): Promise<ProductPriceData[]> => {
    if (products.length === 0) return [];

    setIsSearching(true);
    setError(null);

    try {
      console.log(`Searching prices for ${products.length} products with multi-source integration`);
      
      const searchPromises = products.map(product => 
        searchProductPrices(product.name, product.brand)
      );
      
      const results = await Promise.allSettled(searchPromises);
      
      const successfulResults: ProductPriceData[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          successfulResults.push(result.value);
        } else {
          console.warn(`Failed to get prices for product ${index}:`, result);
        }
      });
      
      console.log(`Successfully found prices for ${successfulResults.length} out of ${products.length} products`);
      return successfulResults;
    } catch (err) {
      console.error('Error searching multiple product prices:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado na busca de preços');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [searchProductPrices]);

  return {
    isSearching,
    error,
    searchProductPrices,
    searchMultipleProducts
  };
};
