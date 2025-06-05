
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
  source: 'api' | 'fallback';
}

// Cache de taxas de câmbio (6 horas para ser mais frequente)
const CACHE_DURATION_HOURS = 6;
const exchangeRateCache = new Map<string, { data: ExchangeRateResponse; timestamp: number }>();

// Taxas de fallback atualizadas para 2025
const FALLBACK_RATES = {
  'EUR_BRL': 6.70, // Taxa mais realista para EUR→BRL
  'USD_BRL': 6.10, // Taxa realista para USD→BRL
  'BRL_EUR': 0.149, // Inverso de EUR→BRL
  'BRL_USD': 0.164, // Inverso de USD→BRL
  'EUR_USD': 1.10,
  'USD_EUR': 0.91
};

const getExchangeRates = async (baseCurrency: string = 'EUR'): Promise<ExchangeRateResponse> => {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = exchangeRateCache.get(cacheKey);
  
  // Verificar se o cache ainda é válido
  if (cached && (Date.now() - cached.timestamp) < (CACHE_DURATION_HOURS * 60 * 60 * 1000)) {
    console.log('Usando taxas de câmbio do cache para:', baseCurrency);
    return cached.data;
  }

  try {
    console.log(`Buscando novas taxas de câmbio para ${baseCurrency}...`);
    
    // Tentar múltiplas APIs
    let response;
    let data;
    
    // API 1: Exchange Rates API
    try {
      response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (response.ok) {
        data = await response.json();
        console.log(`Taxas obtidas da Exchange Rates API para ${baseCurrency}`);
      }
    } catch (error) {
      console.log('Exchange Rates API falhou:', error);
    }
    
    // API 2: Fixer.io (backup)
    if (!data || !response?.ok) {
      try {
        response = await fetch(`https://api.fixer.io/latest?base=${baseCurrency}`);
        if (response?.ok) {
          data = await response.json();
          console.log(`Taxas obtidas da Fixer API para ${baseCurrency}`);
        }
      } catch (error) {
        console.log('Fixer API falhou:', error);
      }
    }
    
    if (data && data.rates) {
      // Armazenar no cache
      const rateData = {
        success: true,
        timestamp: Date.now(),
        base: baseCurrency,
        date: new Date().toISOString().split('T')[0],
        rates: data.rates
      };
      
      exchangeRateCache.set(cacheKey, {
        data: rateData,
        timestamp: Date.now()
      });
      
      console.log(`Novas taxas de câmbio obtidas para ${baseCurrency}:`, Object.keys(data.rates).slice(0, 5));
      return rateData;
    }
    
    throw new Error('Todas as APIs de câmbio falharam');
    
  } catch (error) {
    console.error('Erro ao obter taxas de câmbio, usando fallback:', error);
    
    // Taxas de fallback mais realistas
    const fallbackRates: { [key: string]: number } = {};
    
    if (baseCurrency === 'EUR') {
      fallbackRates['BRL'] = FALLBACK_RATES.EUR_BRL;
      fallbackRates['USD'] = FALLBACK_RATES.EUR_USD;
    } else if (baseCurrency === 'USD') {
      fallbackRates['BRL'] = FALLBACK_RATES.USD_BRL;
      fallbackRates['EUR'] = FALLBACK_RATES.USD_EUR;
    } else if (baseCurrency === 'BRL') {
      fallbackRates['EUR'] = FALLBACK_RATES.BRL_EUR;
      fallbackRates['USD'] = FALLBACK_RATES.BRL_USD;
    }
    
    // Adicionar taxa 1:1 para a própria moeda
    fallbackRates[baseCurrency] = 1;
    
    console.log('Usando taxas de fallback:', fallbackRates);
    
    return {
      success: false,
      timestamp: Date.now(),
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: fallbackRates
    };
  }
};

const convertCurrency = async (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<ConversionResult> => {
  console.log(`Iniciando conversão: ${amount} ${fromCurrency} → ${toCurrency}`);
  
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount,
      targetCurrency: toCurrency,
      exchangeRate: 1,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      source: 'api'
    };
  }
  
  const rates = await getExchangeRates(fromCurrency);
  const exchangeRate = rates.rates[toCurrency];
  
  if (!exchangeRate) {
    console.error(`Taxa de câmbio não encontrada para ${fromCurrency} → ${toCurrency}`);
    throw new Error(`Taxa de câmbio não encontrada para ${fromCurrency} → ${toCurrency}`);
  }
  
  const convertedAmount = amount * exchangeRate;
  
  // Validação: detectar valores suspeitos
  const isValueSuspicious = (
    (toCurrency === 'BRL' && convertedAmount < amount * 5) || // BRL deveria ser pelo menos 5x maior que EUR/USD
    (fromCurrency === 'BRL' && convertedAmount > amount * 0.2) || // Conversão de BRL deveria ser menor
    convertedAmount <= 0
  );
  
  if (isValueSuspicious) {
    console.warn(`Valor suspeito detectado: ${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency} (taxa: ${exchangeRate})`);
  }
  
  const result = {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    targetCurrency: toCurrency,
    exchangeRate: exchangeRate,
    timestamp: rates.timestamp,
    date: rates.date,
    source: rates.success ? 'api' as const : 'fallback' as const
  };
  
  console.log(`Conversão concluída: ${amount} ${fromCurrency} = ${result.convertedAmount} ${toCurrency} (taxa: ${exchangeRate}, fonte: ${result.source})`);
  
  return result;
};

const parseEuroPrice = (priceString: string): number => {
  console.log(`Parsing preço: "${priceString}"`);
  
  // Remove símbolos de moeda e espaços
  const cleanPrice = priceString.replace(/[€$R\s]/g, '');
  
  // Se for um range (ex: "20-35"), pega a média
  if (cleanPrice.includes('-')) {
    const parts = cleanPrice.split('-');
    if (parts.length === 2) {
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      
      if (!isNaN(min) && !isNaN(max)) {
        const average = (min + max) / 2;
        console.log(`Range detectado: ${min}-${max}, usando média: ${average}`);
        return average;
      }
    }
  }
  
  const singleValue = parseFloat(cleanPrice);
  if (!isNaN(singleValue)) {
    console.log(`Valor único parseado: ${singleValue}`);
    return singleValue;
  }
  
  console.warn(`Não foi possível parsear o preço: "${priceString}"`);
  return 0;
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
      console.error(`Valor inválido para conversão: ${finalAmount}`);
      return new Response(
        JSON.stringify({ error: 'Valor inválido para conversão' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
