
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

// Função para determinar estilo de viagem baseado no orçamento
const getTravelStyle = (budget: number): string => {
  if (budget <= 4000) return 'Econômica';
  if (budget <= 8000) return 'Conforto';
  return 'Luxo';
};

// Função para gerar detalhes de hospedagem estimados mais realistas
const generateAccommodationDetails = (destination: DestinationOption, travelStyle: string) => {
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
  
  // Gerar nomes de hotéis mais realistas baseados no destino e estilo
  const getRealisticHotelName = (destName: string, country: string, style: string) => {
    const hotelChains = {
      'Econômica': ['Ibis', 'Sleep Inn', 'Comfort Inn', 'B&B Hotels', 'Go Inn'],
      'Conforto': ['Novotel', 'Mercure', 'Holiday Inn', 'Radisson', 'Best Western'],
      'Luxo': ['Sofitel', 'Marriott', 'Hilton', 'InterContinental', 'Grand Hyatt']
    };
    
    const chains = hotelChains[style] || hotelChains['Conforto'];
    const selectedChain = chains[Math.floor(Math.random() * chains.length)];
    
    // Adicionar sufixos baseados na localização
    const locationSuffixes = {
      'Brasil': ['Centro', 'Copacabana', 'Ipanema', 'Centro Histórico'],
      'Argentina': ['Puerto Madero', 'Palermo', 'Recoleta', 'Centro'],
      'Chile': ['Las Condes', 'Providencia', 'Centro', 'Vitacura'],
      'Portugal': ['Centro', 'Chiado', 'Avenidas Novas', 'Príncipe Real'],
      'Espanha': ['Gran Vía', 'Sol', 'Salamanca', 'Centro'],
      'Estados Unidos': ['Downtown', 'Beach', 'Airport', 'Center'],
      'França': ['Champs-Élysées', 'Opéra', 'Marais', 'Louvre'],
      'Reino Unido': ['Covent Garden', 'Westminster', 'Kensington', 'City'],
      'Japão': ['Shibuya', 'Shinjuku', 'Ginza', 'Asakusa'],
      'Tailândia': ['Sukhumvit', 'Silom', 'Siam', 'Riverside']
    };
    
    const suffixes = locationSuffixes[country] || ['Centro'];
    const selectedSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${selectedChain} ${destName} ${selectedSuffix}`;
  };
  
  // Determinar rating baseado no estilo
  const getRating = (style: string) => {
    switch (style.toLowerCase()) {
      case 'econômica': return '3';
      case 'conforto': return '4';
      case 'luxo': return '5';
      default: return '4';
    }
  };
  
  return {
    cost: estimatedAccommodationCost,
    details: {
      name: getRealisticHotelName(destination.name, destination.country, travelStyle),
      location: `Centro de ${destination.name}`,
      description: `Hotel categoria ${travelStyle.toLowerCase()} no coração de ${destination.name}`,
      rating: getRating(travelStyle),
      roomType: 'Acomodação Standard', // Sempre Standard conforme solicitado
      amenities: travelStyle === 'Luxo' 
        ? ['Wi-Fi gratuito', 'Café da manhã', 'Academia', 'Spa', 'Concierge']
        : travelStyle === 'Conforto'
        ? ['Wi-Fi gratuito', 'Café da manhã', 'Academia', 'Centro de negócios']
        : ['Wi-Fi gratuito', 'Recepção 24h'],
      address: `Centro de ${destination.name}, ${destination.country}`
    }
  };
};

// Função para criar sugestão com dados mistos (voos reais + hospedagem estimada)
const createMixedDataSuggestion = (destination: DestinationOption, budget: number, travelStyle: string, flightData: any) => {
  const accommodationData = generateAccommodationDetails(destination, travelStyle);
  
  const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
  const totalAccommodationCost = accommodationData.cost;
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
    hotelDetails: accommodationData.details,
    flightDetails: {
      airlineCode: flightData.airlineCode,
      airlineName: flightData.airlineName,
      quotationDate: flightData.quotationDate
    },
    accommodationQuotationDate: new Date().toISOString(),
    success: true,
    isEstimate: false, // Voos são reais
    isRealData: true, // Voos são reais
    estimationReason: 'Hospedagem baseada em dados históricos - voos com preços reais'
  };
};

// Função para criar fallback com dados completamente estimados
const createEstimatedSuggestion = (destination: DestinationOption, budget: number, travelStyle: string) => {
  // Aplicar multiplicadores baseado no estilo de viagem para voos também
  let flightMultiplier = 1;
  
  switch (travelStyle.toLowerCase()) {
    case 'econômica':
      flightMultiplier = 0.8;
      break;
    case 'conforto':
      flightMultiplier = 1;
      break;
    case 'luxo':
      flightMultiplier = 1.3;
      break;
  }
  
  const estimatedFlightCost = Math.round(destination.estimatedFlightCost * flightMultiplier);
  const accommodationData = generateAccommodationDetails(destination, travelStyle);
  const totalEstimated = estimatedFlightCost + accommodationData.cost;
  
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
  
  return {
    destination: destination,
    flightCost: estimatedFlightCost,
    accommodationCost: accommodationData.cost,
    totalTravelCost: totalEstimated,
    remainingBudget: budget - totalEstimated,
    currency: 'BRL',
    travelStyle: travelStyle,
    hotelDetails: accommodationData.details,
    flightDetails: {
      airlineName: getEstimatedAirline(destination.name, destination.country),
      airlineCode: 'EST',
      quotationDate: new Date().toISOString()
    },
    accommodationQuotationDate: new Date().toISOString(),
    success: true,
    isEstimate: true,
    isRealData: false,
    estimationReason: 'Estimativas baseadas em dados históricos - APIs indisponíveis'
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
  
  // Tentar até 3 destinos para buscar dados reais de voo
  for (let i = 0; i < Math.min(3, suitableDestinations.length); i++) {
    const destination = suitableDestinations[i];
    console.log(`🔍 Testando destino ${i + 1}/${Math.min(3, suitableDestinations.length)}: ${destination.name}`);
    
    // Buscar apenas dados de voo (hospedagem sempre estimada)
    const flightData = await searchFlights(destination.name, budget);

    // Se conseguiu dados reais de voo, usar dados mistos
    if (flightData) {
      const accommodationData = generateAccommodationDetails(destination, travelStyle);
      const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
      const totalTravelCost = totalFlightCost + accommodationData.cost;
      
      console.log(`💰 Custos MISTOS para ${destination.name}: Voo REAL R$ ${totalFlightCost}, Hospedagem ESTIMADA R$ ${accommodationData.cost}, Total R$ ${totalTravelCost}`);
      
      // Verificar se cabe no orçamento (deixando pelo menos R$ 500 para alimentação/atividades)
      if (totalTravelCost <= budget - 500) {
        console.log(`✅ ${destination.name} selecionado com dados MISTOS (voo real + hospedagem estimada)!`);
        
        return createMixedDataSuggestion(destination, budget, travelStyle, flightData);
      } else {
        console.log(`❌ ${destination.name} excede orçamento: R$ ${totalTravelCost} > R$ ${budget - 500}`);
      }
    } else {
      console.log(`⚠️ Sem dados de voo para ${destination.name}, tentando próximo destino`);
    }
  }
  
  // Se nenhum destino com voos reais funcionou, usar estimativa completa do melhor destino possível
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
      totalCost: suggestion.totalTravelCost,
      flightSource: suggestion.isRealData ? 'API_REAL' : 'ESTIMATIVA',
      accommodationSource: 'ESTIMATIVA_HISTORICA'
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
