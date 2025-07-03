import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: MessageAttachment[];
  imageUrl?: string;
  isImageGeneration?: boolean;
  isTransformation?: boolean;
}

interface MessageAttachment {
  name: string;
  type: 'image' | 'document';
  url?: string;
  base64?: string;
  size: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const useIntelligentChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const { toast } = useToast();

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionTitle = (firstMessage: string) => {
    return firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage;
  };

  const processFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    let attachments: MessageAttachment[] = [];

    if (files && files.length > 0) {
      try {
        attachments = await Promise.all(
          files.map(async (file) => {
            const base64 = await processFileToBase64(file);
            return {
              name: file.name,
              type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
              base64,
              size: file.size
            };
          })
        );
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar arquivos. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim() || (attachments.length > 0 ? 'Arquivo(s) enviado(s)' : ''),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      setCurrentSessionId(sessionId);
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments
      }));

      const { data, error } = await supabase.functions.invoke('intelligent-chat', {
        body: {
          messages: apiMessages,
          hasAttachments: attachments.length > 0
        }
      });

      if (error) {
        throw error;
      }

      if (data?.requiresUpgrade) {
        toast({
          title: "Upgrade Necessário",
          description: "Esta funcionalidade é exclusiva para usuários premium. Faça upgrade para acessar o Chat Inteligente.",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        imageUrl: data.imageUrl,
        isImageGeneration: data.isImageGeneration,
        isTransformation: data.isTransformation
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      if (data.isTransformation) {
        toast({
          title: "Imagem Transformada!",
          description: "Sua imagem foi transformada com sucesso usando IA.",
          variant: "default"
        });
      }

      const session: ChatSession = {
        id: sessionId,
        title: messages.length === 0 ? generateSessionTitle(content || 'Conversa com arquivos') : 
               sessions.find(s => s.id === sessionId)?.title || 'Nova Conversa',
        messages: updatedMessages,
        createdAt: sessions.find(s => s.id === sessionId)?.createdAt || new Date(),
        updatedAt: new Date()
      };

      try {
        const existingSessions = JSON.parse(localStorage.getItem('intelligentChatSessions') || '[]');
        const sessionIndex = existingSessions.findIndex((s: ChatSession) => s.id === sessionId);
        
        if (sessionIndex >= 0) {
          existingSessions[sessionIndex] = session;
        } else {
          existingSessions.unshift(session);
        }

        // Limitar a 20 sessões para evitar exceder a quota do localStorage
        const limitedSessions = existingSessions.slice(0, 20);
        localStorage.setItem('intelligentChatSessions', JSON.stringify(limitedSessions));
        setSessions(limitedSessions);
      } catch (error) {
        // Se localStorage estiver cheio, limpe e mantenha apenas a sessão atual
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('LocalStorage quota exceeded, clearing old sessions');
          const newSessions = [session];
          localStorage.setItem('intelligentChatSessions', JSON.stringify(newSessions));
          setSessions(newSessions);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSessionId, sessions, toast]);

  const loadSessions = useCallback(() => {
    const savedSessions = JSON.parse(localStorage.getItem('intelligentChatSessions') || '[]');
    setSessions(savedSessions.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    })));
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
    }
  }, [sessions]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('intelligentChatSessions', JSON.stringify(updatedSessions));
    
    if (currentSessionId === sessionId) {
      startNewChat();
    }
  }, [sessions, currentSessionId, startNewChat]);

  return {
    messages,
    isLoading,
    sessions,
    currentSessionId,
    sendMessage,
    loadSessions,
    loadSession,
    startNewChat,
    deleteSession
  };
};
