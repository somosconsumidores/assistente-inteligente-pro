
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useProductChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

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

  const extractFeaturedProducts = useCallback((message: string) => {
    console.log('Extracting products from message:', message);
    const products: FeaturedProduct[] = [];
    
    // Patterns mais específicos para identificar produtos com selos
    const melhorPattern = /🏆\s*(?:Melhor da Avaliação)[:\s-]*([^(\n]+?)(?:\s*\(|$)/gi;
    const baratoPattern = /💰\s*(?:Barato da Avaliação)[:\s-]*([^(\n]+?)(?:\s*\(|$)/gi;
    const recomendacaoPattern = /⭐\s*(?:Nossa Recomendação)[:\s-]*([^(\n]+?)(?:\s*\(|$)/gi;
    
    // Extrair scores e preços do contexto
    const scoreMatches = [...message.matchAll(/Score Mestre[:\s]*(\d+(?:[.,]\d+)?)/gi)];
    const priceMatches = [...message.matchAll(/R\$\s*\d+(?:[.,]\d+)?(?:\s*mil)?/gi)];
    
    console.log('Score matches found:', scoreMatches);
    console.log('Price matches found:', priceMatches);
    
    let productId = 1;
    
    // Extrair Melhor da Avaliação
    let match;
    while ((match = melhorPattern.exec(message)) !== null) {
      const name = match[1]?.trim().replace(/[:\-–]/g, '').trim();
      if (name && name.length > 3) {
        products.push({
          id: `melhor-${productId}`,
          name: name,
          image: '/placeholder.svg',
          price: priceMatches[productId - 1]?.[0] || 'Consulte',
          scoreMestre: parseFloat(scoreMatches[productId - 1]?.[1]?.replace(',', '.') || '8.5'),
          seal: 'melhor'
        });
        productId++;
        console.log('Added melhor product:', name);
      }
    }
    
    // Reset regex
    baratoPattern.lastIndex = 0;
    
    // Extrair Barato da Avaliação
    while ((match = baratoPattern.exec(message)) !== null) {
      const name = match[1]?.trim().replace(/[:\-–]/g, '').trim();
      if (name && name.length > 3) {
        products.push({
          id: `barato-${productId}`,
          name: name,
          image: '/placeholder.svg',
          price: priceMatches[productId - 1]?.[0] || 'Consulte',
          scoreMestre: parseFloat(scoreMatches[productId - 1]?.[1]?.replace(',', '.') || '8.0'),
          seal: 'barato'
        });
        productId++;
        console.log('Added barato product:', name);
      }
    }
    
    // Reset regex
    recomendacaoPattern.lastIndex = 0;
    
    // Extrair Nossa Recomendação
    while ((match = recomendacaoPattern.exec(message)) !== null) {
      const name = match[1]?.trim().replace(/[:\-–]/g, '').trim();
      if (name && name.length > 3) {
        products.push({
          id: `recomendacao-${productId}`,
          name: name,
          image: '/placeholder.svg',
          price: priceMatches[productId - 1]?.[0] || 'Consulte',
          scoreMestre: parseFloat(scoreMatches[productId - 1]?.[1]?.replace(',', '.') || '8.3'),
          seal: 'recomendacao'
        });
        productId++;
        console.log('Added recomendacao product:', name);
      }
    }
    
    console.log('Total products extracted:', products.length);
    return products;
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    addMessage(userMessage, 'user');
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
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
        
        // Extrair produtos destacados da resposta
        const extractedProducts = extractFeaturedProducts(data.analysis);
        console.log('Setting featured products:', extractedProducts);
        if (extractedProducts.length > 0) {
          setFeaturedProducts(extractedProducts);
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
  }, [messages, addMessage, extractFeaturedProducts]);

  const startChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage = `🏆 Olá! Sou o Mestre dos Produtos, seu especialista em comparações e avaliações.

Posso te ajudar com:
• Comparar produtos e marcas
• Analisar custo-benefício
• Encontrar as melhores ofertas
• Avaliar características técnicas
• Dar recomendações personalizadas

Sobre qual produto você gostaria de conversar hoje?`;
      
      addMessage(welcomeMessage, 'assistant');
    }
  }, [messages.length, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setFeaturedProducts([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    featuredProducts,
    sendMessage,
    startChat,
    clearChat
  };
};
