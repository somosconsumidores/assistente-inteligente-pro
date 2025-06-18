import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FlightOffer {
  price: {
    total: string;
    currency: string;
  };
  validatingAirlineCodes?: string[];
  itineraries?: Array<{
    segments?: Array<{
      carrierCode?: string;
      operating?: {
        carrierCode?: string;
      };
    }>;
  }>;
}

interface AmadeusFlightResponse {
  data: FlightOffer[];
}

// Função para obter token de acesso da Amadeus
const getAmadeusToken = async (): Promise<string> => {
  const clientId = Deno.env.get('AMADEUS_API_KEY');
  const clientSecret = Deno.env.get('AMADEUS_API_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    console.error('Erro ao obter token Amadeus:', response.status, response.statusText);
    throw new Error('Failed to get Amadeus access token');
  }

  const data: AmadeusTokenResponse = await response.json();
  return data.access_token;
};

// Função para mapear códigos IATA em nomes de companhias aéreas
const getAirlineName = (code: string): string => {
  const airlineMap: Record<string, string> = {
    // Companhias Brasileiras
    'LA': 'LATAM Airlines',
    'G3': 'GOL Linhas Aéreas',
    'AD': 'Azul Linhas Aéreas',
    'JJ': 'TAM Linhas Aéreas',
    
    // Companhias Internacionais
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
    'BA': 'British Airways',
    'IB': 'Iberia',
    'TP': 'TAP Air Portugal',
    'LX': 'Swiss International Air Lines',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'AZ': 'ITA Airways',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'AC': 'Air Canada',
    'AR': 'Aerolíneas Argentinas',
    'JL': 'Japan Airlines',
    'NH': 'ANA',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'QF': 'Qantas',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'TK': 'Turkish Airlines',
  };

  return airlineMap[code] || `${code} Airlines`;
};

// Função para extrair código da companhia aérea do voo
const extractAirlineCode = (offer: FlightOffer): string => {
  // Primeiro tenta validatingAirlineCodes
  if (offer.validatingAirlineCodes && offer.validatingAirlineCodes.length > 0) {
    return offer.validatingAirlineCodes[0];
  }
  
  // Se não encontrar, tenta nos segmentos
  if (offer.itineraries && offer.itineraries.length > 0) {
    const firstItinerary = offer.itineraries[0];
    if (firstItinerary.segments && firstItinerary.segments.length > 0) {
      const firstSegment = firstItinerary.segments[0];
      return firstSegment.operating?.carrierCode || firstSegment.carrierCode || 'XX';
    }
  }
  
  return 'XX'; // Código padrão se não encontrar
};

// Função para mapear destinos para códigos IATA
const getIATACode = (destination: string): string => {
  const destinationMap: Record<string, string> = {
    // Europa
    'alemanha': 'FRA', // Frankfurt
    'frança': 'CDG', // Paris
    'espanha': 'MAD', // Madrid
    'itália': 'FCO', // Roma
    'reino unido': 'LHR', // Londres
    'portugal': 'LIS', // Lisboa
    'holanda': 'AMS', // Amsterdam
    'berlim': 'BER',
    'munique': 'MUC',
    'paris': 'CDG',
    'londres': 'LHR',
    'roma': 'FCO',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'amsterdam': 'AMS',
    'lisboa': 'LIS',
    
    // América do Norte
    'estados unidos': 'JFK', // Nova York
    'eua': 'JFK',
    'new york': 'JFK',
    'nova york': 'JFK',
    'miami': 'MIA',
    'los angeles': 'LAX',
    'canadá': 'YYZ', // Toronto
    'toronto': 'YYZ',
    
    // Ásia
    'japão': 'NRT', // Tóquio
    'tóquio': 'NRT',
    'china': 'PEK', // Pequim
    'pequim': 'PEK',
    'coreia do sul': 'ICN', // Seul
    'seul': 'ICN',
    'tailândia': 'BKK', // Bangkok
    'bangkok': 'BKK',
    'singapura': 'SIN',
    
    // Oceania
    'austrália': 'SYD', // Sydney
    'sydney': 'SYD',
    'nova zelândia': 'AKL', // Auckland
    
    // América do Sul
    'argentina': 'EZE', // Buenos Aires
    'buenos aires': 'EZE',
    'chile': 'SCL', // Santiago
    'santiago': 'SCL',
    'peru': 'LIM', // Lima
    'colômbia': 'BOG', // Bogotá
    'uruguai': 'MVD', // Montevidéu
  };

  const normalizedDestination = destination.toLowerCase().trim();
  return destinationMap[normalizedDestination] || 'FRA'; // Default para Frankfurt
};

// Função para buscar voos na Amadeus
const searchFlights = async (params: FlightSearchParams): Promise<{ 
  pricePerPerson: number; 
  currency: string; 
  source: string;
  airlineCode?: string;
  airlineName?: string;
  quotationDate: string;
}> => {
  console.log('Buscando voos para:', params);
  
  try {
    const token = await getAmadeusToken();
    console.log('Token Amadeus obtido com sucesso');
    
    const destinationCode = getIATACode(params.destination);
    const originCode = 'GRU'; // São Paulo como origem padrão
    
    console.log(`Buscando voos: ${originCode} -> ${destinationCode}`);
    
    const searchUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
    const searchParams = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers.toString(),
      currencyCode: 'BRL'
    });

    const response = await fetch(`${searchUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Erro na busca de voos:', response.status, response.statusText);
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data: AmadeusFlightResponse = await response.json();
    console.log(`Encontrados ${data.data?.length || 0} voos`);
    
    if (!data.data || data.data.length === 0) {
      throw new Error('Nenhum voo encontrado para as datas especificadas');
    }

    // Encontrar o voo com menor preço
    const cheapestOffer = data.data.reduce((prev, current) => 
      parseFloat(current.price.total) < parseFloat(prev.price.total) ? current : prev
    );
    
    const minPrice = parseFloat(cheapestOffer.price.total);
    const airlineCode = extractAirlineCode(cheapestOffer);
    const airlineName = getAirlineName(airlineCode);
    
    console.log(`Menor preço encontrado: ${minPrice} ${cheapestOffer.price.currency}, Companhia: ${airlineName}`);
    
    return {
      pricePerPerson: minPrice,
      currency: cheapestOffer.price.currency,
      source: 'amadeus_api',
      airlineCode,
      airlineName,
      quotationDate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, passengers }: FlightSearchParams = await req.json();

    console.log('Parâmetros de busca recebidos:', { origin, destination, departureDate, returnDate, passengers });

    // Validar datas
    const depDate = new Date(departureDate);
    const retDate = new Date(returnDate);
    const today = new Date();
    
    if (depDate < today) {
      throw new Error('Data de partida não pode ser no passado');
    }
    
    if (retDate <= depDate) {
      throw new Error('Data de volta deve ser posterior à data de partida');
    }

    // Buscar preços de voos
    const flightData = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers
    });

    return new Response(
      JSON.stringify({
        success: true,
        pricePerPerson: flightData.pricePerPerson,
        totalPrice: flightData.pricePerPerson * passengers,
        currency: flightData.currency,
        source: flightData.source,
        airlineCode: flightData.airlineCode,
        airlineName: flightData.airlineName,
        quotationDate: flightData.quotationDate,
        searchParams: { origin, destination, departureDate, returnDate, passengers }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na busca de voos:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        source: 'error'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
