
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    // Se for a primeira mensagem, criar nova sessão
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      setCurrentSessionId(sessionId);
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('intelligent-chat', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Salvar sessão no localStorage
      const session: ChatSession = {
        id: sessionId,
        title: messages.length === 0 ? generateSessionTitle(content) : 
               sessions.find(s => s.id === sessionId)?.title || 'Nova Conversa',
        messages: updatedMessages,
        createdAt: sessions.find(s => s.id === sessionId)?.createdAt || new Date(),
        updatedAt: new Date()
      };

      const existingSessions = JSON.parse(localStorage.getItem('intelligentChatSessions') || '[]');
      const sessionIndex = existingSessions.findIndex((s: ChatSession) => s.id === sessionId);
      
      if (sessionIndex >= 0) {
        existingSessions[sessionIndex] = session;
      } else {
        existingSessions.unshift(session);
      }

      localStorage.setItem('intelligentChatSessions', JSON.stringify(existingSessions));
      setSessions(existingSessions);

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
