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

  const cleanProductName = (name: string) => {
    return name
      .replace(/\|/g, '') // Remove pipes
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^\s*-\s*/, '') // Remove leading dashes
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/R\$\s*\d+(?:[.,]\d+)?/g, '') // Remove prices
      .replace(/\d+[.,]\d+/g, '') // Remove scores
      .replace(/🏆|💰|⭐/g, '') // Remove emojis
      .replace(/Melhor da Avaliação|Barato da Avaliação|Nossa Recomendação/gi, '') // Remove seal text
      .trim();
  };

  const extractFeaturedProducts = useCallback((message: string) => {
    console.log('Extracting products from message:', message);
    const products: FeaturedProduct[] = [];
    
    const lines = message.split('\n');
    let productCounter = 1;
    
    // Extrair preços da mensagem
    const priceMatches = message.match(/R\$\s*\d+(?:[.,]\d+)?/g) || [];
    console.log('Price matches found:', priceMatches);
    
    // Buscar por produtos específicos mencionados na mensagem
    const productPatterns = [
      { name: 'Nike Revolution', regex: /Nike Revolution \d+/gi },
      { name: 'Adidas Runfalcon', regex: /Adidas Runfalcon/gi },
      { name: 'Adidas Duramo', regex: /Adidas Duramo SL/gi },
      { name: 'ASICS Gel-Contend', regex: /ASICS? Gel.?Contend \d+/gi },
      { name: 'Mizuno Wave Shadow', regex: /Mizuno Wave Shadow \d+/gi },
      { name: 'Olympikus Joy', regex: /Olympikus Joy/gi }
    ];

    // Extrair produtos da tabela se existir
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Verificar se é linha de tabela com produto
      if (line.includes('|') && line.split('|').length > 3) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        
        if (cells.length >= 4 && cells[0] && !cells[0].includes('Modelo')) {
          const productName = cleanProductName(cells[0]);
          const price = cells[1] || 'Consulte';
          const score = parseFloat(cells[3]?.replace(',', '.') || '0');
          
          if (productName.length > 2) {
            // Determinar selo baseado na posição na tabela ou conteúdo
            let seal: 'melhor' | 'barato' | 'recomendacao' = 'recomendacao';
            
            if (message.toLowerCase().includes(productName.toLowerCase()) && message.includes('🏆')) {
              seal = 'melhor';
            } else if (message.toLowerCase().includes(productName.toLowerCase()) && message.includes('💰')) {
              seal = 'barato';
            }
            
            products.push({
              id: `product-${productCounter}`,
              name: productName,
              image: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center`,
              price: price,
              scoreMestre: score,
              seal: seal
            });
            productCounter++;
          }
        }
      }
      
      // Buscar por selos específicos nas linhas
      if (line.includes('🏆') && (line.includes('Melhor') || line.includes('melhor'))) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        let productName = cleanProductName(line.replace(/🏆.*?(melhor|Melhor).*?:?\s*/i, ''));
        
        if (!productName && nextLine) {
          productName = cleanProductName(nextLine);
        }
        
        // Buscar por padrões conhecidos se o nome não foi extraído bem
        if (!productName || productName.length < 3) {
          for (const pattern of productPatterns) {
            const match = (line + ' ' + nextLine).match(pattern.regex);
            if (match) {
              productName = match[0];
              break;
            }
          }
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `melhor-${productCounter}`,
            name: productName,
            image: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center`,
            price: priceMatches[0] || 'Consulte',
            scoreMestre: 8.5,
            seal: 'melhor'
          });
          productCounter++;
        }
      }
      
      if (line.includes('💰') && (line.includes('Barato') || line.includes('barato'))) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        let productName = cleanProductName(line.replace(/💰.*?(barato|Barato).*?:?\s*/i, ''));
        
        if (!productName && nextLine) {
          productName = cleanProductName(nextLine);
        }
        
        if (!productName || productName.length < 3) {
          for (const pattern of productPatterns) {
            const match = (line + ' ' + nextLine).match(pattern.regex);
            if (match) {
              productName = match[0];
              break;
            }
          }
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `barato-${productCounter}`,
            name: productName,
            image: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center`,
            price: priceMatches[1] || priceMatches[0] || 'Consulte',
            scoreMestre: 8.0,
            seal: 'barato'
          });
          productCounter++;
        }
      }
      
      if (line.includes('⭐') && (line.includes('Recomendação') || line.includes('recomendação'))) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        let productName = cleanProductName(line.replace(/⭐.*?(recomendação|Recomendação).*?:?\s*/i, ''));
        
        if (!productName && nextLine) {
          productName = cleanProductName(nextLine);
        }
        
        if (!productName || productName.length < 3) {
          for (const pattern of productPatterns) {
            const match = (line + ' ' + nextLine).match(pattern.regex);
            if (match) {
              productName = match[0];
              break;
            }
          }
        }
        
        if (productName && productName.length > 2) {
          products.push({
            id: `recomendacao-${productCounter}`,
            name: productName,
            image: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center`,
            price: priceMatches[2] || priceMatches[0] || 'Consulte',
            scoreMestre: 8.3,
            seal: 'recomendacao'
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
