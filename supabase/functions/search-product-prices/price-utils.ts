
import type { PriceResult, ProductSearchResult } from './types.ts';

// Enhanced price calculation with 3-source confidence logic
export const calculatePriceMetrics = (prices: PriceResult[]): {
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
  
  // Enhanced confidence logic with 3 sources
  const hasAmazonData = prices.some(p => p.source === 'amazon-pa');
  const hasMercadoLivreData = prices.some(p => p.source === 'mercadolivre');
  const hasGoogleShoppingData = prices.some(p => p.source === 'google-shopping');
  
  const sourcesCount = [hasAmazonData, hasMercadoLivreData, hasGoogleShoppingData].filter(Boolean).length;
  const highConfidencePrices = prices.filter(p => p.confidence === 'high').length;
  
  let confidence_level: 'real' | 'estimated' = 'estimated';
  
  // Real confidence criteria (enhanced for 3 sources)
  if (sourcesCount >= 3 && prices.length >= 5) {
    // All 3 sources with good coverage
    confidence_level = 'real';
  } else if (sourcesCount >= 2 && hasAmazonData && prices.length >= 3) {
    // Amazon + one other source with decent coverage
    confidence_level = 'real';
  } else if (sourcesCount >= 2 && highConfidencePrices >= 3 && prices.length >= 4) {
    // Multiple sources with high confidence data
    confidence_level = 'real';
  } else if (hasAmazonData && hasGoogleShoppingData && prices.length >= 3) {
    // Amazon + Google Shopping combination
    confidence_level = 'real';
  } else if (hasMercadoLivreData && hasGoogleShoppingData && prices.length >= 6 && highConfidencePrices >= 4) {
    // Strong Mercado Livre + Google Shopping data
    confidence_level = 'real';
  }
  
  return {
    average_price: Math.round(average_price * 100) / 100,
    min_price,
    max_price,
    confidence_level
  };
};

// Helper to determine API usage strategy
export const shouldUseAmazonAPI = (productName: string, averagePrice?: number): boolean => {
  // Skip Amazon for low-value products to save API calls
  if (averagePrice && averagePrice < 100) {
    console.log(`Skipping Amazon API for low-value product (R$ ${averagePrice})`);
    return false;
  }
  
  // High-value indicators
  const highValueKeywords = [
    'iphone', 'macbook', 'notebook', 'laptop', 'tv', 'smart tv', 
    'geladeira', 'fogão', 'ar condicionado', 'microondas', 'lavadora'
  ];
  
  const isHighValue = highValueKeywords.some(keyword => 
    productName.toLowerCase().includes(keyword)
  );
  
  if (!isHighValue && !averagePrice) {
    console.log('Skipping Amazon API for potentially low-value product');
    return false;
  }
  
  return true;
};

// Helper to determine if we should use Google Shopping
export const shouldUseGoogleShopping = (productName: string, otherSourcesCount: number): boolean => {
  // Use Google Shopping as fallback when other sources have limited results
  if (otherSourcesCount < 3) {
    console.log('Using Google Shopping as fallback for limited results');
    return true;
  }
  
  // Always use for electronics and high-value items
  const priorityKeywords = [
    'iphone', 'samsung', 'notebook', 'laptop', 'tv', 'camera', 'console'
  ];
  
  const isPriority = priorityKeywords.some(keyword => 
    productName.toLowerCase().includes(keyword)
  );
  
  if (isPriority) {
    console.log('Using Google Shopping for priority product category');
    return true;
  }
  
  return false;
};
