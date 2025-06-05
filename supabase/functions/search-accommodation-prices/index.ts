
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccommodationSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  travelStyle: string;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface HotelOffer {
  hotel: {
    name: string;
  };
  offers: Array<{
    price: {
      total: string;
      currency: string;
    };
    room: {
      type: string;
    };
  }>;
}

interface AmadeusHotelResponse {
  data: HotelOffer[];
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

// Função para mapear destinos para códigos de cidade
const getCityCode = (destination: string): string => {
  const destinationMap: Record<string, string> = {
    // Europa
    'alemanha': 'BER', // Berlim
    'frança': 'PAR', // Paris
    'espanha': 'MAD', // Madrid
    'itália': 'ROM', // Roma
    'reino unido': 'LON', // Londres
    'portugal': 'LIS', // Lisboa
    'holanda': 'AMS', // Amsterdam
    'berlim': 'BER',
    'paris': 'PAR',
    'londres': 'LON',
    'roma': 'ROM',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'amsterdam': 'AMS',
    'lisboa': 'LIS',
    
    // América do Norte
    'estados unidos': 'NYC', // Nova York
    'eua': 'NYC',
    'new york': 'NYC',
    'nova york': 'NYC',
    'miami': 'MIA',
    'los angeles': 'LAX',
    'canadá': 'YTO', // Toronto
    'toronto': 'YTO',
    
    // Ásia
    'japão': 'TYO', // Tóquio
    'tóquio': 'TYO',
    'china': 'BJS', // Pequim
    'pequim': 'BJS',
    'coreia do sul': 'SEL', // Seul
    'seul': 'SEL',
    'tailândia': 'BKK', // Bangkok
    'bangkok': 'BKK',
    'singapura': 'SIN',
    
    // Oceania
    'austrália': 'SYD', // Sydney
    'sydney': 'SYD',
    'nova zelândia': 'AKL', // Auckland
    
    // América do Sul
    'argentina': 'BUE', // Buenos Aires
    'buenos aires': 'BUE',
    'chile': 'SCL', // Santiago
    'santiago': 'SCL',
    'peru': 'LIM', // Lima
    'colômbia': 'BOG', // Bogotá
    'uruguai': 'MVD', // Montevidéu
  };

  const normalizedDestination = destination.toLowerCase().trim();
  return destinationMap[normalizedDestination] || 'PAR'; // Default para Paris
};

// Função para determinar categorias de hotel baseado no estilo de viagem
const getHotelCategories = (travelStyle: string): string[] => {
  switch (travelStyle.toLowerCase()) {
    case 'econômica':
    case 'economica':
      return ['1', '2']; // 1-2 estrelas
    case 'conforto':
      return ['3', '4']; // 3-4 estrelas
    case 'luxo':
      return ['5']; // 5 estrelas
    case 'aventura':
      return ['1', '2', '3']; // 1-3 estrelas
    default:
      return ['2', '3', '4']; // Padrão
  }
};

// Função para buscar hotéis na Amadeus
const searchHotels = async (params: AccommodationSearchParams): Promise<{
  pricePerDay: number;
  totalPrice: number;
  source: string;
  currency: string;
} | null> => {
  console.log('Buscando hotéis para:', params);
  
  try {
    const token = await getAmadeusToken();
    console.log('Token Amadeus obtido com sucesso');
    
    const cityCode = getCityCode(params.destination);
    const categories = getHotelCategories(params.travelStyle);
    
    console.log(`Buscando hotéis em: ${cityCode}, categorias: ${categories.join(',')}`);
    
    // Primeiro, buscar hotéis na cidade
    const hotelsUrl = 'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city';
    const hotelsParams = new URLSearchParams({
      cityCode: cityCode,
      radius: '20',
      radiusUnit: 'KM',
      hotelSource: 'ALL'
    });

    const hotelsResponse = await fetch(`${hotelsUrl}?${hotelsParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!hotelsResponse.ok) {
      console.error('Erro na busca de hotéis:', hotelsResponse.status, hotelsResponse.statusText);
      throw new Error(`Amadeus Hotels API error: ${hotelsResponse.status}`);
    }

    const hotelsData = await hotelsResponse.json();
    console.log(`Encontrados ${hotelsData.data?.length || 0} hotéis`);
    
    if (!hotelsData.data || hotelsData.data.length === 0) {
      throw new Error('Nenhum hotel encontrado na cidade especificada');
    }

    // Pegar alguns hotéis para buscar ofertas
    const hotelIds = hotelsData.data.slice(0, 10).map((hotel: any) => hotel.hotelId);
    
    // Buscar ofertas de hotéis
    const offersUrl = 'https://test.api.amadeus.com/v3/shopping/hotel-offers';
    const offersParams = new URLSearchParams({
      hotelIds: hotelIds.join(','),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults.toString(),
      currencyCode: 'BRL'
    });

    const offersResponse = await fetch(`${offersUrl}?${offersParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!offersResponse.ok) {
      console.error('Erro na busca de ofertas:', offersResponse.status, offersResponse.statusText);
      throw new Error(`Amadeus Offers API error: ${offersResponse.status}`);
    }

    const offersData: AmadeusHotelResponse = await offersResponse.json();
    console.log(`Encontradas ${offersData.data?.length || 0} ofertas de hotéis`);
    
    if (!offersData.data || offersData.data.length === 0) {
      throw new Error('Nenhuma oferta de hotel encontrada para as datas especificadas');
    }

    // Calcular o número de noites
    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Extrair preços e calcular média
    const prices: number[] = [];
    offersData.data.forEach(hotel => {
      hotel.offers.forEach(offer => {
        const totalPrice = parseFloat(offer.price.total);
        if (!isNaN(totalPrice)) {
          prices.push(totalPrice);
        }
      });
    });

    if (prices.length === 0) {
      throw new Error('Nenhum preço válido encontrado');
    }

    // Calcular estatísticas baseado no estilo de viagem
    prices.sort((a, b) => a - b);
    let selectedPrice: number;

    switch (params.travelStyle.toLowerCase()) {
      case 'econômica':
      case 'economica':
        // 25% mais baratos
        selectedPrice = prices[Math.floor(prices.length * 0.25)];
        break;
      case 'luxo':
        // 25% mais caros
        selectedPrice = prices[Math.floor(prices.length * 0.75)];
        break;
      default:
        // Mediana
        selectedPrice = prices[Math.floor(prices.length * 0.5)];
    }

    const pricePerDay = Math.round(selectedPrice / nights);
    
    console.log(`Preço selecionado: R$ ${selectedPrice} total, R$ ${pricePerDay} por dia para ${nights} noites`);
    
    return {
      pricePerDay: pricePerDay,
      totalPrice: selectedPrice,
      source: 'amadeus_api',
      currency: 'BRL'
    };
    
  } catch (error) {
    console.error('Erro ao buscar hotéis na Amadeus:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { destination, checkInDate, checkOutDate, adults, travelStyle }: AccommodationSearchParams = await req.json();

    console.log('Parâmetros de busca de hospedagem recebidos:', { destination, checkInDate, checkOutDate, adults, travelStyle });

    // Validar datas
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    
    if (checkIn < today) {
      throw new Error('Data de check-in não pode ser no passado');
    }
    
    if (checkOut <= checkIn) {
      throw new Error('Data de check-out deve ser posterior à data de check-in');
    }

    // Buscar preços de hospedagem
    const accommodationData = await searchHotels({
      destination,
      checkInDate,
      checkOutDate,
      adults,
      travelStyle
    });

    return new Response(
      JSON.stringify({
        success: true,
        pricePerDay: accommodationData.pricePerDay,
        totalPrice: accommodationData.totalPrice,
        currency: accommodationData.currency,
        source: accommodationData.source,
        searchParams: { destination, checkInDate, checkOutDate, adults, travelStyle }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na busca de hospedagem:', error);
    
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
