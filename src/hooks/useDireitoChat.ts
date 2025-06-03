
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'user' | 'agent';
  content: string;
  timestamp?: Date;
}

export const useDireitoChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'agent', 
      content: 'Olá! Sou seu advogado pessoal do consumidor. Como posso ajudá-lo hoje? Pode me contar sobre sua situação que vou orientá-lo sobre seus direitos.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Adiciona mensagem do usuário
    const newUserMessage: Message = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      console.log('Enviando mensagem para edge function...');
      
      const { data, error } = await supabase.functions.invoke('direito-chat', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      console.log('Resposta recebida:', data);

      // Adiciona resposta do assistente
      const assistantMessage: Message = {
        type: 'agent',
        content: data.reply || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro no chat:', error);
      
      const errorMessage: Message = {
        type: 'agent',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
};
