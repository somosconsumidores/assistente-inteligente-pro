
import type { PriceResult, MercadoLivreSearchResponse } from './types.ts';

// Real function to search Mercado Livre API with improved headers
export const searchMercadoLivre = async (productName: string): Promise<PriceResult[]> => {
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
