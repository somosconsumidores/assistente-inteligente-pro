
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePeticaoChatFlow } from './usePeticaoChatFlow';
import { useGerarPeticao } from './useGerarPeticao';

interface Message {
  type: 'user' | 'agent';
  content: string;
  timestamp?: Date;
  isProgress?: boolean;
}

export const useDireitoChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'agent', 
      content: 'Olá! Sou seu advogado pessoal do consumidor. Como posso ajudá-lo hoje?\n\n💡 **Dica**: Digite "gerar petição" se você quiser que eu te ajude a criar uma petição inicial para o Juizado Especial Cível.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const petitionFlow = usePeticaoChatFlow();
  const { gerarPeticao, isLoading: isGeneratingPetition } = useGerarPeticao();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Adiciona mensagem do usuário
    const newUserMessage: Message = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Verificar se deve iniciar o fluxo de petição
    if (!petitionFlow.isActive && petitionFlow.canStartFlow(userMessage)) {
      petitionFlow.startFlow();
      
      const startMessage: Message = {
        type: 'agent',
        content: `Perfeito! Vou te ajudar a gerar uma petição inicial. Vou fazer algumas perguntas para coletar as informações necessárias.\n\n📋 **Progresso: 1/5**\n\n${petitionFlow.getNextQuestion()}`,
        timestamp: new Date(),
        isProgress: true
      };
      
      setMessages(prev => [...prev, startMessage]);
      return;
    }

    // Se estiver no fluxo de petição, processar a resposta
    if (petitionFlow.isActive) {
      const result = petitionFlow.processResponse(userMessage);
      
      if (!result.isValid && result.message) {
        const errorMessage: Message = {
          type: 'agent',
          content: result.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (result.shouldAdvance && result.message) {
        const progress = petitionFlow.getProgressInfo();
        const progressText = result.isFlowComplete ? '' : `\n\n📋 **Progresso: ${progress.current}/${progress.total}**`;
        
        const responseMessage: Message = {
          type: 'agent',
          content: result.message + progressText,
          timestamp: new Date(),
          isProgress: !result.isFlowComplete
        };
        
        setMessages(prev => [...prev, responseMessage]);

        // Se o fluxo foi completado, gerar a petição
        if (result.isFlowComplete && petitionFlow.formData.nome) {
          setTimeout(async () => {
            try {
              await gerarPeticao({
                nome: petitionFlow.formData.nome!,
                cpf: petitionFlow.formData.cpf!,
                empresa: petitionFlow.formData.empresa!,
                valor: petitionFlow.formData.valor!,
                relato: petitionFlow.formData.relato!
              });

              const successMessage: Message = {
                type: 'agent',
                content: '✅ **Petição gerada com sucesso!**\n\nSua petição foi criada e está pronta para download. Você pode encontrá-la na aba "Gerar Petição" desta página.\n\nPosso ajudá-lo com mais alguma coisa?',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, successMessage]);
              petitionFlow.resetFlow();
              
            } catch (error) {
              const errorMessage: Message = {
                type: 'agent',
                content: 'Desculpe, ocorreu um erro ao gerar a petição. Vamos tentar novamente. Digite "gerar petição" para recomeçar o processo.',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
              petitionFlow.resetFlow();
            }
          }, 1000);
        }
      }
      return;
    }

    // Chat normal - enviar para edge function
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
    isLoading: isLoading || isGeneratingPetition,
    petitionFlow
  };
};
