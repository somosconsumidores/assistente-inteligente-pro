
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useFinancialAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Olá! 👋 Sou seu consultor financeiro pessoal com IA. Analisei seus dados financeiros e estou pronto para te ajudar com dicas personalizadas, estratégias de investimento, controle de gastos e planejamento financeiro. Como posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = useCallback((content: string, type: 'user' | 'assistant') => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const conversation = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: { 
          message: userMessage,
          conversation: conversation
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      if (data?.reply) {
        addMessage(data.reply, 'assistant');
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      
      addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.', 'assistant');
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage, toast]);

  const clearChat = useCallback(() => {
    setMessages([{
      type: 'assistant',
      content: 'Olá! 👋 Sou seu consultor financeiro pessoal com IA. Analisei seus dados financeiros e estou pronto para te ajudar com dicas personalizadas, estratégias de investimento, controle de gastos e planejamento financeiro. Como posso te ajudar hoje?',
      timestamp: new Date()
    }]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};
