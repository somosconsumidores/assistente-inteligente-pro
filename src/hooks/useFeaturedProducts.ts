
import { useState, useCallback } from 'react';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  const extractFeaturedProducts = useCallback((message: string) => {
    const products: FeaturedProduct[] = [];
    
    // Regex patterns para identificar produtos com selos
    const melhorPattern = /🏆\s*Melhor da Avaliação[:\s]*([^(\n]*?)(?:\(([^)]*)\))?/gi;
    const baratoPattern = /💰\s*Barato da Avaliação[:\s]*([^(\n]*?)(?:\(([^)]*)\))?/gi;
    const recomendacaoPattern = /⭐\s*Nossa Recomendação[:\s]*([^(\n]*?)(?:\(([^)]*)\))?/gi;
    
    // Pattern para Score Mestre
    const scorePattern = /Score Mestre[:\s]*(\d+(?:[.,]\d+)?)/gi;
    
    // Pattern para preços
    const pricePattern = /R\$\s*\d+(?:[.,]\d+)?/gi;
    
    let match;
    let productId = 1;
    
    // Extrair Melhor da Avaliação
    while ((match = melhorPattern.exec(message)) !== null) {
      const name = match[1]?.trim() || `Produto ${productId}`;
      const scores = [...message.matchAll(scorePattern)];
      const prices = [...message.matchAll(pricePattern)];
      
      products.push({
        id: `melhor-${productId}`,
        name: name,
        image: '/placeholder.svg',
        price: prices[0]?.[0] || 'Consulte',
        scoreMestre: parseFloat(scores[0]?.[1]?.replace(',', '.') || '0'),
        seal: 'melhor'
      });
      productId++;
    }
    
    // Extrair Barato da Avaliação
    while ((match = baratoPattern.exec(message)) !== null) {
      const name = match[1]?.trim() || `Produto ${productId}`;
      const scores = [...message.matchAll(scorePattern)];
      const prices = [...message.matchAll(pricePattern)];
      
      products.push({
        id: `barato-${productId}`,
        name: name,
        image: '/placeholder.svg',
        price: prices[1]?.[0] || prices[0]?.[0] || 'Consulte',
        scoreMestre: parseFloat(scores[1]?.[1]?.replace(',', '.') || scores[0]?.[1]?.replace(',', '.') || '0'),
        seal: 'barato'
      });
      productId++;
    }
    
    // Extrair Nossa Recomendação
    while ((match = recomendacaoPattern.exec(message)) !== null) {
      const name = match[1]?.trim() || `Produto ${productId}`;
      const scores = [...message.matchAll(scorePattern)];
      const prices = [...message.matchAll(pricePattern)];
      
      products.push({
        id: `recomendacao-${productId}`,
        name: name,
        image: '/placeholder.svg',
        price: prices[2]?.[0] || prices[0]?.[0] || 'Consulte',
        scoreMestre: parseFloat(scores[2]?.[1]?.replace(',', '.') || scores[0]?.[1]?.replace(',', '.') || '0'),
        seal: 'recomendacao'
      });
      productId++;
    }
    
    return products;
  }, []);

  const updateFeaturedProducts = useCallback((message: string) => {
    const newProducts = extractFeaturedProducts(message);
    if (newProducts.length > 0) {
      setFeaturedProducts(newProducts);
    }
  }, [extractFeaturedProducts]);

  const clearFeaturedProducts = useCallback(() => {
    setFeaturedProducts([]);
  }, []);

  return {
    featuredProducts,
    updateFeaturedProducts,
    clearFeaturedProducts
  };
};
