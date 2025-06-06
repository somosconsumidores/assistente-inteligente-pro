
import { useCallback } from 'react';
import { FinancialData } from '@/types/financialTypes';
import { chatSteps } from '@/config/financialChatSteps';
import { useFinancialDataStorage } from './useFinancialDataStorage';

interface UseFinancialChatActionsProps {
  currentStep: number;
  financialData: Partial<FinancialData>;
  setCurrentStep: (step: number) => void;
  setFinancialData: (data: Partial<FinancialData>) => void;
  setIsCompleted: (completed: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addMessage: (content: string, type: 'bot' | 'user') => void;
}

export const useFinancialChatActions = ({
  currentStep,
  financialData,
  setCurrentStep,
  setFinancialData,
  setIsCompleted,
  setIsLoading,
  addMessage
}: UseFinancialChatActionsProps) => {
  const { saveFinancialData } = useFinancialDataStorage();

  const sendMessage = useCallback(async (userInput: string) => {
    if (currentStep >= chatSteps.length) return;

    const step = chatSteps[currentStep];
    addMessage(userInput, 'user');
    setIsLoading(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    let processedValue: any = userInput;

    if (step.formatValue) {
      try {
        processedValue = step.formatValue(userInput);
      } catch (error) {
        console.error('Erro ao processar valor:', error);
        addMessage('Por favor, insira um valor válido. Tente novamente! 😊', 'bot');
        setIsLoading(false);
        return;
      }
    }

    if (step.validation && !step.validation(processedValue)) {
      addMessage('Por favor, insira um valor válido. Tente novamente! 😊', 'bot');
      setIsLoading(false);
      return;
    }

    // Atualizar dados financeiros
    const updatedData = {
      ...financialData,
      [step.field]: processedValue
    };
    setFinancialData(updatedData);

    // Próximo passo
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (nextStep < chatSteps.length) {
      addMessage(chatSteps[nextStep].question, 'bot');
    } else {
      // Chat completed
      const completeData = {
        ...updatedData,
        categoriaGastos: {}
      } as FinancialData;

      try {
        await saveFinancialData(completeData);
        setFinancialData(completeData);
        addMessage('Perfeito! 🎉 Analisei todos os seus dados e salvei suas informações. Agora vou gerar seu dashboard personalizado!', 'bot');
        setIsCompleted(true);
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
        addMessage('Perfeito! 🎉 Analisei todos os seus dados. Agora vou gerar seu dashboard personalizado!', 'bot');
        setIsCompleted(true);
      }
    }

    setIsLoading(false);
  }, [currentStep, addMessage, financialData, saveFinancialData, setCurrentStep, setFinancialData, setIsCompleted, setIsLoading]);

  return { sendMessage };
};
