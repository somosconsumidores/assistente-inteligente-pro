
import type { ProductSearchResult } from './types.ts';

// Enhanced cache functions with longer TTL for Amazon data
export const checkPriceCache = async (supabase: any, productName: string, brand?: string): Promise<ProductSearchResult | null> => {
  try {
    const cacheKey = `${productName.toLowerCase().trim()}${brand ? `_${brand.toLowerCase()}` : ''}`;
    
    const { data, error } = await supabase
      .from('product_price_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours cache (increased from 12h)
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Cache check error:', error);
      return null;
    }
    
    if (data) {
      console.log('Found cached price data (24h TTL)');
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

// Function to save prices to cache with enhanced metadata
export const savePriceCache = async (supabase: any, result: ProductSearchResult): Promise<void> => {
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
      console.log('Price data saved to cache with 24h TTL');
    }
  } catch (error) {
    console.error('Error in savePriceCache:', error);
  }
};

// Check if we should prioritize cache over fresh API calls
export const shouldPrioritizeCache = (productName: string): boolean => {
  // For common/popular products, prioritize cache to reduce API load
  const commonProducts = ['iphone', 'samsung', 'notebook', 'tv', 'geladeira', 'fogão'];
  return commonProducts.some(product => productName.toLowerCase().includes(product));
};
