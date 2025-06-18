import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DestinationSuggestionRequest {
  budget: number;
}

interface DestinationOption {
  name: string;
  country: string;
  category: 'nacional' | 'regional' | 'internacional' | 'premium';
  minBudget: number;
  description: string;
  estimatedFlightCost: number;
  estimatedAccommodationCost: number;
}

// Base de destinos expandida com estimativas mais realistas
const destinations: DestinationOption[] = [
  // Destinos Nacionais (até R$ 3.000)
  { 
    name: 'Foz do Iguaçu', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 1500, 
    description: 'Cataratas mundialmente famosas',
    estimatedFlightCost: 800,
    estimatedAccommodationCost: 700
  },
  { 
    name: 'Salvador', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 1800, 
    description: 'História e cultura afro-brasileira',
    estimatedFlightCost: 900,
    estimatedAccommodationCost: 900
  },
  { 
    name: 'Rio de Janeiro', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 2000, 
    description: 'Cidade Maravilhosa com praias icônicas',
    estimatedFlightCost: 600,
    estimatedAccommodationCost: 1400
  },
  { 
    name: 'Florianópolis', 
    country: 'Brasil', 
    category: 'nacional', 
    minBudget: 2200, 
    description: 'Ilha da Magia com praias paradisíacas',
    estimatedFlightCost: 700,
    estimatedAccommodationCost: 1500
  },

  // América do Sul (R$ 3.000 - R$ 6.000)
  { 
    name: 'Buenos Aires', 
    country: 'Argentina', 
    category: 'regional', 
    minBudget: 3500, 
    description: 'Capital do tango e da carne',
    estimatedFlightCost: 1800,
    estimatedAccommodationCost: 1700
  },
  { 
    name: 'Santiago', 
    country: 'Chile', 
    category: 'regional', 
    minBudget: 4000, 
    description: 'Cordilheira dos Andes e vinhos',
    estimatedFlightCost: 2200,
    estimatedAccommodationCost: 1800
  },
  { 
    name: 'Lima', 
    country: 'Peru', 
    category: 'regional', 
    minBudget: 3800, 
    description: 'Gastronomia mundial e história inca',
    estimatedFlightCost: 2000,
    estimatedAccommodationCost: 1800
  },
  { 
    name: 'Montevidéu', 
    country: 'Uruguai', 
    category: 'regional', 
    minBudget: 3200, 
    description: 'Charme europeu na América do Sul',
    estimatedFlightCost: 1600,
    estimatedAccommodationCost: 1600
  },

  // Internacional (R$ 6.000 - R$ 10.000)
  { 
    name: 'Lisboa', 
    country: 'Portugal', 
    category: 'internacional', 
    minBudget: 7000, 
    description: 'História, fado e pastéis de nata',
    estimatedFlightCost: 4200,
    estimatedAccommodationCost: 2800
  },
  { 
    name: 'Madrid', 
    country: 'Espanha', 
    category: 'internacional', 
    minBudget: 7500, 
    description: 'Arte, cultura e vida noturna',
    estimatedFlightCost: 4500,
    estimatedAccommodationCost: 3000
  },
  { 
    name: 'Miami', 
    country: 'Estados Unidos', 
    category: 'internacional', 
    minBudget: 8000, 
    description: 'Praias, compras e vida cosmopolita',
    estimatedFlightCost: 5000,
    estimatedAccommodationCost: 3000
  },
  { 
    name: 'Bangkok', 
    country: 'Tailândia', 
    category: 'internacional', 
    minBudget: 6500, 
    description: 'Templos dourados e street food',
    estimatedFlightCost: 4000,
    estimatedAccommodationCost: 2500
  },

  // Premium (acima de R$ 10.000)
  { 
    name: 'Paris', 
    country: 'França', 
    category: 'premium', 
    minBudget: 12000, 
    description: 'Cidade Luz e capital do romance',
    estimatedFlightCost: 7200,
    estimatedAccommodationCost: 4800
  },
  { 
    name: 'Tóquio', 
    country: 'Japão', 
    category: 'premium', 
    minBudget: 13000, 
    description: 'Tradição e modernidade em harmonia',
    estimatedFlightCost: 8000,
    estimatedAccommodationCost: 5000
  },
  { 
    name: 'Londres', 
    country: 'Reino Unido', 
    category: 'premium', 
    minBudget: 11000, 
    description: 'História real e cultura britânica',
    estimatedFlightCost: 6600,
    estimatedAccommodationCost: 4400
  },
  { 
    name: 'Sydney', 
    country: 'Austrália', 
    category: 'premium', 
    minBudget: 15000, 
    description: 'Opera House e praias espetaculares',
    estimatedFlightCost: 9000,
    estimatedAccommodationCost: 6000
  },
];

