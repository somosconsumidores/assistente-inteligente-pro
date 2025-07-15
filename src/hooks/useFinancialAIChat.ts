
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

    console.log('Sending message:', userMessage);
    console.log('Current messages count:', messages.length);

    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const conversation = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log('Conversation history:', conversation);

      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: { 
          message: userMessage,
          conversation: conversation
        }
      });

      console.log('Supabase response:', { data, error });

      // Verifica se há reply na resposta (seja sucesso ou erro)
      if (data?.reply) {
        console.log('Assistant reply:', data.reply);
        addMessage(data.reply, 'assistant');
        return;
      }

      // Se há erro mas não há reply, trata como erro
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      // Se não há erro nem reply, também é um erro
      if (!data) {
        console.error('No data received from function');
        throw new Error('Nenhuma resposta recebida do servidor');
      }

      console.error('No reply in data:', data);
      throw new Error('Resposta inválida do servidor');

    } catch (error) {
      console.error('Erro no chat financeiro:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      addMessage(`Desculpe, ocorreu um erro: ${errorMessage}. Tente novamente em alguns instantes.`, 'assistant');
      
      toast({
        title: "Erro no Chat",
        description: errorMessage,
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
