
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

const ChatInput = ({ inputValue, setInputValue, onSend, onKeyPress, isLoading }: ChatInputProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="border-t border-gray-600 bg-gray-800 p-3 sm:p-4 mt-auto">
      <div className={`flex gap-2 sm:gap-3 ${isMobile ? 'max-w-none' : 'max-w-4xl mx-auto'}`}>
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Pergunte sobre qualquer produto..."
          disabled={isLoading}
          className={`flex-1 ${isMobile ? 'h-11 px-3 text-base' : 'h-12 px-4 text-base'} border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg`}
        />
        <Button 
          onClick={onSend} 
          disabled={isLoading || !inputValue.trim()} 
          className={`${isMobile ? 'h-11 px-4' : 'h-12 px-6'} bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg flex-shrink-0`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
