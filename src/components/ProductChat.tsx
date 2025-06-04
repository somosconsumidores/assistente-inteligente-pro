
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Loader2, RotateCcw } from 'lucide-react';
import { useProductChat } from '@/hooks/useProductChat';
import FormattedMessage from './FormattedMessage';
import FeaturedProducts from './FeaturedProducts';

const ProductChat = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    error,
    featuredProducts,
    lastQuery,
    lastRecommendations,
    sendMessage,
    startChat,
    clearChat
  } = useProductChat();

  useEffect(() => {
    startChat();
  }, [startChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Log featured products for debugging
  useEffect(() => {
    console.log('Featured products updated in ProductChat:', featuredProducts);
  }, [featuredProducts]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue;
    setInputValue('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearChat();
    startChat();
  };

  // Only show featured products if we have messages AND we're NOT loading AND we have products
  const shouldShowFeaturedProducts = featuredProducts.length > 0 && messages.length > 0 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">🏆 Mestre dos Produtos</h3>
              <p className="text-sm text-gray-600">Especialista em comparações e avaliações</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <Card className={`max-w-2xl ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardContent className="p-4">
                  {message.type === 'user' ? (
                    <div className="text-sm leading-relaxed text-white">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ) : (
                    <FormattedMessage 
                      content={message.content} 
                      className="text-sm"
                    />
                  )}
                  <span className={`text-xs mt-2 block ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
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
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analisando produtos...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-white">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte sobre qualquer produto..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Products Section - Only shows when AI response is complete */}
      {shouldShowFeaturedProducts && (
        <div className="max-w-4xl mx-auto">
          <FeaturedProducts 
            products={featuredProducts} 
            query={lastQuery}
            recommendations={lastRecommendations}
          />
        </div>
      )}
    </div>
  );
};

export default ProductChat;
