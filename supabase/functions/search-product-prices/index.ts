
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import type { ProductSearchResult } from './types.ts';
import { searchAmazonPA } from './amazon-search.ts';
import { searchMercadoLivre } from './mercadolivre-search.ts';
import { calculatePriceMetrics } from './price-utils.ts';
import { checkPriceCache, savePriceCache } from './cache.ts';

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
  console.log('Search product prices function called');
  
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

    // Check cache first
    const cachedResult = await checkPriceCache(supabase, product_name, brand);
    if (cachedResult) {
      console.log('Returning cached price data');
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search multiple sources with rate limiting for Amazon
    console.log('No cache found, searching multiple sources...');
    
    // Search Amazon PA API first (higher priority)
    const amazonResults = await searchAmazonPA(product_name, amazonAccessKeyId!, amazonSecretAccessKey!, amazonAssociateTag!);
    
    // Add small delay before Mercado Livre to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mercadoLivreResults = await searchMercadoLivre(product_name);

    // Combine all results
    const allPrices = [...amazonResults, ...mercadoLivreResults];

    // Calculate metrics
    const metrics = calculatePriceMetrics(allPrices);
    
    const finalResult: ProductSearchResult = {
      product_name,
      brand,
      prices: allPrices,
      ...metrics
    };

    // Save to cache for future requests
    await savePriceCache(supabase, finalResult);

    console.log(`Found ${allPrices.length} prices, confidence: ${metrics.confidence_level}`);
    
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
