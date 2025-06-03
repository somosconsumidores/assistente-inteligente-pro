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
    
    // Buscar por tabelas ou seções que contenham os selos
    const lines = message.split('\n');
    let currentProduct = null;
    let productCounter = 1;
    
    // Extrair preços da mensagem
    const priceMatches = message.match(/R\$\s*\d+(?:[.,]\d+)?/g) || [];
    console.log('Price matches found:', priceMatches);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Verificar se a linha contém um dos selos
      if (line.includes('🏆') && (line.includes('Melhor da Avaliação') || line.includes('Melhor'))) {
        // Extrair nome do produto da linha ou próximas linhas
        let productName = line.replace(/🏆.*?Melhor.*?:?\s*/, '').replace(/\*\*/g, '').trim();
        if (!productName && i + 1 < lines.length) {
          productName = lines[i + 1].replace(/\*\*/g, '').trim();
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `melhor-${productCounter}`,
            name: productName.split(' - ')[0].split('(')[0].trim(),
            image: '/placeholder.svg',
            price: priceMatches[0] || 'Consulte',
            scoreMestre: 8.5,
            seal: 'melhor'
          });
          productCounter++;
          console.log('Added melhor product:', productName);
        }
      }
      
      if (line.includes('💰') && (line.includes('Barato da Avaliação') || line.includes('Barato'))) {
        let productName = line.replace(/💰.*?Barato.*?:?\s*/, '').replace(/\*\*/g, '').trim();
        if (!productName && i + 1 < lines.length) {
          productName = lines[i + 1].replace(/\*\*/g, '').trim();
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `barato-${productCounter}`,
            name: productName.split(' - ')[0].split('(')[0].trim(),
            image: '/placeholder.svg',
            price: priceMatches[1] || priceMatches[0] || 'Consulte',
            scoreMestre: 8.0,
            seal: 'barato'
          });
          productCounter++;
          console.log('Added barato product:', productName);
        }
      }
      
      if (line.includes('⭐') && (line.includes('Nossa Recomendação') || line.includes('Recomendação'))) {
        let productName = line.replace(/⭐.*?Recomendação.*?:?\s*/, '').replace(/\*\*/g, '').trim();
        if (!productName && i + 1 < lines.length) {
          productName = lines[i + 1].replace(/\*\*/g, '').trim();
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `recomendacao-${productCounter}`,
            name: productName.split(' - ')[0].split('(')[0].trim(),
            image: '/placeholder.svg',
            price: priceMatches[2] || priceMatches[0] || 'Consulte',
            scoreMestre: 8.3,
            seal: 'recomendacao'
          });
          productCounter++;
          console.log('Added recomendacao product:', productName);
        }
      }
      
      // Também buscar por nomes de produtos específicos na tabela
      if (line.includes('Nike Revolution 6')) {
        const existingProduct = products.find(p => p.name.includes('Nike Revolution 6'));
        if (!existingProduct) {
          products.push({
            id: `nike-rev-${productCounter}`,
            name: 'Nike Revolution 6',
            image: '/placeholder.svg',
            price: 'R$ 270',
            scoreMestre: 8.33,
            seal: 'barato'
          });
          productCounter++;
        }
      }
      
      if (line.includes('Adidas Duramo SL')) {
        const existingProduct = products.find(p => p.name.includes('Adidas Duramo SL'));
        if (!existingProduct) {
          products.push({
            id: `adidas-duramo-${productCounter}`,
            name: 'Adidas Duramo SL',
            image: '/placeholder.svg',
            price: 'R$ 285',
            scoreMestre: 8.00,
            seal: 'recomendacao'
          });
          productCounter++;
        }
      }
      
      if (line.includes('ASICS Gel-Contend 7')) {
        const existingProduct = products.find(p => p.name.includes('ASICS Gel-Contend 7'));
        if (!existingProduct) {
          products.push({
            id: `asics-gel-${productCounter}`,
            name: 'ASICS Gel-Contend 7',
            image: '/placeholder.svg',
            price: 'R$ 295',
            scoreMestre: 8.67,
            seal: 'melhor'
          });
          productCounter++;
        }
      }
    }
    
    console.log('Total products extracted:', products.length);
    console.log('Products details:', products);
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
