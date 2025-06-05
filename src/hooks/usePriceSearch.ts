
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceSearchResult {
  activityName: string;
  location: string;
  estimatedPrice: string;
  currency: string;
  source: 'google_places' | 'cache' | 'estimate';
  confidence: 'high' | 'medium' | 'low';
}

export const usePriceSearch = () => {
  const [isSearching, setIsSearching] = useState(false);

  const searchActivityPrice = async (
    activityName: string, 
    location: string
  ): Promise<PriceSearchResult | null> => {
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-activity-prices', {
        body: {
          activityName,
          location
        }
      });

      if (error) throw error;
      
      return data as PriceSearchResult;
    } catch (error) {
      console.error('Erro ao buscar preço da atividade:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchActivityPrice,
    isSearching
  };
};
