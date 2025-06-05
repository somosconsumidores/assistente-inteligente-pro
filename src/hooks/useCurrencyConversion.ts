
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: number;
  date: string;
}

export const useCurrencyConversion = () => {
  const [isConverting, setIsConverting] = useState(false);

  const convertCurrency = async (
    amount: number,
    fromCurrency: string = 'EUR',
    toCurrency: string = 'BRL'
  ): Promise<ConversionResult | null> => {
    setIsConverting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('currency-conversion', {
        body: {
          amount,
          fromCurrency,
          toCurrency
        }
      });

      if (error) throw error;
      
      return data as ConversionResult;
    } catch (error) {
      console.error('Erro ao converter moeda:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  const convertPriceString = async (
    priceString: string,
    fromCurrency: string = 'EUR',
    toCurrency: string = 'BRL'
  ): Promise<ConversionResult | null> => {
    setIsConverting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('currency-conversion', {
        body: {
          priceString,
          fromCurrency,
          toCurrency
        }
      });

      if (error) throw error;
      
      return data as ConversionResult;
    } catch (error) {
      console.error('Erro ao converter string de preço:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  const formatBRL = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return {
    convertCurrency,
    convertPriceString,
    formatBRL,
    isConverting
  };
};
