
import { CollectedOption } from './types.ts';

// Função para calcular pontuação de uma opção
export const calculateOptionScore = (option: CollectedOption, budget: number): number => {
  let score = 0;
  
  // Pontos por tipo de dados (dados reais são melhores)
  if (option.type === 'real') {
    score += 1000; // Prioridade máxima para dados completamente reais
  } else if (option.type === 'hybrid') {
    score += 500; // Prioridade média para dados híbridos
  } else {
    score += 100; // Prioridade baixa para estimativas
  }
  
  // Pontos por orçamento sobrando (mais orçamento sobrando = melhor)
  if (option.totalCost) {
    const remainingBudget = budget - option.totalCost;
    score += Math.max(0, remainingBudget / 100); // 1 ponto por R$ 100 sobrando
  }
  
  // Penalidade se exceder orçamento
  if (option.totalCost && option.totalCost > budget - 500) {
    score -= 2000; // Penalidade pesada se não sobrar pelo menos R$ 500
  }
  
  return score;
};
