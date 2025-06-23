
export interface PriceResult {
  price: number;
  currency: string;
  source: string;
  store_name: string;
  product_url?: string;
  confidence: 'high' | 'medium' | 'low';
  last_updated: string;
}

export interface ProductSearchResult {
  product_name: string;
  brand?: string;
  prices: PriceResult[];
  average_price: number;
  min_price: number;
  max_price: number;
  confidence_level: 'real' | 'estimated';
}

export interface MercadoLivreProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  seller: {
    id: number;
    nickname: string;
    car_dealer: boolean;
    real_estate_agency: boolean;
    tags: string[];
  };
  shipping?: {
    free_shipping: boolean;
  };
  condition: string;
  sold_quantity: number;
  available_quantity: number;
}

export interface MercadoLivreSearchResponse {
  results: MercadoLivreProduct[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}
