
import type { PriceResult } from './types.ts';

// Google Shopping search via SerpAPI
export const searchGoogleShopping = async (
  productName: string,
  serpApiKey: string
): Promise<PriceResult[]> => {
  try {
    if (!serpApiKey) {
      console.log('SerpAPI key not configured');
      return [];
    }

    console.log(`Searching Google Shopping via SerpAPI for: ${productName}`);
    
    const cleanQuery = productName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: cleanQuery,
      api_key: serpApiKey,
      location: 'Brazil',
      gl: 'br',
      hl: 'pt',
      num: '20'
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductPriceBot/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Google Shopping API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('SerpAPI error details:', errorText);
      return [];
    }

    const data = await response.json();
    console.log(`Google Shopping API response received`);

    if (!data.shopping_results || data.shopping_results.length === 0) {
      console.log('No products found on Google Shopping');
      return [];
    }

    const priceResults: PriceResult[] = [];
    
    for (const item of data.shopping_results.slice(0, 15)) {
      try {
        if (!item.price || !item.title) continue;
        
        // Parse price - handle different formats
        let price = 0;
        const priceStr = item.price.toString().replace(/[^\d.,]/g, '');
        
        if (priceStr.includes(',') && priceStr.includes('.')) {
          // Format: 1.234,56
          price = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
        } else if (priceStr.includes(',')) {
          // Format: 1234,56
          price = parseFloat(priceStr.replace(',', '.'));
        } else {
          // Format: 1234.56
          price = parseFloat(priceStr);
        }
        
        if (price <= 0 || price > 100000) continue;
        
        // Determine confidence based on source and data quality
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        
        if (item.rating && item.rating > 4.0 && item.reviews && item.reviews > 50) {
          confidence = 'high';
        } else if (item.rating && item.rating > 3.5) {
          confidence = 'medium';
        } else {
          confidence = 'low';
        }

        priceResults.push({
          price: price,
          currency: 'BRL',
          source: 'google-shopping',
          store_name: item.source || 'Google Shopping',
          product_url: item.link || '',
          confidence,
          last_updated: new Date().toISOString()
        });
      } catch (itemError) {
        console.error('Error processing Google Shopping item:', itemError);
        continue;
      }
    }

    console.log(`Processed ${priceResults.length} valid price results from Google Shopping`);
    return priceResults;
  } catch (error) {
    console.error('Error in Google Shopping search:', error);
    return [];
  }
};
