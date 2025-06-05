import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache de preços para evitar muitas chamadas à API
const CACHE_DURATION_DAYS = 30;

interface PriceSearchResult {
  activityName: string;
  location: string;
  estimatedPrice: string;
  estimatedPriceBRL: string;
  currency: string;
  originalCurrency: string;
  exchangeRate?: number;
  exchangeDate?: string;
  source: 'google_places' | 'cache' | 'estimate';
  confidence: 'high' | 'medium' | 'low';
}

// Função para converter moeda via nossa edge function
const convertToBRL = async (priceString: string, fromCurrency: string = 'EUR'): Promise<{
  convertedPrice: string;
  exchangeRate: number;
  exchangeDate: string;
}> => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase.functions.invoke('currency-conversion', {
      body: {
        priceString: priceString,
        fromCurrency: fromCurrency,
        toCurrency: 'BRL'
      }
    });

    if (error) {
      console.error('Erro na conversão:', error);
      // Fallback com taxa fixa
      const fallbackRate = fromCurrency === 'EUR' ? 6.2 : 1;
      const numericPrice = parseFloat(priceString.replace(/[€$R\s-]/g, '')) || 0;
      return {
        convertedPrice: `R$ ${Math.round(numericPrice * fallbackRate)}`,
        exchangeRate: fallbackRate,
        exchangeDate: new Date().toISOString().split('T')[0]
      };
    }

    return {
      convertedPrice: `R$ ${Math.round(data.convertedAmount)}`,
      exchangeRate: data.exchangeRate,
      exchangeDate: data.date
    };
  } catch (error) {
    console.error('Erro na função de conversão:', error);
    // Fallback
    const fallbackRate = fromCurrency === 'EUR' ? 6.2 : 1;
    const numericPrice = parseFloat(priceString.replace(/[€$R\s-]/g, '')) || 0;
    return {
      convertedPrice: `R$ ${Math.round(numericPrice * fallbackRate)}`,
      exchangeRate: fallbackRate,
      exchangeDate: new Date().toISOString().split('T')[0]
    };
  }
};

// Função para buscar preços via Nova Google Places API
const searchGooglePlacesNew = async (activityName: string, location: string): Promise<PriceSearchResult | null> => {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  
  if (!apiKey) {
    console.log('Google Places API key not configured, using estimates');
    return null;
  }

  try {
    // Usar a nova Text Search API
    const searchQuery = `${activityName} ${location}`;
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.priceRange,places.types,places.rating,places.userRatingCount'
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: 1,
        languageCode: 'pt'
      })
    });

    if (!searchResponse.ok) {
      console.error('Erro na busca Places API:', searchResponse.status, searchResponse.statusText);
      return null;
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.places || searchData.places.length === 0) {
      console.log('Nenhum lugar encontrado para:', searchQuery);
      return null;
    }

    const place = searchData.places[0];
    console.log('Lugar encontrado:', place.displayName?.text, 'Tipos:', place.types);

    // Verificar se tem dados de preço diretos
    let estimatedPrice = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let currency = 'EUR';

    if (place.priceRange) {
      // Nova API retorna range de preços estruturado
      const startPrice = place.priceRange.startPrice;
      const endPrice = place.priceRange.endPrice;
      
      if (startPrice && endPrice) {
        estimatedPrice = `${startPrice.currencyCode || 'EUR'} ${startPrice.units || 0}-${endPrice.units || 0}`;
        currency = startPrice.currencyCode || 'EUR';
        confidence = 'high';
        
        console.log('Preço encontrado na nova API:', estimatedPrice);
      }
    }

    // Se não tem preço direto, usar estimativa baseada em tipos e avaliações
    if (!estimatedPrice) {
      const types = place.types || [];
      const rating = place.rating || 0;
      const userRatingCount = place.userRatingCount || 0;
      
      // Usar avaliações para ajustar estimativas
      let multiplier = 1;
      if (rating >= 4.5 && userRatingCount > 100) {
        multiplier = 1.3; // Lugares bem avaliados tendem a ser mais caros
      } else if (rating < 3.5) {
        multiplier = 0.8; // Lugares mal avaliados tendem a ser mais baratos
      }

      if (types.includes('museum')) {
        const basePrice = Math.round(20 * multiplier);
        estimatedPrice = `€${basePrice}-${basePrice + 15}`;
        confidence = 'medium';
      } else if (types.includes('restaurant') || types.includes('food') || types.includes('meal_takeaway')) {
        const basePrice = Math.round(35 * multiplier);
        estimatedPrice = `€${basePrice}-${basePrice + 25}`;
        confidence = 'medium';
      } else if (types.includes('tourist_attraction') || types.includes('establishment')) {
        const basePrice = Math.round(15 * multiplier);
        estimatedPrice = `€${basePrice}-${basePrice + 20}`;
        confidence = 'medium';
      } else if (types.includes('lodging')) {
        const basePrice = Math.round(80 * multiplier);
        estimatedPrice = `€${basePrice}-${basePrice + 50}`;
        confidence = 'medium';
      } else {
        // Estimativa genérica
        const basePrice = Math.round(25 * multiplier);
        estimatedPrice = `€${basePrice}-${basePrice + 20}`;
        confidence = 'low';
      }
    }

    return {
      activityName,
      location,
      estimatedPrice,
      currency,
      source: 'google_places',
      confidence
    };

  } catch (error) {
    console.error('Erro ao buscar na nova Google Places API:', error);
    return null;
  }
};

