
import { useState } from 'react';
import { ChatMessage, FinancialData } from '@/types/financialTypes';

export const useFinancialChatState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [financialData, setFinancialData] = useState<Partial<FinancialData>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

  const addMessage = (content: string, type: 'bot' | 'user') => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setFinancialData({});
    setIsCompleted(false);
    setHasInitialized(false);
    setHasNotifiedCompletion(false);
  };

  return {
    messages,
    currentStep,
    financialData,
    isCompleted,
    isLoading,
    hasInitialized,
    hasNotifiedCompletion,
    setCurrentStep,
    setFinancialData,
    setIsCompleted,
    setIsLoading,
    setHasInitialized,
    setHasNotifiedCompletion,
    addMessage,
    resetChat
  };
};
