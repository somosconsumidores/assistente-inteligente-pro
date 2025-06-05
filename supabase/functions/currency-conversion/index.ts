
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: number;
  date: string;
}

// Cache de taxas de câmbio (24 horas)
const CACHE_DURATION_HOURS = 24;
const exchangeRateCache = new Map<string, { data: ExchangeRateResponse; timestamp: number }>();

const getExchangeRates = async (baseCurrency: string = 'EUR'): Promise<ExchangeRateResponse> => {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = exchangeRateCache.get(cacheKey);
  
  // Verificar se o cache ainda é válido
  if (cached && (Date.now() - cached.timestamp) < (CACHE_DURATION_HOURS * 60 * 60 * 1000)) {
    console.log('Usando taxas de câmbio do cache para:', baseCurrency);
    return cached.data;
  }

  try {
    // Usando Exchange Rates API (gratuita)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Erro na API de câmbio: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Armazenar no cache
    exchangeRateCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    console.log(`Novas taxas de câmbio obtidas para ${baseCurrency}:`, data.rates);
    return data;
    
  } catch (error) {
    console.error('Erro ao obter taxas de câmbio:', error);
    
    // Taxas de fallback em caso de erro na API
    const fallbackRates = {
      success: false,
      timestamp: Date.now(),
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: {
        'BRL': baseCurrency === 'EUR' ? 6.2 : 1,
        'EUR': baseCurrency === 'BRL' ? 0.16 : 1,
        'USD': baseCurrency === 'EUR' ? 1.1 : (baseCurrency === 'BRL' ? 0.18 : 1)
      }
    };
    
    console.log('Usando taxas de fallback:', fallbackRates);
    return fallbackRates;
  }
};

const convertCurrency = async (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<ConversionResult> => {
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount,
      targetCurrency: toCurrency,
      exchangeRate: 1,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
  }
  
  const rates = await getExchangeRates(fromCurrency);
  const exchangeRate = rates.rates[toCurrency];
  
  if (!exchangeRate) {
    throw new Error(`Taxa de câmbio não encontrada para ${fromCurrency} -> ${toCurrency}`);
  }
  
  const convertedAmount = amount * exchangeRate;
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    targetCurrency: toCurrency,
    exchangeRate: exchangeRate,
    timestamp: rates.timestamp,
    date: rates.date
  };
};

const parseEuroPrice = (priceString: string): number => {
  // Remove símbolos de moeda e espaços
  const cleanPrice = priceString.replace(/[€$R\s]/g, '');
  
  // Se for um range (ex: "20-35"), pega a média
  if (cleanPrice.includes('-')) {
    const [min, max] = cleanPrice.split('-').map(p => parseFloat(p));
    return (min + max) / 2;
  }
  
  return parseFloat(cleanPrice) || 0;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, fromCurrency, toCurrency, priceString } = await req.json()

    // Se foi passado um priceString (ex: "€20-35"), extrair o valor numérico
    const finalAmount = priceString ? parseEuroPrice(priceString) : amount;
    const finalFromCurrency = fromCurrency || 'EUR';
    const finalToCurrency = toCurrency || 'BRL';

    if (!finalAmount || finalAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido para conversão' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Convertendo: ${finalAmount} ${finalFromCurrency} -> ${finalToCurrency}`);

    const result = await convertCurrency(finalAmount, finalFromCurrency, finalToCurrency);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na conversão de moeda:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
