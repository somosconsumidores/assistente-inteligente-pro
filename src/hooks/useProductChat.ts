
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimePrices } from './useRealTimePrices';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
  priceConfidence?: 'real' | 'estimated';
  priceSource?: string;
  lastUpdated?: string;
}

export const useProductChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [lastRecommendations, setLastRecommendations] = useState<any>(null);
  
  const { searchMultipleProducts } = useRealTimePrices();

  const addMessage = useCallback((content: string, type: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const fetchProductsFromDatabase = useCallback(async (productIds?: string[], category?: string) => {
    try {
      let query = supabase.from('featured_products').select('*');
      
      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds);
      } else if (category && category !== 'geral') {
        query = query
          .eq('category', category)
          .order('created_at', { ascending: false })
          .limit(3);
      } else {
        query = query
          .order('created_at', { ascending: false })
          .limit(3);
      }

      const { data: products, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      if (products && products.length > 0) {
        // Search for real-time prices for all products
        console.log('Searching real-time prices for products...');
        const productSearchList = products.map(product => ({
          name: product.name,
          brand: product.brand
        }));
        
        const realTimePrices = await searchMultipleProducts(productSearchList);
        
        const transformedProducts: FeaturedProduct[] = products.map(product => {
          // Find matching real-time price data
          const priceData = realTimePrices.find(price => 
            price.product_name.toLowerCase().includes(product.name.toLowerCase()) ||
            product.name.toLowerCase().includes(price.product_name.toLowerCase())
          );
          
          let priceValue = product.price_average;
          let priceConfidence: 'real' | 'estimated' = 'estimated';
          let priceSource = 'Estimativa IA';
          let lastUpdated = product.updated_at;
          let storeLink = product.store_link;
          
          // Use real-time data if available
          if (priceData && priceData.average_price > 0) {
            priceValue = priceData.average_price;
            priceConfidence = priceData.confidence_level;
            
            if (priceData.prices.length > 0) {
              const primarySource = priceData.prices[0];
              priceSource = primarySource.store_name;
              lastUpdated = primarySource.last_updated;
              storeLink = primarySource.product_url || product.store_link;
            }
          } else {
            // Fallback to original logic for pricing
            if (typeof priceValue === 'number' && priceValue < 100) {
              priceValue = priceValue * 1000;
            }
          }
          
          return {
            id: product.id,
            name: product.name,
            image: product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
            price: priceValue ? priceValue.toString() : 'Consulte',
            scoreMestre: product.score_mestre || 8.0,
            seal: product.seal_type as 'melhor' | 'barato' | 'recomendacao',
            link: storeLink,
            priceConfidence,
            priceSource,
            lastUpdated
          };
        });

        console.log('Transformed products with real-time prices:', transformedProducts);
        return transformedProducts;
      }

      return [];
    } catch (err) {
      console.error('Error fetching products from database:', err);
      return [];
    }
  }, [searchMultipleProducts]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    addMessage(userMessage, 'user');
    setIsLoading(true);
    setError(null);
    setLastQuery(userMessage);
    
    // Limpar produtos imediatamente quando nova consulta é feita
    setFeaturedProducts([]);
    setLastRecommendations(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const { data, error: functionError } = await supabase.functions.invoke('comparar-produtos', {
        body: { 
          query: userMessage,
          conversation: conversationHistory
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao processar mensagem');
      }

      if (data?.analysis) {
        addMessage(data.analysis, 'assistant');
        setLastRecommendations(data);
        
        // Buscar e mostrar produtos com preços reais após receber resposta da IA
        const products = await fetchProductsFromDatabase(data.productIds, data.category);
        console.log('Setting featured products with real-time prices:', products);
        if (products.length > 0) {
          setFeaturedProducts(products);
        }
      } else {
        throw new Error('Nenhuma resposta recebida');
      }
    } catch (err) {
      console.error('Error in product chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage, fetchProductsFromDatabase]);

  const startChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage = `🏆 Olá! Sou o Mestre dos Produtos, seu especialista em comparações e avaliações.

Agora com busca de preços reais em tempo real! 🛒

Posso te ajudar com:
• Comparar produtos e marcas
• Analisar custo-benefício com preços reais
• Encontrar as melhores ofertas atualizadas
• Avaliar características técnicas
• Dar recomendações personalizadas

Sobre qual produto você gostaria de conversar hoje?`;
      
      addMessage(welcomeMessage, 'assistant');
    }
  }, [messages.length, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    // Limpar completamente na nova conversa
    setFeaturedProducts([]);
    setLastQuery('');
    setLastRecommendations(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    featuredProducts,
    lastQuery,
    lastRecommendations,
    sendMessage,
    startChat,
    clearChat
  };
};
