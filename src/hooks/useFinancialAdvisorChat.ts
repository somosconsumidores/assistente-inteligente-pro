
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useFinancialAdvisorChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'assistant',
      content: 'Olá! 👋 Sou seu consultor financeiro pessoal. Estou aqui para te ajudar com estratégias práticas para organizar suas finanças, sair das dívidas e alcançar seus objetivos financeiros. Com base nos seus dados, posso oferecer conselhos personalizados. Como posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!user || !userMessage.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-advisor-chat', {
        body: {
          message: userMessage,
          userId: user.id
        }
      });

      if (error) throw error;

      // Add assistant response
      const assistantMsg: ChatMessage = {
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMsg: ChatMessage = {
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        type: 'assistant',
        content: 'Olá! 👋 Sou seu consultor financeiro pessoal. Estou aqui para te ajudar com estratégias práticas para organizar suas finanças, sair das dívidas e alcançar seus objetivos financeiros. Com base nos seus dados, posso oferecer conselhos personalizados. Como posso te ajudar hoje?',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};
