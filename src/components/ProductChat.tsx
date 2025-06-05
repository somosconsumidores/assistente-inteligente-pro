
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Star } from 'lucide-react';
import { useProductChat } from '@/hooks/useProductChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import RecommendationsTab from './chat/RecommendationsTab';

const ProductChat = () => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
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

  // Log featured products for debugging
  useEffect(() => {
    console.log('Featured products updated in ProductChat:', featuredProducts);
  }, [featuredProducts]);

  // Removed auto-switch logic - user stays in chat tab unless they manually switch

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
    setActiveTab('chat');
  };

  const validProducts = featuredProducts.filter(
    product => product.name && product.name.length >= 3 && 
    product.scoreMestre >= 1 && product.scoreMestre <= 10
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col h-[700px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <ChatHeader onClearChat={handleClearChat} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 bg-gray-100">
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-white">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Star className="w-4 h-4" />
              Nossas Recomendações
              {validProducts.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {validProducts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
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
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="flex-1 p-4 overflow-y-auto">
            <RecommendationsTab 
              featuredProducts={featuredProducts}
              lastQuery={lastQuery}
              lastRecommendations={lastRecommendations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductChat;
