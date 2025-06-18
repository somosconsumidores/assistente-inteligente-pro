
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
}

const destinations: DestinationOption[] = [
  // Destinos Nacionais (até R$ 3.000)
  { name: 'Foz do Iguaçu', country: 'Brasil', category: 'nacional', minBudget: 1500, description: 'Cataratas mundialmente famosas' },
  { name: 'Salvador', country: 'Brasil', category: 'nacional', minBudget: 1800, description: 'História e cultura afro-brasileira' },
  { name: 'Rio de Janeiro', country: 'Brasil', category: 'nacional', minBudget: 2000, description: 'Cidade Maravilhosa com praias icônicas' },
  { name: 'Florianópolis', country: 'Brasil', category: 'nacional', minBudget: 2200, description: 'Ilha da Magia com praias paradisíacas' },

  // América do Sul (R$ 3.000 - R$ 6.000)
  { name: 'Buenos Aires', country: 'Argentina', category: 'regional', minBudget: 3500, description: 'Capital do tango e da carne' },
  { name: 'Santiago', country: 'Chile', category: 'regional', minBudget: 4000, description: 'Cordilheira dos Andes e vinhos' },
  { name: 'Lima', country: 'Peru', category: 'regional', minBudget: 3800, description: 'Gastronomia mundial e história inca' },
  { name: 'Montevidéu', country: 'Uruguai', category: 'regional', minBudget: 3200, description: 'Charme europeu na América do Sul' },

  // Internacional (R$ 6.000 - R$ 10.000)
  { name: 'Lisboa', country: 'Portugal', category: 'internacional', minBudget: 7000, description: 'História, fado e pastéis de nata' },
  { name: 'Madrid', country: 'Espanha', category: 'internacional', minBudget: 7500, description: 'Arte, cultura e vida noturna' },
  { name: 'Miami', country: 'Estados Unidos', category: 'internacional', minBudget: 8000, description: 'Praias, compras e vida cosmopolita' },
  { name: 'Bangkok', country: 'Tailândia', category: 'internacional', minBudget: 6500, description: 'Templos dourados e street food' },

  // Premium (acima de R$ 10.000)
  { name: 'Paris', country: 'França', category: 'premium', minBudget: 12000, description: 'Cidade Luz e capital do romance' },
  { name: 'Tóquio', country: 'Japão', category: 'premium', minBudget: 13000, description: 'Tradição e modernidade em harmonia' },
  { name: 'Londres', country: 'Reino Unido', category: 'premium', minBudget: 11000, description: 'História real e cultura britânica' },
  { name: 'Sydney', country: 'Austrália', category: 'premium', minBudget: 15000, description: 'Opera House e praias espetaculares' },
];

// Função para chamar API de busca de voos
const searchFlights = async (destination: string, budget: number) => {
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 30); // 30 dias no futuro
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 7); // 7 dias de viagem

  try {
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
      throw new Error(`Flight search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Erro ao buscar voos:', error);
    return null;
  }
};

// Função para chamar API de busca de hospedagem
const searchAccommodation = async (destination: string, travelStyle: string) => {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 30);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 7);

  try {
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
      throw new Error(`Accommodation search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Erro ao buscar hospedagem:', error);
    return null;
  }
};

// Função para determinar estilo de viagem baseado no orçamento
const getTravelStyle = (budget: number): string => {
  if (budget <= 4000) return 'Econômica';
  if (budget <= 8000) return 'Conforto';
  return 'Luxo';
};

// Função para sugerir destino
const suggestDestination = async (budget: number) => {
  console.log(`Buscando destino para orçamento de R$ ${budget}`);
  
  // Filtrar destinos que cabem no orçamento (considerando 70% do orçamento para voo+hospedagem)
  const maxCostForTravel = budget * 0.7;
  const suitableDestinations = destinations.filter(dest => dest.minBudget <= maxCostForTravel);
  
  if (suitableDestinations.length === 0) {
    throw new Error('Orçamento insuficiente para qualquer destino disponível');
  }

  // Ordenar por valor (mais caro primeiro) para pegar o melhor destino possível
  suitableDestinations.sort((a, b) => b.minBudget - a.minBudget);
  
  // Tentar até 3 destinos
  for (let i = 0; i < Math.min(3, suitableDestinations.length); i++) {
    const destination = suitableDestinations[i];
    console.log(`Testando destino: ${destination.name}`);
    
    const travelStyle = getTravelStyle(budget);
    
    // Buscar voos e hospedagem em paralelo
    const [flightData, accommodationData] = await Promise.all([
      searchFlights(destination.name, budget),
      searchAccommodation(destination.name, travelStyle)
    ]);

    if (flightData && accommodationData) {
      const totalFlightCost = flightData.totalPrice || flightData.pricePerPerson;
      const totalAccommodationCost = accommodationData.totalPrice;
      const totalTravelCost = totalFlightCost + totalAccommodationCost;
      const remainingBudget = budget - totalTravelCost;
      
      console.log(`Custos para ${destination.name}: Voo R$ ${totalFlightCost}, Hospedagem R$ ${totalAccommodationCost}, Total R$ ${totalTravelCost}`);
      
      // Verificar se cabe no orçamento (deixando pelo menos R$ 500 para alimentação/atividades)
      if (totalTravelCost <= budget - 500) {
        return {
          destination: destination,
          flightCost: totalFlightCost,
          accommodationCost: totalAccommodationCost,
          totalTravelCost: totalTravelCost,
          remainingBudget: remainingBudget,
          currency: flightData.currency || 'BRL',
          travelStyle: travelStyle,
          success: true
        };
      }
    }
  }
  
  // Se nenhum destino com preços reais funcionou, usar estimativa
  const fallbackDestination = suitableDestinations[Math.floor(Math.random() * suitableDestinations.length)];
  const estimatedFlightCost = fallbackDestination.minBudget * 0.6;
  const estimatedAccommodationCost = fallbackDestination.minBudget * 0.4;
  const totalEstimated = estimatedFlightCost + estimatedAccommodationCost;
  
  return {
    destination: fallbackDestination,
    flightCost: estimatedFlightCost,
    accommodationCost: estimatedAccommodationCost,
    totalTravelCost: totalEstimated,
    remainingBudget: budget - totalEstimated,
    currency: 'BRL',
    travelStyle: getTravelStyle(budget),
    success: true,
    isEstimate: true
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { budget }: DestinationSuggestionRequest = await req.json();

    console.log('Parâmetros recebidos:', { budget });

    // Validar orçamento
    if (!budget || budget < 1000) {
      throw new Error('Orçamento mínimo deve ser R$ 1.000');
    }

    if (budget > 50000) {
      throw new Error('Orçamento máximo suportado é R$ 50.000');
    }

    // Sugerir destino
    const suggestion = await suggestDestination(budget);

    return new Response(
      JSON.stringify(suggestion),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sugestão de destino:', error);
    
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
