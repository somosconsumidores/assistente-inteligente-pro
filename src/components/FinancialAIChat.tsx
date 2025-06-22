
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { useFinancialAIChat } from '@/hooks/useFinancialAIChat';
import { useIsMobile } from '@/hooks/use-mobile';

const FinancialAIChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat
  } = useFinancialAIChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-white max-w-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Consultor Financeiro</h3>
              <p className="text-xs text-gray-500">Powered by OpenAI</p>
            </div>
          </div>
          <Button
            onClick={clearChat}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'assistant' && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              
              <Card className={`max-w-[85%] ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-3">
                  <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {message.content}
                  </p>
                  <span className={`text-xs opacity-70 mt-1 block ${message.type === 'user' ? 'text-white' : 'text-gray-600'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </CardContent>
              </Card>

              {message.type === 'user' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2 justify-start">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analisando...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-3 bg-white safe-area-bottom">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Faça uma pergunta sobre suas finanças..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !inputValue.trim()} 
              size="icon"
              className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Consultor Financeiro IA</h3>
            <p className="text-xs text-gray-500">Powered by OpenAI</p>
          </div>
        </div>
        <Button
          onClick={clearChat}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <Card className={`max-w-sm ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-3">
                <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {message.content}
                </p>
                <span className={`text-xs opacity-70 mt-1 block ${message.type === 'user' ? 'text-white' : 'text-gray-600'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </CardContent>
            </Card>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Analisando...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Faça uma pergunta sobre suas finanças..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !inputValue.trim()} 
            size="icon"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinancialAIChat;
