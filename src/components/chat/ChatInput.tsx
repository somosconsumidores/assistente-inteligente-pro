
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

const ChatInput = ({ inputValue, setInputValue, onSend, onKeyPress, isLoading }: ChatInputProps) => {
  return (
    <div className="border-t bg-white p-4 mt-auto">
      <div className="flex space-x-3 max-w-4xl mx-auto">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Pergunte sobre qualquer produto..."
          disabled={isLoading}
          className="flex-1 h-12 px-4 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
        />
        <Button 
          onClick={onSend} 
          disabled={isLoading || !inputValue.trim()} 
          className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
