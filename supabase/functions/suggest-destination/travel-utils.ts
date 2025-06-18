
import { DestinationOption } from './types.ts';

// Função para determinar estilo de viagem baseado no orçamento
export const getTravelStyle = (budget: number): string => {
  if (budget <= 4000) return 'Econômica';
  if (budget <= 8000) return 'Conforto';
  return 'Luxo';
};

// Função para gerar hospedagem estimada baseada no destino e estilo
export const createEstimatedAccommodation = (destination: DestinationOption, travelStyle: string, flightCost: number) => {
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
export const createHybridSuggestion = (destination: DestinationOption, flightData: any, travelStyle: string, budget: number) => {
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
    isRealData: false,
    isEstimate: true,
    estimationReason: 'Voos com preços reais da API, hospedagem estimada (API indisponível)',
    hasRealFlightData: true,
    hasRealAccommodationData: false
  };
};

// Função para criar fallback com dados estimados mais realistas
export const createEstimatedSuggestion = (destination: DestinationOption, budget: number, travelStyle: string) => {
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
    estimationReason: 'APIs indisponíveis - usando estimativas baseadas em dados históricos',
    hasRealFlightData: false,
    hasRealAccommodationData: false
  };
};
