
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceResult {
  price: number;
  currency: string;
  source: string;
  store_name: string;
  product_url?: string;
  confidence: 'high' | 'medium' | 'low';
  last_updated: string;
}

interface ProductSearchResult {
  product_name: string;
  brand?: string;
  prices: PriceResult[];
  average_price: number;
  min_price: number;
  max_price: number;
  confidence_level: 'real' | 'estimated';
}

// Simulated function to search Mercado Livre (in real implementation, use their API)
const searchMercadoLivre = async (productName: string): Promise<PriceResult[]> => {
  try {
    // For now, we'll simulate API responses
    // In real implementation, use: https://api.mercadolibre.com/sites/MLB/search?q=${query}
    
    console.log(`Searching Mercado Livre for: ${productName}`);
    
    // Simulate realistic prices based on product type
    const simulatedPrices: PriceResult[] = [];
    
    if (productName.toLowerCase().includes('aspirador') || productName.toLowerCase().includes('robot')) {
      simulatedPrices.push({
        price: 1299.99,
        currency: 'BRL',
        source: 'mercadolivre',
        store_name: 'Mercado Livre',
        product_url: 'https://mercadolivre.com.br/produto-exemplo',
        confidence: 'high',
        last_updated: new Date().toISOString()
      });
    }
    
    return simulatedPrices;
  } catch (error) {
    console.error('Error searching Mercado Livre:', error);
    return [];
  }
};

// Simulated function to search Amazon Brasil
const searchAmazonBrasil = async (productName: string): Promise<PriceResult[]> => {
  try {
    console.log(`Searching Amazon Brasil for: ${productName}`);
    
    const simulatedPrices: PriceResult[] = [];
    
    if (productName.toLowerCase().includes('aspirador') || productName.toLowerCase().includes('robot')) {
      simulatedPrices.push({
        price: 1399.90,
        currency: 'BRL',
        source: 'amazon',
        store_name: 'Amazon Brasil',
        product_url: 'https://amazon.com.br/produto-exemplo',
        confidence: 'high',
        last_updated: new Date().toISOString()
      });
    }
    
    return simulatedPrices;
  } catch (error) {
    console.error('Error searching Amazon Brasil:', error);
    return [];
  }
};

// Function to calculate average and confidence
const calculatePriceMetrics = (prices: PriceResult[]): {
  average_price: number;
  min_price: number;
  max_price: number;
  confidence_level: 'real' | 'estimated';
} => {
  if (prices.length === 0) {
    return {
      average_price: 0,
      min_price: 0,
      max_price: 0,
      confidence_level: 'estimated'
    };
  }
  
  const priceValues = prices.map(p => p.price);
  const average_price = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
  const min_price = Math.min(...priceValues);
  const max_price = Math.max(...priceValues);
  
  // If we have at least 2 real prices from different sources, consider it "real"
  const realSources = new Set(prices.filter(p => p.confidence === 'high').map(p => p.source));
  const confidence_level = realSources.size >= 2 ? 'real' : 'estimated';
  
  return {
    average_price: Math.round(average_price * 100) / 100,
    min_price,
    max_price,
    confidence_level
  };
};

// Function to check cache for existing prices
const checkPriceCache = async (supabase: any, productName: string, brand?: string): Promise<ProductSearchResult | null> => {
  try {
    const cacheKey = `${productName.toLowerCase().trim()}${brand ? `_${brand.toLowerCase()}` : ''}`;
    
    const { data, error } = await supabase
      .from('product_price_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours cache
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Cache check error:', error);
      return null;
    }
    
    if (data) {
      console.log('Found cached price data');
      return {
        product_name: data.product_name,
        brand: data.brand,
        prices: data.prices || [],
        average_price: data.average_price || 0,
        min_price: data.min_price || 0,
        max_price: data.max_price || 0,
        confidence_level: data.confidence_level || 'estimated'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking price cache:', error);
    return null;
  }
};

// Function to save prices to cache
const savePriceCache = async (supabase: any, result: ProductSearchResult): Promise<void> => {
  try {
    const cacheKey = `${result.product_name.toLowerCase().trim()}${result.brand ? `_${result.brand.toLowerCase()}` : ''}`;
    
    const { error } = await supabase
      .from('product_price_cache')
      .upsert({
        cache_key: cacheKey,
        product_name: result.product_name,
        brand: result.brand,
        prices: result.prices,
        average_price: result.average_price,
        min_price: result.min_price,
        max_price: result.max_price,
        confidence_level: result.confidence_level,
        last_updated: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving to cache:', error);
    } else {
      console.log('Price data saved to cache');
    }
  } catch (error) {
    console.error('Error in savePriceCache:', error);
  }
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

    // Search multiple sources
    console.log('No cache found, searching multiple sources...');
    const searchPromises = [
      searchMercadoLivre(product_name),
      searchAmazonBrasil(product_name)
    ];

    const searchResults = await Promise.allSettled(searchPromises);
    
    // Combine all successful results
    const allPrices: PriceResult[] = [];
    searchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value);
      } else {
        console.error(`Search ${index} failed:`, result.reason);
      }
    });

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
