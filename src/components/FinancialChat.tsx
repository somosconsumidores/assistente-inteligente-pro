import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useFinancialChat } from '@/hooks/useFinancialChat';
interface FinancialChatProps {
  onComplete: (data: any) => void;
}
const FinancialChat: React.FC<FinancialChatProps> = ({
  onComplete
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    currentStep,
    financialData,
    isCompleted,
    isLoading,
    sendMessage,
    startChat
  } = useFinancialChat();
  useEffect(() => {
    startChat();
  }, [startChat]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  useEffect(() => {
    if (isCompleted) {
      onComplete(financialData);
    }
  }, [isCompleted, financialData, onComplete]);
  const handleSend = async () => {
    if (!inputValue.trim() && (!currentStep || currentStep.type !== 'multiselect')) return;
    let valueToSend = inputValue;
    if (currentStep?.type === 'multiselect') {
      valueToSend = selectedOptions.join(', ');
      setSelectedOptions([]);
    }
    await sendMessage(valueToSend);
    setInputValue('');
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(numbers) / 100);
    return formatted;
  };
  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentStep?.type === 'number') {
      const formatted = formatCurrency(e.target.value);
      setInputValue(formatted);
    } else {
      setInputValue(e.target.value);
    }
  };
  return <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => <div key={index} className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'bot' && <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>}
            
            <Card className={`max-w-sm ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-3">
                <p className="text-sm text-zinc-800">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block text-zinc-800">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </CardContent>
            </Card>

            {message.type === 'user' && <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>}
          </div>)}

        {isLoading && <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              </CardContent>
            </Card>
          </div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isCompleted && currentStep && <div className="border-t p-4 bg-zinc-800">
          {currentStep.type === 'multiselect' ? <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {currentStep.options?.map(option => <Button key={option} variant={selectedOptions.includes(option) ? 'default' : 'outline'} size="sm" onClick={() => toggleOption(option)} className="text-left justify-start">
                    {option}
                  </Button>)}
              </div>
              <Button onClick={handleSend} disabled={isLoading || selectedOptions.length === 0} className="w-full">
                Continuar
              </Button>
            </div> : <div className="flex space-x-2">
              <Input value={inputValue} onChange={handleCurrencyInput} onKeyPress={handleKeyPress} placeholder={currentStep.type === 'number' ? 'Digite o valor...' : 'Digite sua resposta...'} disabled={isLoading} className="flex-1" />
              <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()} size="icon" className="text-slate-50 bg-blue-950 hover:bg-blue-800 font-extrabold">
                <Send className="w-4 h-4" />
              </Button>
            </div>}
        </div>}
    </div>;
};
export default FinancialChat;