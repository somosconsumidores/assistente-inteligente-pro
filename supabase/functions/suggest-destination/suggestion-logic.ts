
import { destinations } from './destinations.ts';
import { searchFlights, searchAccommodation } from './api-services.ts';
import { getTravelStyle, createHybridSuggestion, createEstimatedSuggestion } from './travel-utils.ts';
import { calculateOptionScore } from './scoring.ts';
import { CollectedOption } from './types.ts';

// Função principal para sugerir destino - NOVA LÓGICA
export const suggestDestination = async (budget: number) => {
  console.log(`🎯 Buscando destino para orçamento de R$ ${budget}`);
  
  // Filtrar destinos que cabem no orçamento (considerando 80% do orçamento para voo+hospedagem)
  const maxCostForTravel = budget * 0.8;
  const suitableDestinations = destinations.filter(dest => dest.minBudget <= maxCostForTravel);
  
  if (suitableDestinations.length === 0) {
    throw new Error('Orçamento insuficiente para qualquer destino disponível');
  }

  // Ordenar por valor (mais caro primeiro) para pegar o melhor destino possível
  suitableDestinations.sort((a, b) => b.minBudget - a.minBudget);
  
  const travelStyle = getTravelStyle(budget);
  console.log(`🎨 Estilo de viagem determinado: ${travelStyle}`);
  
  // Array para coletar todas as opções válidas
  const collectedOptions: CollectedOption[] = [];
  
  // Testar até 5 destinos para coletar opções
  for (let i = 0; i < Math.min(5, suitableDestinations.length); i++) {
    const destination = suitableDestinations[i];
    console.log(`🔍 Testando destino ${i + 1}/${Math.min(5, suitableDestinations.length)}: ${destination.name}`);
    
    // Buscar voos e hospedagem em paralelo
    const [flightData, accommodationData] = await Promise.all([
      searchFlights(destination.name, budget),
      searchAccommodation(destination.name, travelStyle)
    ]);

    // Processar resultados e criar opções
    if (flightData && accommodationData) {
      // Opção com dados completamente reais
      const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
      const totalAccommodationCost = accommodationData.totalPrice;
      const totalTravelCost = totalFlightCost + totalAccommodationCost;
      
      console.log(`💰 Dados REAIS para ${destination.name}: Voo R$ ${totalFlightCost}, Hospedagem R$ ${totalAccommodationCost}, Total R$ ${totalTravelCost}`);
      
      const realOption: CollectedOption = {
        destination,
        flightData,
        accommodationData,
        totalCost: totalTravelCost,
        score: 0,
        type: 'real'
      };
      realOption.score = calculateOptionScore(realOption, budget);
      collectedOptions.push(realOption);
      
      console.log(`✅ Opção REAL adicionada: ${destination.name} - Score: ${realOption.score}`);
      
    } else if (flightData && !accommodationData) {
      // Opção híbrida (voo real + hospedagem estimada)
      const hybridSuggestion = createHybridSuggestion(destination, flightData, travelStyle, budget);
      
      console.log(`🔄 Dados HÍBRIDOS para ${destination.name}: Voo real R$ ${flightData.pricePerPerson}, Hospedagem estimada R$ ${hybridSuggestion.accommodationCost}, Total R$ ${hybridSuggestion.totalTravelCost}`);
      
      const hybridOption: CollectedOption = {
        destination,
        flightData,
        totalCost: hybridSuggestion.totalTravelCost,
        score: 0,
        type: 'hybrid'
      };
      hybridOption.score = calculateOptionScore(hybridOption, budget);
      collectedOptions.push(hybridOption);
      
      console.log(`🎯 Opção HÍBRIDA adicionada: ${destination.name} - Score: ${hybridOption.score}`);
      
    } else {
      console.log(`⚠️ Dados incompletos para ${destination.name}: voo=${!!flightData}, hospedagem=${!!accommodationData}`);
    }
  }
  
  // Se temos opções coletadas, escolher a melhor baseada na pontuação
  if (collectedOptions.length > 0) {
    // Ordenar por pontuação (maior primeiro)
    collectedOptions.sort((a, b) => b.score - a.score);
    
    console.log(`📊 RANKING DAS OPÇÕES:`);
    collectedOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option.destination.name} - Score: ${option.score} - Tipo: ${option.type} - Custo: R$ ${option.totalCost}`);
    });
    
    const bestOption = collectedOptions[0];
    console.log(`🏆 MELHOR OPÇÃO SELECIONADA: ${bestOption.destination.name} (Score: ${bestOption.score})`);
    
    // Criar resposta baseada no tipo da melhor opção
    if (bestOption.type === 'real') {
      const totalFlightCost = bestOption.flightData.totalPrice || bestOption.flightData.pricePerPerson;
      const totalAccommodationCost = bestOption.accommodationData.totalPrice;
      const totalTravelCost = totalFlightCost + totalAccommodationCost;
      const remainingBudget = budget - totalTravelCost;
      
      return {
        destination: bestOption.destination,
        flightCost: totalFlightCost,
        accommodationCost: totalAccommodationCost,
        totalTravelCost: totalTravelCost,
        remainingBudget: remainingBudget,
        currency: bestOption.flightData.currency || 'BRL',
        travelStyle: travelStyle,
        hotelDetails: bestOption.accommodationData.hotelDetails,
        flightDetails: {
          airlineCode: bestOption.flightData.airlineCode,
          airlineName: bestOption.flightData.airlineName,
          quotationDate: bestOption.flightData.quotationDate
        },
        accommodationQuotationDate: bestOption.accommodationData.quotationDate,
        success: true,
        isRealData: true,
        isEstimate: false,
        hasRealFlightData: true,
        hasRealAccommodationData: true
      };
    } else if (bestOption.type === 'hybrid') {
      return createHybridSuggestion(bestOption.destination, bestOption.flightData, travelStyle, budget);
    }
  }
  
  // Se nenhuma opção com dados reais funcionou, usar estimativa do melhor destino possível
  const fallbackDestination = suitableDestinations[0];
  console.log(`📊 Usando estimativa completa para: ${fallbackDestination.name}`);
  
  return createEstimatedSuggestion(fallbackDestination, budget, travelStyle);
};
