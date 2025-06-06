
import { useEffect, useCallback } from 'react';
import { FinancialData } from '@/types/financialTypes';
import { chatSteps } from '@/config/financialChatSteps';
import { useFinancialChatState } from './useFinancialChatState';
import { useFinancialChatActions } from './useFinancialChatActions';
import { useFinancialDataStorage } from './useFinancialDataStorage';

export const useFinancialChat = () => {
  const {
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
  } = useFinancialChatState();

  const { sendMessage } = useFinancialChatActions({
    currentStep,
    financialData,
    setCurrentStep,
    setFinancialData,
    setIsCompleted,
    setIsLoading,
    addMessage
  });

  const { loadFinancialData } = useFinancialDataStorage();

  // Initialize once
  useEffect(() => {
    if (hasInitialized) return;

    let isMounted = true;

    const initializeChat = async () => {
      try {
        const existingData = await loadFinancialData();
        
        if (!isMounted) return;
        
        if (existingData && Object.keys(existingData).length > 0) {
          setFinancialData(existingData);
          setIsCompleted(true);
          setCurrentStep(chatSteps.length);
          setHasNotifiedCompletion(true);
          addMessage('Bem-vindo de volta! Encontrei seus dados financeiros salvos. Você pode visualizar seu dashboard ou conversar comigo novamente para atualizar suas informações.', 'bot');
        } else {
          addMessage(chatSteps[0].question, 'bot');
        }
        
        setHasInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
        if (isMounted) {
          addMessage(chatSteps[0].question, 'bot');
          setHasInitialized(true);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [hasInitialized, loadFinancialData, addMessage, setFinancialData, setIsCompleted, setCurrentStep, setHasInitialized, setHasNotifiedCompletion]);

  const startChat = useCallback(() => {
    if (!isCompleted && hasInitialized) {
      return;
    }
    
    resetChat();
  }, [isCompleted, hasInitialized, resetChat]);

  return {
    messages,
    currentStep: currentStep < chatSteps.length ? chatSteps[currentStep] : null,
    financialData: financialData as FinancialData,
    isCompleted,
    isLoading,
    sendMessage,
    startChat,
    resetChat,
    hasNotifiedCompletion
  };
};

// Re-export types for backward compatibility
export type { FinancialData } from '@/types/financialTypes';
