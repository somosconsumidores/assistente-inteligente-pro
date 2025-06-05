
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
  currency: string;
  source: 'google_places' | 'cache' | 'estimate';
  confidence: 'high' | 'medium' | 'low';
}

// Função para buscar preços via Google Places API
const searchGooglePlaces = async (activityName: string, location: string): Promise<PriceSearchResult | null> => {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  
  if (!apiKey) {
    console.log('Google Places API key not configured, using estimates');
    return null;
  }

  try {
    // Primeiro, buscar o lugar
    const searchQuery = `${activityName} ${location}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      return null;
    }

    const place = searchData.results[0];
    const placeId = place.place_id;
    
    // Buscar detalhes do lugar incluindo preços
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,price_level,types&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.result) {
      return null;
    }

    const priceLevel = detailsData.result.price_level;
    const types = detailsData.result.types || [];
    
    // Converter price_level do Google em estimativa de preço
    let estimatedPrice = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    
    if (types.includes('museum')) {
      switch (priceLevel) {
        case 1: estimatedPrice = '€8-15'; break;
        case 2: estimatedPrice = '€15-25'; break;
        case 3: estimatedPrice = '€25-40'; break;
        case 4: estimatedPrice = '€40-60'; break;
        default: estimatedPrice = '€15-30'; confidence = 'low'; break;
      }
    } else if (types.includes('restaurant') || types.includes('food')) {
      switch (priceLevel) {
        case 1: estimatedPrice = '€15-25'; break;
        case 2: estimatedPrice = '€25-45'; break;
        case 3: estimatedPrice = '€45-80'; break;
        case 4: estimatedPrice = '€80-150'; break;
        default: estimatedPrice = '€30-50'; confidence = 'low'; break;
      }
    } else if (types.includes('tourist_attraction')) {
      switch (priceLevel) {
        case 1: estimatedPrice = '€5-12'; break;
        case 2: estimatedPrice = '€12-25'; break;
        case 3: estimatedPrice = '€25-45'; break;
        case 4: estimatedPrice = '€45-80'; break;
        default: estimatedPrice = '€15-35'; confidence = 'low'; break;
      }
    } else {
      // Estimativa genérica baseada no price_level
      switch (priceLevel) {
        case 1: estimatedPrice = '€10-20'; break;
        case 2: estimatedPrice = '€20-40'; break;
        case 3: estimatedPrice = '€40-70'; break;
        case 4: estimatedPrice = '€70-120'; break;
        default: estimatedPrice = '€20-50'; confidence = 'low'; break;
      }
    }

    if (priceLevel !== undefined) {
      confidence = 'high';
    }

    return {
      activityName,
      location,
      estimatedPrice,
      currency: 'EUR',
      source: 'google_places',
      confidence
    };

  } catch (error) {
    console.error('Erro ao buscar no Google Places:', error);
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
      return new Response(
        JSON.stringify({
          activityName,
          location,
          estimatedPrice: cachedPrice.estimated_price,
          currency: cachedPrice.currency,
          source: 'cache',
          confidence: cachedPrice.confidence
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Tentar buscar via Google Places API
    console.log('Buscando preço via Google Places para:', activityName, location);
    let priceResult = await searchGooglePlaces(activityName, location);

    // Se não encontrou via API, usar estimativa
    if (!priceResult) {
      console.log('Gerando estimativa para:', activityName, location);
      priceResult = generateEstimate(activityName, location);
    }

    // Salvar no cache
    await supabase
      .from('activity_price_cache')
      .upsert({
        cache_key: cacheKey,
        activity_name: activityName,
        location: location,
        estimated_price: priceResult.estimatedPrice,
        currency: priceResult.currency,
        source: priceResult.source,
        confidence: priceResult.confidence
      });

    console.log('Preço encontrado/estimado:', priceResult);

    return new Response(
      JSON.stringify(priceResult),
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