// Função para chamar API de busca de voos com retry
const searchFlights = async (destination: string, budget: number, retryCount = 0): Promise<any> => {
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 30); // 30 dias no futuro
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 7); // 7 dias de viagem

  try {
    console.log(`Tentativa ${retryCount + 1} de busca de voos para ${destination}`);
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-flight-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        origin: 'São Paulo',
        destination: destination,
        departureDate: departureDate.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        passengers: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Flight search failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Flight search returned error');
    }
    
    console.log(`✅ Voos encontrados para ${destination}: R$ ${data.pricePerPerson} (${data.airlineName})`);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar voos para ${destination} (tentativa ${retryCount + 1}):`, error.message);
    
    // Retry até 2 vezes com delay
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Delay crescente
      return searchFlights(destination, budget, retryCount + 1);
    }
    
    return null;
  }
};

// Função para chamar API de busca de hospedagem com retry
const searchAccommodation = async (destination: string, travelStyle: string, retryCount = 0): Promise<any> => {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 30);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 7);

  try {
    console.log(`Tentativa ${retryCount + 1} de busca de hospedagem para ${destination}`);
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-accommodation-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        destination: destination,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        adults: 1,
        travelStyle: travelStyle
      })
    });

    if (!response.ok) {
      throw new Error(`Accommodation search failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Accommodation search returned error');
    }
    
    console.log(`✅ Hospedagem encontrada para ${destination}: R$ ${data.totalPrice} (${data.hotelDetails?.name})`);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar hospedagem para ${destination} (tentativa ${retryCount + 1}):`, error.message);
    
    // Retry até 2 vezes com delay
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Delay crescente
      return searchAccommodation(destination, travelStyle, retryCount + 1);
    }
    
    return null;
  }
};

// Função para determinar estilo de viagem baseado no orçamento
const getTravelStyle = (budget: number): string => {
  if (budget <= 4000) return 'Econômica';
  if (budget <= 8000) return 'Conforto';
  return 'Luxo';
};

// Função para gerar hospedagem estimada baseada no destino e estilo
const createEstimatedAccommodation = (destination: DestinationOption, travelStyle: string, flightCost: number) => {
  // Aplicar multiplicadores baseado no estilo de viagem
  let accommodationMultiplier = 1;
  
  switch (travelStyle.toLowerCase()) {
    case 'econômica':
      accommodationMultiplier = 0.7;
      break;
    case 'conforto':
      accommodationMultiplier = 1;
      break;
    case 'luxo':
      accommodationMultiplier = 1.5;
      break;
  }
  
  const estimatedAccommodationCost = Math.round(destination.estimatedAccommodationCost * accommodationMultiplier);
  
  // Gerar nome de hotel estimado baseado no destino
  const getEstimatedHotel = (destName: string, style: string) => {
    const baseNames = ['Hotel', 'Resort', 'Pousada', 'Inn'];
    const styleSuffixes = {
      'Econômica': ['Express', 'Budget', 'Smart'],
      'Conforto': ['Comfort', 'Plaza', 'Central'],
      'Luxo': ['Grand', 'Premium', 'Luxury', 'Palace']
    };
    
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
    const suffix = styleSuffixes[style][Math.floor(Math.random() * styleSuffixes[style].length)];
    return `${baseName} ${suffix} ${destName}`;
  };
  
  return {
    totalPrice: estimatedAccommodationCost,
    hotelDetails: {
      name: getEstimatedHotel(destination.name, travelStyle),
      location: destination.name,
      description: `Hotel categoria ${travelStyle.toLowerCase()} no centro de ${destination.name}`,
      rating: travelStyle === 'Luxo' ? '5' : travelStyle === 'Conforto' ? '4' : '3',
      roomType: travelStyle === 'Luxo' ? 'Suíte Executiva' : 'Quarto Padrão'
    },
    quotationDate: new Date().toISOString(),
    isEstimate: true
  };
};

// Função para criar resposta híbrida (voo real + hospedagem estimada)
const createHybridSuggestion = (destination: DestinationOption, flightData: any, travelStyle: string, budget: number) => {
  console.log(`🔄 Criando sugestão híbrida para ${destination.name}: voo real + hospedagem estimada`);
  
  const accommodationData = createEstimatedAccommodation(destination, travelStyle, flightData.pricePerPerson);
  const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
  const totalAccommodationCost = accommodationData.totalPrice;
  const totalTravelCost = totalFlightCost + totalAccommodationCost;
  const remainingBudget = budget - totalTravelCost;
  
  return {
    destination: destination,
    flightCost: totalFlightCost,
    accommodationCost: totalAccommodationCost,
    totalTravelCost: totalTravelCost,
    remainingBudget: remainingBudget,
    currency: flightData.currency || 'BRL',
    travelStyle: travelStyle,
    hotelDetails: accommodationData.hotelDetails,
    flightDetails: {
      airlineCode: flightData.airlineCode,
      airlineName: flightData.airlineName,
      quotationDate: flightData.quotationDate
    },
    accommodationQuotationDate: accommodationData.quotationDate,
    success: true,
    isRealData: false, // Parcialmente real
    isEstimate: true,
    estimationReason: 'Voos com preços reais da API, hospedagem estimada (API indisponível)',
    hasRealFlightData: true, // Novo campo para indicar que tem dados reais de voo
    hasRealAccommodationData: false
  };
};

// Função para criar fallback com dados estimados mais realistas
const createEstimatedSuggestion = (destination: DestinationOption, budget: number, travelStyle: string) => {
  // Aplicar multiplicadores baseado no estilo de viagem
  let flightMultiplier = 1;
  let accommodationMultiplier = 1;
  
  switch (travelStyle.toLowerCase()) {
    case 'econômica':
      flightMultiplier = 0.8;
      accommodationMultiplier = 0.7;
      break;
    case 'conforto':
      flightMultiplier = 1;
      accommodationMultiplier = 1;
      break;
    case 'luxo':
      flightMultiplier = 1.3;
      accommodationMultiplier = 1.5;
      break;
  }
  
  const estimatedFlightCost = Math.round(destination.estimatedFlightCost * flightMultiplier);
  const estimatedAccommodationCost = Math.round(destination.estimatedAccommodationCost * accommodationMultiplier);
  const totalEstimated = estimatedFlightCost + estimatedAccommodationCost;
  
  // Encontrar companhia aérea comum para o destino
  const getEstimatedAirline = (destName: string, country: string) => {
    if (country === 'Brasil') return 'GOL Linhas Aéreas';
    if (['Argentina', 'Chile', 'Peru', 'Uruguai'].includes(country)) return 'LATAM Airlines';
    if (['Portugal', 'Espanha'].includes(country)) return 'TAP Air Portugal';
    if (['França', 'Reino Unido', 'Alemanha'].includes(country)) return 'Air France';
    if (country === 'Estados Unidos') return 'American Airlines';
    if (country === 'Tailândia') return 'Thai Airways';
    if (country === 'Japão') return 'Japan Airlines';
    if (country === 'Austrália') return 'Qantas';
    return 'Companhia Aérea Internacional';
  };
  
  // Gerar nome de hotel estimado baseado no destino
  const getEstimatedHotel = (destName: string, style: string) => {
    const baseNames = ['Hotel', 'Resort', 'Pousada', 'Inn'];
    const styleSuffixes = {
      'Econômica': ['Express', 'Budget', 'Smart'],
      'Conforto': ['Comfort', 'Plaza', 'Central'],
      'Luxo': ['Grand', 'Premium', 'Luxury', 'Palace']
    };
    
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
    const suffix = styleSuffixes[style][Math.floor(Math.random() * styleSuffixes[style].length)];
    return `${baseName} ${suffix} ${destName}`;
  };
  
  return {
    destination: destination,
    flightCost: estimatedFlightCost,
    accommodationCost: estimatedAccommodationCost,
    totalTravelCost: totalEstimated,
    remainingBudget: budget - totalEstimated,
    currency: 'BRL',
    travelStyle: travelStyle,
    hotelDetails: {
      name: getEstimatedHotel(destination.name, travelStyle),
      location: destination.name,
      description: `Hotel categoria ${travelStyle.toLowerCase()} no centro de ${destination.name}`,
      rating: travelStyle === 'Luxo' ? '5' : travelStyle === 'Conforto' ? '4' : '3',
      roomType: travelStyle === 'Luxo' ? 'Suíte Executiva' : 'Quarto Padrão'
    },
    flightDetails: {
      airlineName: getEstimatedAirline(destination.name, destination.country),
      airlineCode: 'EST',
      quotationDate: new Date().toISOString()
    },
    accommodationQuotationDate: new Date().toISOString(),
    success: true,
    isEstimate: true,
    isRealData: false,
    estimationReason: 'APIs indisponíveis - usando estimativas baseadas em dados históricos'
  };
};

// Função principal para sugerir destino
const suggestDestination = async (budget: number) => {
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
  
  let bestRealDataOption = null;
  let bestHybridOption = null;
  
  // Tentar até 5 destinos para aumentar chances de sucesso
  for (let i = 0; i < Math.min(5, suitableDestinations.length); i++) {
    const destination = suitableDestinations[i];
    console.log(`🔍 Testando destino ${i + 1}/${Math.min(5, suitableDestinations.length)}: ${destination.name}`);
    
    // Buscar voos e hospedagem em paralelo
    const [flightData, accommodationData] = await Promise.all([
      searchFlights(destination.name, budget),
      searchAccommodation(destination.name, travelStyle)
    ]);

    // Prioridade 1: Se conseguiu dados reais para ambos
    if (flightData && accommodationData) {
      const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
      const totalAccommodationCost = accommodationData.totalPrice;
      const totalTravelCost = totalFlightCost + totalAccommodationCost;
      const remainingBudget = budget - totalTravelCost;
      
      console.log(`💰 Custos REAIS para ${destination.name}: Voo R$ ${totalFlightCost}, Hospedagem R$ ${totalAccommodationCost}, Total R$ ${totalTravelCost}`);
      
      // Verificar se cabe no orçamento (deixando pelo menos R$ 500 para alimentação/atividades)
      if (totalTravelCost <= budget - 500) {
        console.log(`✅ ${destination.name} selecionado com dados COMPLETAMENTE REAIS!`);
        
        return {
          destination: destination,
          flightCost: totalFlightCost,
          accommodationCost: totalAccommodationCost,
          totalTravelCost: totalTravelCost,
          remainingBudget: remainingBudget,
          currency: flightData.currency || 'BRL',
          travelStyle: travelStyle,
          hotelDetails: accommodationData.hotelDetails,
          flightDetails: {
            airlineCode: flightData.airlineCode,
            airlineName: flightData.airlineName,
            quotationDate: flightData.quotationDate
          },
          accommodationQuotationDate: accommodationData.quotationDate,
          success: true,
          isRealData: true,
          isEstimate: false,
          hasRealFlightData: true,
          hasRealAccommodationData: true
        };
      } else {
        console.log(`❌ ${destination.name} excede orçamento: R$ ${totalTravelCost} > R$ ${budget - 500}`);
      }
    } 
    // Prioridade 2: Se tem voo real mas hospedagem falhou, criar opção híbrida
    else if (flightData && !accommodationData) {
      console.log(`🔄 ${destination.name}: voo real encontrado, hospedagem será estimada`);
      
      const hybridSuggestion = createHybridSuggestion(destination, flightData, travelStyle, budget);
      
      // Verificar se cabe no orçamento
      if (hybridSuggestion.totalTravelCost <= budget - 500) {
        console.log(`🎯 Opção híbrida válida para ${destination.name}: R$ ${hybridSuggestion.totalTravelCost}`);
        
        // Salvar a melhor opção híbrida (menor custo real de voo)
        if (!bestHybridOption || flightData.pricePerPerson < bestHybridOption.flightCost) {
          bestHybridOption = hybridSuggestion;
          console.log(`🏆 Nova melhor opção híbrida: ${destination.name} (voo R$ ${flightData.pricePerPerson})`);
        }
      } else {
        console.log(`❌ Opção híbrida para ${destination.name} excede orçamento: R$ ${hybridSuggestion.totalTravelCost}`);
      }
    } else {
      console.log(`⚠️ Dados incompletos para ${destination.name}: voo=${!!flightData}, hospedagem=${!!accommodationData}`);
    }
  }
  
  // Se encontrou opção híbrida (voo real + hospedagem estimada), usar ela
  if (bestHybridOption) {
    console.log(`🎉 Retornando melhor opção híbrida: ${bestHybridOption.destination.name}`);
    return bestHybridOption;
  }
  
  // Se nenhum destino com dados reais funcionou, usar estimativa do melhor destino possível
  const fallbackDestination = suitableDestinations[0];
  console.log(`📊 Usando estimativa completa para: ${fallbackDestination.name}`);
  
  return createEstimatedSuggestion(fallbackDestination, budget, travelStyle);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { budget }: DestinationSuggestionRequest = await req.json();

    console.log('📥 Parâmetros recebidos:', { budget });

    // Validar orçamento
    if (!budget || budget < 1000) {
      throw new Error('Orçamento mínimo deve ser R$ 1.000');
    }

    if (budget > 50000) {
      throw new Error('Orçamento máximo suportado é R$ 50.000');
    }

    // Sugerir destino
    const suggestion = await suggestDestination(budget);

    console.log('🎉 Sugestão gerada com sucesso:', {
      destino: suggestion.destination.name,
      isRealData: suggestion.isRealData,
      hasRealFlightData: suggestion.hasRealFlightData,
      hasRealAccommodationData: suggestion.hasRealAccommodationData,
      totalCost: suggestion.totalTravelCost
    });

    return new Response(
      JSON.stringify(suggestion),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro na sugestão de destino:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
