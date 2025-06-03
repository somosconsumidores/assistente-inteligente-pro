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

  const cleanProductName = (name: string): string => {
    if (!name) return '';
    
    return name
      .replace(/\|/g, '') // Remove pipes
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^\s*-\s*/, '') // Remove leading dashes
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/R\$\s*\d+(?:[.,]\d+)?/g, '') // Remove prices
      .replace(/\d+[.,]\d+/g, '') // Remove scores
      .replace(/🏆|💰|⭐/g, '') // Remove emojis
      .replace(/Melhor da Avaliação|Barato da Avaliação|Nossa Recomendação/gi, '') // Remove seal text
      .replace(/Score Mestre[:\s]*\d+/gi, '') // Remove score mentions
      .replace(/^\s*\d+\.\s*/, '') // Remove leading numbers
      .trim();
  };

  const isValidProductName = (name: string): boolean => {
    if (!name || name.length < 3) return false;
    
    // Check if it's a table header or invalid content
    const invalidPatterns = [
      /^modelo$/i,
      /^produto$/i,
      /^preço$/i,
      /^score$/i,
      /^avaliação$/i,
      /^marca$/i,
      /^categoria$/i,
      /^\d+$/,
      /^[|\-\s]+$/,
      /^R\$\s*\d+/,
      /^\d+[.,]\d+$/
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(name));
  };

  const extractFeaturedProducts = useCallback((message: string) => {
    console.log('Extracting products from message:', message.substring(0, 200) + '...');
    
    const products: { [key: string]: FeaturedProduct } = {};
    
    // Extract prices from the entire message
    const priceMatches = message.match(/R\$\s*\d+(?:[.,]\d+)?/g) || [];
    console.log('Price matches found:', priceMatches);
    
    // Extract scores from the entire message
    const scoreMatches = message.match(/(\d+[.,]\d+)/g) || [];
    console.log('Score matches found:', scoreMatches);
    
    // Method 1: Look for explicit seal mentions with products
    const sealPatterns = [
      {
        seal: 'melhor' as const,
        patterns: [
          /🏆\s*(?:Melhor da Avaliação[:\s]*)?([^(\n\r]+?)(?:\s*\(|$)/gi,
          /Melhor da Avaliação[:\s]*([^(\n\r]+?)(?:\s*\(|$)/gi
        ]
      },
      {
        seal: 'barato' as const,
        patterns: [
          /💰\s*(?:Barato da Avaliação[:\s]*)?([^(\n\r]+?)(?:\s*\(|$)/gi,
          /Barato da Avaliação[:\s]*([^(\n\r]+?)(?:\s*\(|$)/gi
        ]
      },
      {
        seal: 'recomendacao' as const,
        patterns: [
          /⭐\s*(?:Nossa Recomendação[:\s]*)?([^(\n\r]+?)(?:\s*\(|$)/gi,
          /Nossa Recomendação[:\s]*([^(\n\r]+?)(?:\s*\(|$)/gi
        ]
      }
    ];

    sealPatterns.forEach(({ seal, patterns }) => {
      if (products[seal]) return; // Already found one for this seal
      
      for (const pattern of patterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          const rawName = match[1]?.trim();
          if (!rawName) continue;
          
          const cleanName = cleanProductName(rawName);
          if (isValidProductName(cleanName)) {
            console.log(`Found ${seal} product:`, cleanName);
            
            // Extract score from nearby context
            let score = 8.0; // Default score
            const contextStart = Math.max(0, match.index! - 100);
            const contextEnd = Math.min(message.length, match.index! + match[0].length + 100);
            const context = message.substring(contextStart, contextEnd);
            const scoreMatch = context.match(/(\d+[.,]\d+)/);
            if (scoreMatch) {
              const parsedScore = parseFloat(scoreMatch[1].replace(',', '.'));
              if (parsedScore >= 1 && parsedScore <= 10) {
                score = parsedScore;
              }
            }
            
            products[seal] = {
              id: `${seal}-product`,
              name: cleanName,
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
              price: priceMatches[0] || 'Consulte',
              scoreMestre: score,
              seal: seal
            };
            break;
          }
        }
        if (products[seal]) break; // Found one, move to next seal
      }
    });

    // Method 2: Parse table if seal method didn't find enough products
    if (Object.keys(products).length < 3) {
      const lines = message.split('\n');
      const tableRows: string[] = [];
      
      // Find table rows
      for (const line of lines) {
        if (line.includes('|') && line.split('|').length >= 3) {
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
          if (cells.length >= 3 && cells[0] && !cells[0].toLowerCase().includes('modelo')) {
            tableRows.push(line);
          }
        }
      }
      
      // Process first 3 valid table rows
      const sealsToAssign: Array<'melhor' | 'barato' | 'recomendacao'> = ['melhor', 'barato', 'recomendacao'];
      let sealIndex = 0;
      
      for (const row of tableRows.slice(0, 3)) {
        if (sealIndex >= sealsToAssign.length) break;
        
        const currentSeal = sealsToAssign[sealIndex];
        if (products[currentSeal]) {
          sealIndex++;
          continue;
        }
        
        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        if (cells.length >= 3) {
          const rawName = cells[0];
          const cleanName = cleanProductName(rawName);
          
          if (isValidProductName(cleanName)) {
            const price = cells[1] || 'Consulte';
            let score = 8.0;
            
            if (cells[3]) {
              const parsedScore = parseFloat(cells[3].replace(',', '.'));
              if (parsedScore >= 1 && parsedScore <= 10) {
                score = parsedScore;
              }
            }
            
            console.log(`Assigning table product "${cleanName}" to seal: ${currentSeal}`);
            
            products[currentSeal] = {
              id: `${currentSeal}-table-product`,
              name: cleanName,
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
              price: price,
              scoreMestre: score,
              seal: currentSeal
            };
            sealIndex++;
          }
        }
      }
    }

    const finalProducts = Object.values(products);
    console.log('Final extracted products:', finalProducts.length);
    console.log('Products details:', finalProducts.map(p => ({ name: p.name, seal: p.seal, score: p.scoreMestre })));
    
    return finalProducts;
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
        
        // Extract featured products from response
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
