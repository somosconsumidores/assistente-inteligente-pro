
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Plus, MessageCircle, Trash2, Crown } from 'lucide-react';
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
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar com sessões */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Chat Inteligente</h2>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={startNewChat}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma conversa ainda.
                <br />
                Inicie sua primeira conversa!
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(session.updatedAt, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.messages.length} mensagens
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Chat Inteligente Premium
            </h1>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Powered by GPT-4
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Experiência completa similar ao ChatGPT Plus
          </p>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bem-vindo ao Chat Inteligente Premium
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Faça qualquer pergunta ou solicite ajuda com:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>• Análises e pesquisas</div>
                    <div>• Criação de conteúdo</div>
                    <div>• Programação e código</div>
                    <div>• Matemática e cálculos</div>
                    <div>• Tradução e idiomas</div>
                    <div>• Planejamento e estratégia</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Card className={`max-w-3xl ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gradient-to-br from-purple-500 to-blue-500'
                        }`}>
                          {message.role === 'user' ? (
                            <span className="text-sm font-medium">Eu</span>
                          ) : (
                            <MessageCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${
                            message.role === 'user' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatMessage(message.content)}
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(message.timestamp, { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Pensando...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensagem */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntelligentChat;
