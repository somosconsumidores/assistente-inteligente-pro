
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductComparison = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compareProducts = async (query: string) => {
    if (!query.trim()) {
      setError('Por favor, digite o produto que deseja comparar');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Calling comparar-produtos function with query:', query);
      
      const { data, error: functionError } = await supabase.functions.invoke('comparar-produtos', {
        body: { query }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Erro ao processar comparação');
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('Nenhuma análise retornada');
      }
    } catch (err) {
      console.error('Error comparing products:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    isLoading,
    analysis,
    error,
    compareProducts,
    clearAnalysis
  };
};
