
import { useState } from 'react';

interface PeticaoFormData {
  nome?: string;
  cpf?: string;
  empresa?: string;
  valor?: string;
  relato?: string;
}

interface FlowStep {
  field: keyof PeticaoFormData;
  question: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    field: 'nome',
    question: 'Qual é o seu nome completo?'
  },
  {
    field: 'cpf',
    question: 'Qual é o seu CPF? (formato: 000.000.000-00)',
    validation: (value) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value),
    errorMessage: 'Por favor, digite o CPF no formato correto: 000.000.000-00'
  },
  {
    field: 'empresa',
    question: 'Qual é o nome da empresa que causou o problema?'
  },
  {
    field: 'valor',
    question: 'Qual é o valor do dano sofrido? (ex: R$ 1.500,00)',
    validation: (value) => /^R\$\s*\d+([.,]\d{2})?$/.test(value.replace(/\s/g, '')),
    errorMessage: 'Por favor, digite o valor no formato correto: R$ 0,00'
  },
  {
    field: 'relato',
    question: 'Agora me conte detalhadamente o que aconteceu. Descreva todos os fatos relevantes:'
  }
];

export const usePeticaoChatFlow = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PeticaoFormData>({});
  const [isComplete, setIsComplete] = useState(false);

  const startFlow = () => {
    setIsActive(true);
    setCurrentStep(0);
    setFormData({});
    setIsComplete(false);
  };

  const processResponse = (response: string): { 
    isValid: boolean; 
    message?: string; 
    shouldAdvance?: boolean;
    isFlowComplete?: boolean;
  } => {
    if (!isActive) return { isValid: false };

    const currentStepData = FLOW_STEPS[currentStep];
    const trimmedResponse = response.trim();

    // Validação da resposta
    if (currentStepData.validation && !currentStepData.validation(trimmedResponse)) {
      return {
        isValid: false,
        message: currentStepData.errorMessage || 'Resposta inválida. Tente novamente.',
        shouldAdvance: false
      };
    }

    // Salvar a resposta
    const updatedFormData = {
      ...formData,
      [currentStepData.field]: trimmedResponse
    };
    setFormData(updatedFormData);

    // Verificar se é a última pergunta
    if (currentStep === FLOW_STEPS.length - 1) {
      setIsComplete(true);
      setIsActive(false);
      return {
        isValid: true,
        message: 'Perfeito! Agora tenho todas as informações necessárias. Vou gerar sua petição...',
        shouldAdvance: true,
        isFlowComplete: true
      };
    }

    // Avançar para próxima pergunta
    setCurrentStep(currentStep + 1);
    return {
      isValid: true,
      message: `Obrigado! ${FLOW_STEPS[currentStep + 1].question}`,
      shouldAdvance: true
    };
  };

  const getNextQuestion = (): string => {
    if (!isActive || currentStep >= FLOW_STEPS.length) return '';
    return FLOW_STEPS[currentStep].question;
  };

  const getProgressInfo = () => ({
    current: currentStep + 1,
    total: FLOW_STEPS.length,
    percentage: Math.round(((currentStep + 1) / FLOW_STEPS.length) * 100)
  });

  const resetFlow = () => {
    setIsActive(false);
    setCurrentStep(0);
    setFormData({});
    setIsComplete(false);
  };

  const canStartFlow = (message: string): boolean => {
    const triggers = [
      'gerar petição',
      'criar petição',
      'petição',
      'peticao',
      'quero processar',
      'entrar com ação',
      'ação judicial'
    ];
    
    return triggers.some(trigger => 
      message.toLowerCase().includes(trigger)
    );
  };

  return {
    isActive,
    currentStep,
    formData,
    isComplete,
    startFlow,
    processResponse,
    getNextQuestion,
    getProgressInfo,
    resetFlow,
    canStartFlow
  };
};
