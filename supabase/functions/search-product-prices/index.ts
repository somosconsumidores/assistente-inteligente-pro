
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import type { ProductSearchResult } from './types.ts';
import { searchAmazonPA } from './amazon-search.ts';
import { searchMercadoLivre } from './mercadolivre-search.ts';
import { calculatePriceMetrics, shouldUseAmazonAPI } from './price-utils.ts';
import { checkPriceCache, savePriceCache, shouldPrioritizeCache } from './cache.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Amazon PA API credentials
const amazonAccessKeyId = Deno.env.get('AMAZON_ACCESS_KEY_ID');
const amazonSecretAccessKey = Deno.env.get('AMAZON_SECRET_ACCESS_KEY');
const amazonAssociateTag = Deno.env.get('AMAZON_ASSOCIATE_TAG');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Search product prices function called with enhanced rate limiting');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_name, brand } = await req.json();
    
    if (!product_name) {
      return new Response(JSON.stringify({ error: 'Product name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Searching prices for: ${product_name}${brand ? ` (${brand})` : ''}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Enhanced cache strategy - prioritize cache for popular products
    const prioritizeCache = shouldPrioritizeCache(product_name);
    if (prioritizeCache) {
      console.log('Prioritizing cache for popular product');
    }

    const cachedResult = await checkPriceCache(supabase, product_name, brand);
    if (cachedResult && prioritizeCache) {
      console.log('Returning cached data for popular product');
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search multiple sources with intelligent API selection
    console.log('Starting multi-source price search with rate limiting...');
    
    // Always search Mercado Livre first (more reliable, no rate limits)
    const mercadoLivreResults = await searchMercadoLivre(product_name);
    console.log(`Mercado Livre found ${mercadoLivreResults.length} results`);

    // Get initial price estimate from Mercado Livre
    let initialMetrics = calculatePriceMetrics(mercadoLivreResults);
    
    // Determine if we should call Amazon API
    const useAmazon = shouldUseAmazonAPI(product_name, initialMetrics.average_price);
    let amazonResults: any[] = [];
    
    if (useAmazon && amazonAccessKeyId && amazonSecretAccessKey && amazonAssociateTag) {
      console.log('Attempting Amazon PA API call with rate limiting...');
      amazonResults = await searchAmazonPA(product_name, amazonAccessKeyId, amazonSecretAccessKey, amazonAssociateTag);
      console.log(`Amazon PA API found ${amazonResults.length} results`);
    } else {
      console.log('Skipping Amazon API call - using Mercado Livre only');
    }

    // Combine all results
    const allPrices = [...amazonResults, ...mercadoLivreResults];

    // Calculate final metrics
    const metrics = calculatePriceMetrics(allPrices);
    
    const finalResult: ProductSearchResult = {
      product_name,
      brand,
      prices: allPrices,
      ...metrics
    };

    // Save to cache for future requests
    await savePriceCache(supabase, finalResult);

    const sourcesSummary = {
      amazon: amazonResults.length,
      mercadolivre: mercadoLivreResults.length,
      total: allPrices.length
    };

    console.log(`Search completed - Sources: ${JSON.stringify(sourcesSummary)}, Confidence: ${metrics.confidence_level}`);
    
    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-product-prices function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
