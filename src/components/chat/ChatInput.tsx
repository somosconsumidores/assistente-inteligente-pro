
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
    <div className="border-t p-4 bg-gray-800">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Pergunte sobre qualquer produto..."
          disabled={isLoading}
          className="flex-1 rounded-none bg-transparent"
        />
        <Button onClick={onSend} disabled={isLoading || !inputValue.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
