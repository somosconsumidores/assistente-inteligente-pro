
import React, { useState, useRef, useEffect } from 'react';
import { useProductChat } from '@/hooks/useProductChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

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

  const validProducts = featuredProducts.filter(
    product => product.name && product.name.length >= 3 && 
    product.scoreMestre >= 1 && product.scoreMestre <= 10
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col min-h-[600px] max-h-[80vh] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <ChatHeader onClearChat={handleClearChat} />

        {/* Chat Interface - Sempre visível */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            messagesEndRef={messagesEndRef} 
          />
          
          {/* Seção de Recomendações - Aparece automaticamente quando há produtos */}
          {validProducts.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🏆 Produtos Recomendados
                  <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {validProducts.length}
                  </span>
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <FeaturedProducts 
                  products={featuredProducts}
                  query={lastQuery}
                  recommendations={lastRecommendations}
                />
              </div>
            </div>
          )}
          
          <ChatInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductChat;
