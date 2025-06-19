
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, MessageCircle, Trash2, Crown, User, Bot } from 'lucide-react';
import { useIntelligentChat } from '@/hooks/useIntelligentChat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const IntelligentChat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    sessions,
    currentSessionId,
    sendMessage,
    loadSessions,
    loadSession,
    startNewChat,
    deleteSession
  } = useIntelligentChat();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar com sessões */}
      <div className="w-64 bg-gray-900 flex flex-col">
        <div className="p-4">
          <Button 
            onClick={startNewChat}
            className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Nova conversa
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pb-4 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors relative ${
                  currentSessionId === session.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => loadSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{session.title}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Nenhuma conversa ainda
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span>Chat Inteligente Premium</span>
          </div>
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">ChatGPT 4</h1>
          <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
            Online
          </Badge>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Como posso ajudá-lo hoje?
                </h2>
                <p className="text-gray-600 text-center max-w-md">
                  Sou um assistente de IA avançado. Posso ajudá-lo com análises, criação de conteúdo, programação, matemática e muito mais.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {messages.map((message, index) => (
                  <div key={index} className={`py-6 px-6 ${
                    message.role === 'assistant' ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="max-w-3xl mx-auto flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-blue-600'
                            : 'bg-green-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="prose prose-gray max-w-none">
                          <div className="text-gray-900 whitespace-pre-wrap">
                            {formatMessage(message.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="py-6 px-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensagem */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative flex items-center">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Envie uma mensagem para o ChatGPT"
                  disabled={isLoading}
                  className="pr-12 py-3 text-base bg-white text-black border-gray-300 rounded-xl focus:border-gray-400 focus:ring-0"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className="absolute right-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 rounded-lg p-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 text-xs text-gray-500 text-center">
              O ChatGPT pode cometer erros. Considere verificar informações importantes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentChat;
