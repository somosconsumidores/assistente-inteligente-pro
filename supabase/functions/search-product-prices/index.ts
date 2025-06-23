
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

interface MercadoLivreProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  seller: {
    id: number;
    nickname: string;
    car_dealer: boolean;
    real_estate_agency: boolean;
    tags: string[];
  };
  shipping?: {
    free_shipping: boolean;
  };
  condition: string;
  sold_quantity: number;
  available_quantity: number;
}

interface MercadoLivreSearchResponse {
  results: MercadoLivreProduct[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

// AWS Signature V4 implementation
const createAWSSignature = async (
  method: string,
  url: string,
  headers: Record<string, string>,
  payload: string,
  region: string = 'us-east-1',
  service: string = 'ProductAdvertisingAPI'
): Promise<string> => {
  const algorithm = 'AWS4-HMAC-SHA256';
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  
  // Create canonical request
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQuerystring = '';
  
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
    .join('');
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const stringToSign = [
    algorithm,
    timeStamp,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  
  // Calculate signature
  const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('AWS4' + key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(dateStamp)));
    
    const kRegion = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kDate),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(regionName)));
    
    const kService = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kRegion),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(serviceName)));
    
    const kSigning = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(kService),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode('aws4_request')));
    
    return new Uint8Array(kSigning);
  };
  
  const signingKey = await getSignatureKey(amazonSecretAccessKey!, dateStamp, region, service);
  const signature = await crypto.subtle.importKey(
    'raw',
    signingKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(stringToSign)))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  
  const authorizationHeader = `${algorithm} Credential=${amazonAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return authorizationHeader;
};

// Real Amazon PA API search function
const searchAmazonPA = async (productName: string): Promise<PriceResult[]> => {
  try {
    if (!amazonAccessKeyId || !amazonSecretAccessKey || !amazonAssociateTag) {
      console.log('Amazon PA API credentials not configured');
      return [];
    }

    console.log(`Searching Amazon PA API for: ${productName}`);
    
    const cleanQuery = productName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const requestPayload = {
      Keywords: cleanQuery,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ],
      SearchIndex: 'All',
      ItemCount: 10,
      PartnerTag: amazonAssociateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com.br'
    };

    const payload = JSON.stringify(requestPayload);
    const url = 'https://webservices.amazon.com.br/paapi5/searchitems';
    
    const now = new Date();
    const timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': 'webservices.amazon.com.br',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'X-Amz-Date': timeStamp,
      'Content-Encoding': 'amz-1.0'
    };

    const authorization = await createAWSSignature('POST', url, headers, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Authorization': authorization
      },
      body: payload
    });

    if (!response.ok) {
      console.error(`Amazon PA API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Amazon PA API error details:', errorText);
      return [];
    }

    const data = await response.json();
    console.log(`Amazon PA API response received`);

    if (!data.SearchResult?.Items || data.SearchResult.Items.length === 0) {
      console.log('No products found on Amazon PA API');
      return [];
    }

    const priceResults: PriceResult[] = [];
    
    for (const item of data.SearchResult.Items) {
      try {
        const title = item.ItemInfo?.Title?.DisplayValue || 'Produto Amazon';
        const offers = item.Offers?.Listings?.[0];
        
        if (!offers?.Price?.Amount) continue;
        
        const price = parseFloat(offers.Price.Amount);
        const currency = offers.Price.Currency || 'BRL';
        const availability = offers.Availability?.Message || '';
        
        // Skip if price is invalid or item is unavailable
        if (price <= 0 || availability.toLowerCase().includes('indisponível')) continue;
        
        // Determine confidence based on availability and reviews
        let confidence: 'high' | 'medium' | 'low' = 'high'; // Amazon data is generally reliable
        
        if (availability.toLowerCase().includes('estoque limitado')) {
          confidence = 'medium';
        }

        priceResults.push({
          price: price,
          currency: currency,
          source: 'amazon-pa',
          store_name: 'Amazon Brasil',
          product_url: item.DetailPageURL || 'https://amazon.com.br',
          confidence,
          last_updated: new Date().toISOString()
        });
      } catch (itemError) {
        console.error('Error processing Amazon item:', itemError);
        continue;
      }
    }

    console.log(`Processed ${priceResults.length} valid price results from Amazon PA API`);
    return priceResults;
  } catch (error) {
    console.error('Error searching Amazon PA API:', error);
    return [];
  }
};

// Real function to search Mercado Livre API with improved headers
const searchMercadoLivre = async (productName: string): Promise<PriceResult[]> => {
  try {
    console.log(`Searching Mercado Livre API for: ${productName}`);
    
    const cleanQuery = productName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const encodedQuery = encodeURIComponent(cleanQuery);
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodedQuery}&limit=20&condition=new`;
    
    console.log(`Making request to: ${url}`);
    
    // Improved headers to avoid blocking
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error(`Mercado Livre API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: MercadoLivreSearchResponse = await response.json();
    console.log(`Found ${data.results?.length || 0} products on Mercado Livre`);

    if (!data.results || data.results.length === 0) {
      console.log('No products found on Mercado Livre');
      return [];
    }

    // Filter and process results
    const validProducts = data.results
      .filter(product => {
        const price = product.price;
        if (price < 10 || price > 100000) return false;
        if (product.available_quantity < 1) return false;
        return true;
      })
      .slice(0, 10);

    const priceResults: PriceResult[] = validProducts.map(product => {
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      if (product.sold_quantity > 50 && product.seller.tags.includes('mshops')) {
        confidence = 'high';
      } else if (product.sold_quantity > 10) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      return {
        price: product.price,
        currency: 'BRL',
        source: 'mercadolivre',
        store_name: 'Mercado Livre',
        product_url: product.permalink,
        confidence,
        last_updated: new Date().toISOString()
      };
    });

    console.log(`Processed ${priceResults.length} valid price results from Mercado Livre`);
    return priceResults;
  } catch (error) {
    console.error('Error searching Mercado Livre:', error);
    return [];
  }
};

// Function to calculate average and confidence with better logic
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
  
  // Remove outliers (prices that are too far from median)
  priceValues.sort((a, b) => a - b);
  const median = priceValues[Math.floor(priceValues.length / 2)];
  const filteredPrices = priceValues.filter(price => {
    const deviation = Math.abs(price - median) / median;
    return deviation < 0.5;
  });
  
  const average_price = filteredPrices.reduce((sum, price) => sum + price, 0) / filteredPrices.length;
  const min_price = Math.min(...filteredPrices);
  const max_price = Math.max(...filteredPrices);
  
  // Determine confidence based on sources and quality
  const hasAmazonData = prices.some(p => p.source === 'amazon-pa');
  const hasMercadoLivreData = prices.some(p => p.source === 'mercadolivre');
  const hasMultipleSources = new Set(prices.map(p => p.source)).size >= 2;
  
  let confidence_level: 'real' | 'estimated' = 'estimated';
  
  if (hasAmazonData || (hasMercadoLivreData && prices.length >= 3)) {
    confidence_level = 'real';
  } else if (hasMercadoLivreData && prices.length >= 1) {
    confidence_level = 'real';
  }
  
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
      .gte('last_updated', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()) // 12 hours cache for Amazon data
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

    // Search multiple sources with rate limiting for Amazon
    console.log('No cache found, searching multiple sources...');
    
    // Search Amazon PA API first (higher priority)
    const amazonResults = await searchAmazonPA(product_name);
    
    // Add small delay before Mercado Livre to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mercadoLivreResults = await searchMercadoLivre(product_name);

    // Combine all results
    const allPrices: PriceResult[] = [...amazonResults, ...mercadoLivreResults];

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
