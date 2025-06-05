
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User, Loader2 } from 'lucide-react';
import FormattedMessage from '../FormattedMessage';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({ messages, isLoading, messagesEndRef }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          {message.type === 'assistant' && (
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          
          <Card className={`max-w-2xl ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-4">
              {message.type === 'user' ? (
                <div className="text-sm leading-relaxed text-white">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ) : (
                <FormattedMessage content={message.content} className="text-sm" />
              )}
              <span className={`text-xs mt-2 block ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
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
  );
};

export default ChatMessages;
