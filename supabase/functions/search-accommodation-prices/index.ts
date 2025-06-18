
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
    rating?: string;
    cityCode?: string;
    address?: {
      lines?: string[];
      cityName?: string;
      countryCode?: string;
    };
    contact?: {
      phone?: string;
    };
    description?: {
      text?: string;
    };
    amenities?: string[];
  };
  offers: Array<{
    price: {
      total: string;
      currency: string;
    };
    room: {
      type: string;
      typeEstimated?: {
        category?: string;
        beds?: number;
        bedType?: string;
      };
    };
    ratePlans?: Array<{
      paymentType?: string;
      cancellation?: {
        deadline?: string;
      };
    }>;
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

  // Usando API de produção ao invés de test
  const tokenUrl = 'https://api.amadeus.com/v1/security/oauth2/token';
  
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

// Mapeamento corrigido e expandido de destinos para códigos IATA
const getCityCode = (destination: string): string => {
  const destinationMap: Record<string, string> = {
    // Brasil
    'são paulo': 'SAO',
    'rio de janeiro': 'RIO', 
    'salvador': 'SSA',
    'foz do iguaçu': 'IGU',
    'florianópolis': 'FLN',
    'brasília': 'BSB',
    'recife': 'REC',
    'fortaleza': 'FOR',
    
    // América do Sul
    'buenos aires': 'BUE',
    'santiago': 'SCL',
    'lima': 'LIM', // Corrigido: era PAR
    'montevidéu': 'MVD',
    'bogotá': 'BOG',
    'caracas': 'CCS',
    'quito': 'UIO',
    'la paz': 'LPB',
    
    // Europa
    'lisboa': 'LIS',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'paris': 'PAR',
    'londres': 'LON',
    'roma': 'ROM',
    'milão': 'MIL',
    'berlim': 'BER',
    'munique': 'MUC',
    'amsterdã': 'AMS',
    'amsterdam': 'AMS',
    'zurique': 'ZUR',
    'viena': 'VIE',
    'praga': 'PRG',
    'budapest': 'BUD',
    'varsóvia': 'WAW',
    'estocolmo': 'STO',
    'copenhague': 'CPH',
    'helsinque': 'HEL',
    'oslo': 'OSL',
    'reykjavik': 'REK',
    'dublin': 'DUB',
    'edimburgo': 'EDI',
    'atenas': 'ATH',
    'istambul': 'IST',
    
    // América do Norte
    'nova york': 'NYC',
    'new york': 'NYC',
    'miami': 'MIA',
    'los angeles': 'LAX',
    'las vegas': 'LAS',
    'chicago': 'CHI',
    'toronto': 'YTO',
    'vancouver': 'YVR',
    'montreal': 'YMQ',
    
    // Ásia
    'tóquio': 'TYO',
    'tokyo': 'TYO',
    'pequim': 'BJS',
    'beijing': 'BJS',
    'xangai': 'SHA',
    'shanghai': 'SHA',
    'seul': 'SEL',
    'bangkok': 'BKK',
    'singapura': 'SIN',
    'kuala lumpur': 'KUL',
    'jacarta': 'JKT',
    'manila': 'MNL',
    'hong kong': 'HKG',
    'taipei': 'TPE',
    'mumbai': 'BOM',
    'nova delhi': 'DEL',
    'new delhi': 'DEL',
    'dubai': 'DXB',
    'doha': 'DOH',
    
    // Oceania
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'brisbane': 'BNE',
    'perth': 'PER',
    'auckland': 'AKL',
    'wellington': 'WLG',
    
    // África
    'cidade do cabo': 'CPT',
    'cape town': 'CPT',
    'johannesburgo': 'JNB',
    'johannesburg': 'JNB',
    'cairo': 'CAI',
    'casablanca': 'CAS',
    'nairobi': 'NBO',
    'lagos': 'LOS',
    
    // Países (fallback para capitais)
    'argentina': 'BUE',
    'chile': 'SCL',
    'peru': 'LIM',
    'uruguai': 'MVD',
    'colômbia': 'BOG',
    'venezuela': 'CCS',
    'equador': 'UIO',
    'bolívia': 'LPB',
    'portugal': 'LIS',
    'espanha': 'MAD',
    'frança': 'PAR',
    'itália': 'ROM',
    'alemanha': 'BER',
    'reino unido': 'LON',
    'holanda': 'AMS',
    'suíça': 'ZUR',
    'áustria': 'VIE',
    'república tcheca': 'PRG',
    'hungria': 'BUD',
    'polônia': 'WAW',
    'suécia': 'STO',
    'dinamarca': 'CPH',
    'finlândia': 'HEL',
    'noruega': 'OSL',
    'islândia': 'REK',
    'irlanda': 'DUB',
    'grécia': 'ATH',
    'turquia': 'IST',
    'estados unidos': 'NYC',
    'eua': 'NYC',
    'canadá': 'YTO',
    'japão': 'TYO',
    'china': 'BJS',
    'coreia do sul': 'SEL',
    'tailândia': 'BKK',
    'singapura': 'SIN',
    'malásia': 'KUL',
    'indonésia': 'JKT',
    'filipinas': 'MNL',
    'índia': 'BOM',
    'emirados árabes unidos': 'DXB',
    'catar': 'DOH',
    'austrália': 'SYD',
    'nova zelândia': 'AKL',
    'áfrica do sul': 'CPT',
    'egito': 'CAI',
    'marrocos': 'CAS',
    'quênia': 'NBO',
    'nigéria': 'LOS'
  };

  const normalizedDestination = destination.toLowerCase().trim();
  const cityCode = destinationMap[normalizedDestination];
  
  if (!cityCode) {
    console.warn(`Código IATA não encontrado para: ${destination}. Usando PAR como fallback.`);
    return 'PAR'; // Fallback mais conservador
  }
  
  console.log(`Mapeamento: ${destination} -> ${cityCode}`);
  return cityCode;
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

// Função para validar se um resultado é realista
const validateHotelOffer = (offer: HotelOffer): boolean => {
  const hotelName = offer.hotel.name || '';
  const price = parseFloat(offer.offers[0]?.price?.total || '0');
  
  // Filtrar resultados de teste
  if (hotelName.toLowerCase().includes('test')) {
    console.log(`Hotel de teste filtrado: ${hotelName}`);
    return false;
  }
  
  // Validar faixa de preços realistas (por semana em BRL)
  if (price < 100 || price > 50000) {
    console.log(`Preço fora da faixa realista: R$ ${price}`);
    return false;
  }
  
  // Verificar se tem informações mínimas
  if (!hotelName || hotelName.length < 3) {
    console.log(`Nome de hotel inválido: ${hotelName}`);
    return false;
  }
  
  return true;
};

// Função para buscar hotéis na Amadeus com retry e validação
const searchHotels = async (params: AccommodationSearchParams): Promise<{
  pricePerDay: number;
  totalPrice: number;
  source: string;
  currency: string;
  hotelDetails: {
    name: string;
    rating?: string;
    location?: string;
    description?: string;
    roomType?: string;
    amenities?: string[];
    address?: string;
  };
  quotationDate: string;
} | null> => {
  console.log('Buscando hotéis para:', params);
  
  try {
    const token = await getAmadeusToken();
    console.log('Token Amadeus obtido com sucesso');
    
    const cityCode = getCityCode(params.destination);
    const categories = getHotelCategories(params.travelStyle);
    
    console.log(`Buscando hotéis em: ${cityCode}, categorias: ${categories.join(',')}`);
    
    // Usando API de produção
    const hotelsUrl = 'https://api.amadeus.com/v1/reference-data/locations/hotels/by-city';
    
    // Tentar com diferentes raios se não encontrar hotéis
    const radii = [20, 50, 100];
    let hotelsData = null;
    
    for (const radius of radii) {
      const hotelsParams = new URLSearchParams({
        cityCode: cityCode,
        radius: radius.toString(),
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

      if (hotelsResponse.ok) {
        hotelsData = await hotelsResponse.json();
        console.log(`Encontrados ${hotelsData.data?.length || 0} hotéis com raio de ${radius}km`);
        
        if (hotelsData.data && hotelsData.data.length > 0) {
          break;
        }
      }
    }

    if (!hotelsData?.data || hotelsData.data.length === 0) {
      throw new Error('Nenhum hotel encontrado na cidade especificada');
    }

    // Pegar mais hotéis para ter mais opções
    const hotelIds = hotelsData.data.slice(0, 20).map((hotel: any) => hotel.hotelId);
    
    // Buscar ofertas de hotéis
    const offersUrl = 'https://api.amadeus.com/v3/shopping/hotel-offers';
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

    // Filtrar ofertas válidas
    const validOffers = offersData.data.filter(validateHotelOffer);
    console.log(`${validOffers.length} ofertas válidas após filtros`);
    
    if (validOffers.length === 0) {
      throw new Error('Nenhuma oferta válida encontrada após aplicar filtros');
    }

    // Calcular o número de noites
    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Extrair preços e dados dos hotéis válidos
    const hotelOffers = validOffers.map(hotel => ({
      ...hotel,
      totalPrice: parseFloat(hotel.offers[0]?.price?.total || '0')
    })).filter(hotel => !isNaN(hotel.totalPrice));

    if (hotelOffers.length === 0) {
      throw new Error('Nenhum preço válido encontrado');
    }

    // Ordenar por preço e selecionar baseado no estilo de viagem
    hotelOffers.sort((a, b) => a.totalPrice - b.totalPrice);
    let selectedHotel: typeof hotelOffers[0];

    switch (params.travelStyle.toLowerCase()) {
      case 'econômica':
      case 'economica':
        // 25% mais baratos
        selectedHotel = hotelOffers[Math.min(Math.floor(hotelOffers.length * 0.25), hotelOffers.length - 1)];
        break;
      case 'luxo':
        // 25% mais caros
        selectedHotel = hotelOffers[Math.max(Math.floor(hotelOffers.length * 0.75), 0)];
        break;
      default:
        // Mediana
        selectedHotel = hotelOffers[Math.floor(hotelOffers.length * 0.5)];
    }

    const pricePerDay = Math.round(selectedHotel.totalPrice / nights);
    
    // Construir detalhes do hotel
    const hotelDetails = {
      name: selectedHotel.hotel.name || 'Hotel não especificado',
      rating: selectedHotel.hotel.rating,
      location: selectedHotel.hotel.address?.cityName || params.destination,
      description: selectedHotel.hotel.description?.text,
      roomType: selectedHotel.offers[0]?.room?.type || 'Quarto padrão',
      amenities: selectedHotel.hotel.amenities || [],
      address: selectedHotel.hotel.address?.lines?.join(', ')
    };
    
    console.log(`Hotel selecionado: ${selectedHotel.hotel.name}, Preço: R$ ${selectedHotel.totalPrice} total, R$ ${pricePerDay} por dia para ${nights} noites`);
    
    return {
      pricePerDay: pricePerDay,
      totalPrice: selectedHotel.totalPrice,
      source: 'amadeus_api_prod',
      currency: 'BRL',
      hotelDetails,
      quotationDate: new Date().toISOString()
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

    if (!accommodationData) {
      throw new Error('Nenhum resultado encontrado para os parâmetros especificados');
    }

    return new Response(
      JSON.stringify({
        success: true,
        pricePerDay: accommodationData.pricePerDay,
        totalPrice: accommodationData.totalPrice,
        currency: accommodationData.currency,
        source: accommodationData.source,
        hotelDetails: accommodationData.hotelDetails,
        quotationDate: accommodationData.quotationDate,
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
