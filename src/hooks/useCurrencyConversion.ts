
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
  source: 'api' | 'fallback';
  isReliable: boolean;
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
      console.log(`Convertendo ${amount} ${fromCurrency} para ${toCurrency}`);
      
      const { data, error } = await supabase.functions.invoke('currency-conversion', {
        body: {
          amount,
          fromCurrency,
          toCurrency
        }
      });

      if (error) {
        console.error('Erro na edge function de conversão:', error);
        throw error;
      }
      
      const result = data as ConversionResult;
      
      // Validar se a conversão faz sentido
      const isReliable = validateConversion(result);
      
      if (!isReliable) {
        console.warn('Conversão parece incorreta:', result);
      }
      
      return {
        ...result,
        isReliable
      };
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
      console.log(`Convertendo string de preço: "${priceString}" de ${fromCurrency} para ${toCurrency}`);
      
      const { data, error } = await supabase.functions.invoke('currency-conversion', {
        body: {
          priceString,
          fromCurrency,
          toCurrency
        }
      });

      if (error) {
        console.error('Erro na edge function de conversão de string:', error);
        throw error;
      }
      
      const result = data as ConversionResult;
      
      // Validar se a conversão faz sentido
      const isReliable = validateConversion(result);
      
      return {
        ...result,
        isReliable
      };
    } catch (error) {
      console.error('Erro ao converter string de preço:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  const validateConversion = (result: ConversionResult): boolean => {
    const { originalAmount, convertedAmount, originalCurrency, targetCurrency, exchangeRate } = result;
    
    // Verificações básicas
    if (convertedAmount <= 0 || exchangeRate <= 0) {
      return false;
    }
    
    // Verificar se a taxa de câmbio está em um range razoável
    if (originalCurrency === 'EUR' && targetCurrency === 'BRL') {
      // EUR para BRL deve estar entre 5.5 e 8.0 (range razoável para 2025)
      return exchangeRate >= 5.5 && exchangeRate <= 8.0;
    }
    
    if (originalCurrency === 'USD' && targetCurrency === 'BRL') {
      // USD para BRL deve estar entre 5.0 e 7.5
      return exchangeRate >= 5.0 && exchangeRate <= 7.5;
    }
    
    if (originalCurrency === 'BRL' && targetCurrency === 'EUR') {
      // BRL para EUR deve estar entre 0.12 e 0.18
      return exchangeRate >= 0.12 && exchangeRate <= 0.18;
    }
    
    // Para outras conversões, verificar se não é muito extremo
    const ratio = convertedAmount / originalAmount;
    return ratio > 0.01 && ratio < 100; // Evitar conversões muito extremas
  };

  const formatBRL = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getConversionReliabilityMessage = (result: ConversionResult): string => {
    if (result.source === 'api' && result.isReliable) {
      return 'Conversão baseada em taxa de câmbio atual';
    } else if (result.source === 'fallback' && result.isReliable) {
      return 'Conversão baseada em taxa estimada (API indisponível)';
    } else {
      return 'Conversão pode estar imprecisa - verificar manualmente';
    }
  };

  return {
    convertCurrency,
    convertPriceString,
    formatBRL,
    getConversionReliabilityMessage,
    isConverting
  };
};
