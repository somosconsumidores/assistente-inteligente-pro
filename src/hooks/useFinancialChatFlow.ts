
import { useState } from 'react';

export interface FinancialData {
  nome?: string;
  rendaMensal?: number;
  gastosMoradia?: number;
  gastosTransporte?: number;
  gastosAlimentacao?: number;
  gastosLazer?: number;
  outrosGastos?: number;
  dividas?: number;
  economia?: number;
  objetivoFinanceiro?: string;
  prazoObjetivo?: number;
}

export interface ChatMessage {
  type: 'user' | 'consultant';
  content: string;
  timestamp: Date;
}

type FlowStep = 
  | 'greeting'
  | 'nome'
  | 'renda'
  | 'gastos_moradia'
  | 'gastos_transporte'
  | 'gastos_alimentacao'
  | 'gastos_lazer'
  | 'outros_gastos'
  | 'dividas'
  | 'economia'
  | 'objetivo'
  | 'prazo_objetivo'
  | 'summary'
  | 'completed';

export const useFinancialChatFlow = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('greeting');
  const [financialData, setFinancialData] = useState<FinancialData>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'consultant',
      content: 'Olá! Sou seu consultor financeiro pessoal. Vou te ajudar a entender melhor sua situação financeira e criar um plano personalizado para você. Para começar, como você gostaria que eu te chamasse?',
      timestamp: new Date()
    }
  ]);
  const [isCollecting, setIsCollecting] = useState(true);

  const stepQuestions: Record<FlowStep, string> = {
    greeting: 'Olá! Sou seu consultor financeiro pessoal...',
    nome: 'Como você gostaria que eu te chamasse?',
    renda: 'Qual é sua renda mensal total (incluindo salário, freelances, etc)?',
    gastos_moradia: 'Quanto você gasta mensalmente com moradia (aluguel, financiamento, contas básicas)?',
    gastos_transporte: 'E com transporte (combustível, transporte público, manutenção do carro)?',
    gastos_alimentacao: 'Quanto destina para alimentação (mercado, restaurantes)?',
    gastos_lazer: 'E para lazer e entretenimento?',
    outros_gastos: 'Tem outros gastos fixos importantes (plano de saúde, academia, etc)?',
    dividas: 'Possui alguma dívida? Se sim, qual o valor total?',
    economia: 'Tem alguma quantia guardada/investida?',
    objetivo: 'Qual seu principal objetivo financeiro? (ex: comprar casa, carro, viajar, aposentadoria)',
    prazo_objetivo: 'Em quanto tempo gostaria de alcançar esse objetivo (em meses)?',
    summary: 'Perfeito! Vou processar suas informações...',
    completed: 'Análise concluída!'
  };

  const validateInput = (step: FlowStep, input: string): { isValid: boolean; value?: any; error?: string } => {
    const trimmedInput = input.trim();
    
    switch (step) {
      case 'nome':
        if (trimmedInput.length < 2) {
          return { isValid: false, error: 'Por favor, digite um nome válido.' };
        }
        return { isValid: true, value: trimmedInput };
      
      case 'renda':
      case 'gastos_moradia':
      case 'gastos_transporte':
      case 'gastos_alimentacao':
      case 'gastos_lazer':
      case 'outros_gastos':
      case 'dividas':
      case 'economia':
        const numericValue = parseFloat(trimmedInput.replace(/[^\d,.-]/g, '').replace(',', '.'));
        if (isNaN(numericValue) || numericValue < 0) {
          return { isValid: false, error: 'Por favor, digite um valor numérico válido (pode ser 0).' };
        }
        return { isValid: true, value: numericValue };
      
      case 'prazo_objetivo':
        const months = parseInt(trimmedInput);
        if (isNaN(months) || months <= 0) {
          return { isValid: false, error: 'Por favor, digite um número de meses válido.' };
        }
        return { isValid: true, value: months };
      
      case 'objetivo':
        if (trimmedInput.length < 3) {
          return { isValid: false, error: 'Por favor, descreva melhor seu objetivo.' };
        }
        return { isValid: true, value: trimmedInput };
      
      default:
        return { isValid: true, value: trimmedInput };
    }
  };

  const getNextStep = (current: FlowStep): FlowStep => {
    const stepOrder: FlowStep[] = [
      'greeting', 'nome', 'renda', 'gastos_moradia', 'gastos_transporte', 
      'gastos_alimentacao', 'gastos_lazer', 'outros_gastos', 'dividas', 
      'economia', 'objetivo', 'prazo_objetivo', 'summary', 'completed'
    ];
    
    const currentIndex = stepOrder.indexOf(current);
    return stepOrder[currentIndex + 1] || 'completed';
  };

  const processUserInput = (input: string) => {
    const userMessage: ChatMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Validar entrada
    const validation = validateInput(currentStep, input);
    
    if (!validation.isValid) {
      const errorMessage: ChatMessage = {
        type: 'consultant',
        content: validation.error || 'Entrada inválida. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Atualizar dados financeiros
    const updatedData = { ...financialData };
    switch (currentStep) {
      case 'nome':
        updatedData.nome = validation.value;
        break;
      case 'renda':
        updatedData.rendaMensal = validation.value;
        break;
      case 'gastos_moradia':
        updatedData.gastosMoradia = validation.value;
        break;
      case 'gastos_transporte':
        updatedData.gastosTransporte = validation.value;
        break;
      case 'gastos_alimentacao':
        updatedData.gastosAlimentacao = validation.value;
        break;
      case 'gastos_lazer':
        updatedData.gastosLazer = validation.value;
        break;
      case 'outros_gastos':
        updatedData.outrosGastos = validation.value;
        break;
      case 'dividas':
        updatedData.dividas = validation.value;
        break;
      case 'economia':
        updatedData.economia = validation.value;
        break;
      case 'objetivo':
        updatedData.objetivoFinanceiro = validation.value;
        break;
      case 'prazo_objetivo':
        updatedData.prazoObjetivo = validation.value;
        break;
    }

    setFinancialData(updatedData);

    // Avançar para próximo passo
    const nextStep = getNextStep(currentStep);
    setCurrentStep(nextStep);

    // Resposta do consultor
    setTimeout(() => {
      let consultantResponse = '';
      
      if (nextStep === 'completed') {
        consultantResponse = `Perfeito, ${updatedData.nome}! Coletei todas as informações necessárias. Vou gerar seu dashboard personalizado agora.`;
        setIsCollecting(false);
      } else if (nextStep === 'summary') {
        consultantResponse = `Ótimo! Agora tenho uma visão completa da sua situação financeira. Deixe-me processar tudo...`;
        // Auto-avançar para completed após 2 segundos
        setTimeout(() => {
          setCurrentStep('completed');
          const finalMessage: ChatMessage = {
            type: 'consultant',
            content: `Pronto, ${updatedData.nome}! Seu dashboard financeiro personalizado está sendo gerado. Você pode vê-lo logo abaixo do chat.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, finalMessage]);
          setIsCollecting(false);
        }, 2000);
      } else {
        consultantResponse = stepQuestions[nextStep];
      }

      if (consultantResponse) {
        const responseMessage: ChatMessage = {
          type: 'consultant',
          content: consultantResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 1000);
  };

  const resetFlow = () => {
    setCurrentStep('greeting');
    setFinancialData({});
    setMessages([
      {
        type: 'consultant',
        content: 'Olá! Sou seu consultor financeiro pessoal. Vou te ajudar a entender melhor sua situação financeira e criar um plano personalizado para você. Para começar, como você gostaria que eu te chamasse?',
        timestamp: new Date()
      }
    ]);
    setIsCollecting(true);
  };

  const getProgressPercentage = () => {
    const totalSteps = 12; // Total de passos coletáveis
    const stepOrder: FlowStep[] = [
      'greeting', 'nome', 'renda', 'gastos_moradia', 'gastos_transporte', 
      'gastos_alimentacao', 'gastos_lazer', 'outros_gastos', 'dividas', 
      'economia', 'objetivo', 'prazo_objetivo'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    return Math.max(0, Math.min(100, (currentIndex / (totalSteps - 1)) * 100));
  };

  return {
    messages,
    currentStep,
    financialData,
    isCollecting,
    processUserInput,
    resetFlow,
    getProgressPercentage
  };
};
