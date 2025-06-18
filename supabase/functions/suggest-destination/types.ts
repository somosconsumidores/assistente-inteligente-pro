
export interface DestinationSuggestionRequest {
  budget: number;
}

export interface DestinationOption {
  name: string;
  country: string;
  category: 'nacional' | 'regional' | 'internacional' | 'premium';
  minBudget: number;
  description: string;
  estimatedFlightCost: number;
  estimatedAccommodationCost: number;
}

export interface CollectedOption {
  destination: DestinationOption;
  flightData?: any;
  accommodationData?: any;
  totalCost?: number;
  score: number;
  type: 'real' | 'hybrid' | 'estimated';
}
