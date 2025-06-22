
import React, { useState, useRef, useEffect } from 'react';
import { useProductChat } from '@/hooks/useProductChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import FeaturedProducts from './FeaturedProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronUp, ChevronDown, Package } from 'lucide-react';

const ProductChat = () => {
  const [inputValue, setInputValue] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Auto-show recommendations on mobile when products are available
  useEffect(() => {
    if (isMobile && validProducts.length > 0) {
      setShowRecommendations(true);
    }
  }, [featuredProducts, isMobile]);

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
    if (isMobile) {
      setShowRecommendations(false);
    }
  };

  const validProducts = featuredProducts.filter(
    product => product.name && product.name.length >= 3 && 
    product.scoreMestre >= 1 && product.scoreMestre <= 10
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Chat Area - Full width on mobile */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatHeader onClearChat={handleClearChat} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef} 
            />
            
            <ChatInput 
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Recommendations - Bottom sheet style */}
        {validProducts.length > 0 && (
          <div className="bg-white border-t border-gray-200 safe-area-bottom">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Produtos Recomendados</h3>
                  <p className="text-xs text-gray-500">{validProducts.length} produtos encontrados</p>
                </div>
              </div>
              {showRecommendations ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            {showRecommendations && (
              <div className="px-4 pb-4 max-h-96 overflow-y-auto">
                <FeaturedProducts 
                  products={featuredProducts}
                  query={lastQuery}
                  recommendations={lastRecommendations}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout - Keep existing grid layout
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
        {/* Chat Area - 2/3 da tela */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <ChatHeader onClearChat={handleClearChat} />
            
            <div className="flex-1 flex flex-col h-[600px]">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                messagesEndRef={messagesEndRef} 
              />
              
              <ChatInput 
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSend={handleSend}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
              />
            </div>
          </Card>
        </div>

        {/* Recommendations Area - 1/3 da tela */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                🏆 Produtos Recomendados
                {validProducts.length > 0 && (
                  <span className="bg-white text-orange-600 text-xs rounded-full px-2 py-1 font-bold">
                    {validProducts.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 h-[600px] overflow-y-auto">
              {validProducts.length > 0 ? (
                <FeaturedProducts 
                  products={featuredProducts}
                  query={lastQuery}
                  recommendations={lastRecommendations}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Nenhuma recomendação ainda</h3>
                  <p className="text-sm leading-relaxed">
                    Faça uma pergunta sobre produtos no chat ao lado e receba recomendações personalizadas aqui!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductChat;
