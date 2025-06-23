
import type { PriceResult, ProductSearchResult } from './types.ts';

// Enhanced price calculation with better confidence logic
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
  
  // Enhanced confidence logic
  const hasAmazonData = prices.some(p => p.source === 'amazon-pa');
  const hasMercadoLivreData = prices.some(p => p.source === 'mercadolivre');
  const hasMultipleSources = new Set(prices.map(p => p.source)).size >= 2;
  const highConfidencePrices = prices.filter(p => p.confidence === 'high').length;
  
  let confidence_level: 'real' | 'estimated' = 'estimated';
  
  // Real confidence criteria (more strict to ensure quality)
  if (hasAmazonData && hasMercadoLivreData && prices.length >= 3) {
    confidence_level = 'real';
  } else if (hasAmazonData && prices.length >= 2) {
    confidence_level = 'real';
  } else if (hasMercadoLivreData && prices.length >= 5 && highConfidencePrices >= 3) {
    confidence_level = 'real';
  } else if (hasMultipleSources && prices.length >= 4) {
    confidence_level = 'real';
  }
  
  return {
    average_price: Math.round(average_price * 100) / 100,
    min_price,
    max_price,
    confidence_level
  };
};

// Helper to determine if product should use Amazon API based on estimated value
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