// Função para gerar estimativas baseadas na região quando APIs falham
const generateEstimate = (activityName: string, location: string): PriceSearchResult => {
  const activityLower = activityName.toLowerCase();
  const locationLower = location.toLowerCase();
  
  // Identificar tipo de atividade
  let estimatedPrice = '';
  
  if (activityLower.includes('museu') || activityLower.includes('museum')) {
    if (locationLower.includes('paris') || locationLower.includes('londres') || locationLower.includes('new york')) {
      estimatedPrice = '€20-35';
    } else if (locationLower.includes('tailândia') || locationLower.includes('vietnam') || locationLower.includes('india')) {
      estimatedPrice = '€3-8';
    } else {
      estimatedPrice = '€10-25';
    }
  } else if (activityLower.includes('restaurante') || activityLower.includes('restaurant') || 
             activityLower.includes('jantar') || activityLower.includes('almoço') || 
             activityLower.includes('bistro') || activityLower.includes('café')) {
    if (locationLower.includes('paris') || locationLower.includes('londres') || locationLower.includes('new york')) {
      estimatedPrice = '€35-65';
    } else if (locationLower.includes('tailândia') || locationLower.includes('vietnam') || locationLower.includes('india')) {
      estimatedPrice = '€8-20';
    } else {
      estimatedPrice = '€20-45';
    }
  } else if (activityLower.includes('torre') || activityLower.includes('tower') || 
             activityLower.includes('observatório') || activityLower.includes('miradouro')) {
    if (locationLower.includes('paris') || locationLower.includes('londres') || locationLower.includes('new york')) {
      estimatedPrice = '€25-45';
    } else {
      estimatedPrice = '€15-30';
    }
  } else {
    // Atividade genérica
    if (locationLower.includes('paris') || locationLower.includes('londres') || locationLower.includes('new york')) {
      estimatedPrice = '€25-50';
    } else if (locationLower.includes('tailândia') || locationLower.includes('vietnam') || locationLower.includes('india')) {
      estimatedPrice = '€5-15';
    } else {
      estimatedPrice = '€15-35';
    }
  }

  return {
    activityName,
    location,
    estimatedPrice,
    currency: 'EUR',
    source: 'estimate',
    confidence: 'low'
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { activityName, location } = await req.json()

    if (!activityName || !location) {
      return new Response(
        JSON.stringify({ error: 'Nome da atividade e localização são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar cache primeiro
    const cacheKey = `${activityName}_${location}`.toLowerCase();
    const cacheExpiry = new Date();
    cacheExpiry.setDate(cacheExpiry.getDate() - CACHE_DURATION_DAYS);

    const { data: cachedPrice } = await supabase
      .from('activity_price_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gte('created_at', cacheExpiry.toISOString())
      .single();

    if (cachedPrice) {
      console.log('Preço encontrado em cache para:', activityName, location);
      
      // Converter preço do cache para BRL se necessário
      let priceBRL = cachedPrice.estimated_price_brl;
      let exchangeRate = cachedPrice.exchange_rate;
      let exchangeDate = cachedPrice.exchange_date;
      
      if (!priceBRL) {
        const conversion = await convertToBRL(cachedPrice.estimated_price, cachedPrice.currency);
        priceBRL = conversion.convertedPrice;
        exchangeRate = conversion.exchangeRate;
        exchangeDate = conversion.exchangeDate;
      }
      
      return new Response(
        JSON.stringify({
          activityName,
          location,
          estimatedPrice: cachedPrice.estimated_price,
          estimatedPriceBRL: priceBRL,
          currency: 'BRL',
          originalCurrency: cachedPrice.currency,
          exchangeRate: exchangeRate,
          exchangeDate: exchangeDate,
          source: 'cache',
          confidence: cachedPrice.confidence
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Tentar buscar via Nova Google Places API
    console.log('Buscando preço via Nova Google Places API para:', activityName, location);
    let priceResult = await searchGooglePlacesNew(activityName, location);

    // Se não encontrou via API, usar estimativa
    if (!priceResult) {
      console.log('Gerando estimativa para:', activityName, location);
      priceResult = generateEstimate(activityName, location);
    }

    // Converter para BRL
    const conversion = await convertToBRL(priceResult.estimatedPrice, priceResult.currency);

    const finalResult: PriceSearchResult = {
      ...priceResult,
      estimatedPriceBRL: conversion.convertedPrice,
      originalCurrency: priceResult.currency,
      currency: 'BRL',
      exchangeRate: conversion.exchangeRate,
      exchangeDate: conversion.exchangeDate
    };

    // Salvar no cache com informações de conversão
    await supabase
      .from('activity_price_cache')
      .upsert({
        cache_key: cacheKey,
        activity_name: activityName,
        location: location,
        estimated_price: priceResult.estimatedPrice,
        estimated_price_brl: conversion.convertedPrice,
        currency: priceResult.currency,
        source: priceResult.source,
        confidence: priceResult.confidence,
        exchange_rate: conversion.exchangeRate,
        exchange_date: conversion.exchangeDate
      });

    console.log('Preço encontrado/estimado com conversão:', finalResult);

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função search-activity-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
