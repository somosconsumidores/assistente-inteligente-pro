
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader = ({ onClearChat }: ChatHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-6'} border-b border-gray-600 bg-gray-800`}>
      <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-lg`}>
          <Bot className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
        </div>
        <div>
          <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-white`}>
            🏆 Mestre dos Produtos
          </h3>
          {!isMobile && (
            <p className="text-sm text-gray-300">Especialista em comparações e avaliações</p>
          )}
        </div>
      </div>
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "sm"}
        onClick={onClearChat} 
        className={`flex items-center gap-2 border-2 border-gray-600 bg-gray-700 text-gray-200 hover:border-orange-500 hover:bg-orange-600 hover:text-white ${isMobile ? 'px-3' : ''}`}
      >
        <RotateCcw className="w-4 h-4" />
        {!isMobile && <span>Nova Conversa</span>}
      </Button>
    </div>
  );
};

export default ChatHeader;
