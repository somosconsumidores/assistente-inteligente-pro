
import type { PriceResult, ProductSearchResult } from './types.ts';

// Function to calculate average and confidence with better logic
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
