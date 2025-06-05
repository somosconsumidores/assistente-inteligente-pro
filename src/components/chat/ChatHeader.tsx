
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, RotateCcw } from 'lucide-react';

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader = ({ onClearChat }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">🏆 Mestre dos Produtos</h3>
          <p className="text-sm text-gray-600">Especialista em comparações e avaliações</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onClearChat} className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Nova Conversa
      </Button>
    </div>
  );
};

export default ChatHeader;
