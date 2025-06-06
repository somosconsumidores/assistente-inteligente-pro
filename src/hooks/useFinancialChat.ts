
import { useState, useCallback, useEffect } from 'react';
import { useFinancialDataStorage } from './useFinancialDataStorage';

export interface FinancialData {
  renda: number;
  gastosFixes: number;
  gastosVariaveis: number;
  dividas: number;
  reservaEmergencia: number;
  investimentos: number;
  metaEconomia: number;
  objetivos: string[];
  categoriaGastos: Record<string, number>;
}

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatStep {
  id: string;
  question: string;
  field: keyof FinancialData;
  type: 'number' | 'text' | 'select' | 'multiselect';
  options?: string[];
  validation?: (value: any) => boolean;
  formatValue?: (value: string) => any;
}

const chatSteps: ChatStep[] = [
  {
    id: 'welcome',
    question: 'Olá! 👋 Sou seu consultor financeiro pessoal. Vou te ajudar a organizar suas finanças. Qual é sua renda mensal total?',
    field: 'renda',
    type: 'number',
    validation: (value) => value > 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'gastos-fixos',
    question: 'Perfeito! Agora me conta: quanto você gasta por mês com despesas fixas? (aluguel, financiamentos, planos, etc.)',
    field: 'gastosFixes',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'gastos-variaveis',
    question: 'E quanto você costuma gastar com despesas variáveis? (alimentação, lazer, compras, etc.)',
    field: 'gastosVariaveis',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'dividas',
    question: 'Tem alguma dívida? Se sim, qual o valor total? (Se não tiver, digite 0)',
    field: 'dividas',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'reserva',
    question: 'Que ótimo! Você já tem alguma reserva de emergência guardada?',
    field: 'reservaEmergencia',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'investimentos',
    question: 'E investimentos? Quanto você tem aplicado atualmente?',
    field: 'investimentos',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'meta-economia',
    question: 'Quanto você gostaria de conseguir economizar por mês?',
    field: 'metaEconomia',
    type: 'number',
    validation: (value) => value >= 0,
    formatValue: (value) => parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  },
  {
    id: 'objetivos',
    question: 'Quais são seus principais objetivos financeiros? (Selecione quantos quiser)',
    field: 'objetivos',
    type: 'multiselect',
    options: [
      'Quitar dívidas',
      'Reserva de emergência',
      'Comprar casa própria',
      'Trocar de carro',
      'Viajar',
      'Aposentadoria',
      'Educação/Cursos',
      'Investir mais'
    ],
    formatValue: (value) => Array.isArray(value) ? value : [value]
  }
];

export const useFinancialChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [financialData, setFinancialData] = useState<Partial<FinancialData>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const { saveFinancialData, loadFinancialData } = useFinancialDataStorage();

  const addMessage = useCallback((content: string, type: 'bot' | 'user') => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }]);
  }, []);

  // Load existing data on start
  useEffect(() => {
    const loadExistingData = async () => {
      if (hasLoadedData) return;
      
      const existingData = await loadFinancialData();
      if (existingData) {
        setFinancialData(existingData);
        setIsCompleted(true);
        setCurrentStep(chatSteps.length);
        setHasLoadedData(true);
        addMessage('Bem-vindo de volta! Encontrei seus dados financeiros salvos. Você pode visualizar seu dashboard ou conversar comigo novamente para atualizar suas informações.', 'bot');
      } else {
        setHasLoadedData(true);
      }
    };

    loadExistingData();
  }, [loadFinancialData, addMessage, hasLoadedData]);

  const sendMessage = useCallback(async (userInput: string) => {
    if (currentStep >= chatSteps.length) return;

    const step = chatSteps[currentStep];
    addMessage(userInput, 'user');
    setIsLoading(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    let processedValue: any = userInput;

    if (step.formatValue) {
      processedValue = step.formatValue(userInput);
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
      // Chat completed - save data
      const completeData = {
        ...updatedData,
        categoriaGastos: {} // Default empty object
      } as FinancialData;

      const saved = await saveFinancialData(completeData);
      if (saved) {
        addMessage('Perfeito! 🎉 Analisei todos os seus dados e salvei suas informações. Agora vou gerar seu dashboard personalizado com insights sobre sua situação financeira!', 'bot');
      } else {
        addMessage('Perfeito! 🎉 Analisei todos os seus dados. Agora vou gerar seu dashboard personalizado com insights sobre sua situação financeira!', 'bot');
      }
      setIsCompleted(true);
    }

    setIsLoading(false);
  }, [currentStep, addMessage, financialData, saveFinancialData]);

  const startChat = useCallback(() => {
    if (!hasLoadedData) return;
    
    setMessages([]);
    setCurrentStep(0);
    setFinancialData({});
    setIsCompleted(false);
    addMessage(chatSteps[0].question, 'bot');
  }, [addMessage, hasLoadedData]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentStep(0);
    setFinancialData({});
    setIsCompleted(false);
    setHasLoadedData(false);
  }, []);

  return {
    messages,
    currentStep: currentStep < chatSteps.length ? chatSteps[currentStep] : null,
    financialData: financialData as FinancialData,
    isCompleted,
    isLoading,
    sendMessage,
    startChat,
    resetChat
  };
};
