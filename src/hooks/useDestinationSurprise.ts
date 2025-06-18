
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HotelDetails {
  name: string;
  rating?: string;
  location?: string;
  description?: string;
  roomType?: string;
  amenities?: string[];
  address?: string;
}

interface FlightDetails {
  airlineCode?: string;
  airlineName?: string;
  quotationDate?: string;
}

interface DestinationSuggestion {
  destination: {
    name: string;
    country: string;
    category: string;
    description: string;
  };
  flightCost: number;
  accommodationCost: number;
  totalTravelCost: number;
  remainingBudget: number;
  currency: string;
  travelStyle: string;
  hotelDetails?: HotelDetails;
  flightDetails?: FlightDetails;
  accommodationQuotationDate?: string;
  isEstimate?: boolean;
  isRealData?: boolean;
  estimationReason?: string;
  hasRealFlightData?: boolean;
  hasRealAccommodationData?: boolean;
}

export const useDestinationSurprise = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestion, setSuggestion] = useState<DestinationSuggestion | null>(null);
  const { toast } = useToast();

  const searchDestination = async (budget: number) => {
    setIsSearching(true);
    setSuggestion(null);
    
    try {
      console.log('Iniciando busca de destino surpresa com orçamento:', budget);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para buscar destinos",
          variant: "destructive",
        });
        return;
      }

      console.log('Usuário autenticado, chamando edge function...');

      const response = await supabase.functions.invoke('suggest-destination', {
        body: { budget },
      });

      console.log('Resposta da edge function:', response);

      if (response.error) {
        console.error('Erro na edge function:', response.error);
        throw new Error(response.error.message || 'Erro desconhecido na busca de destino');
      }

      if (!response.data) {
        throw new Error('Nenhum dado retornado pela função');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro na busca de destino');
      }

      console.log('Destino sugerido com sucesso:', response.data);
      
      setSuggestion(response.data);

      const hotelName = response.data.hotelDetails?.name || 'hotel selecionado';
      const airlineName = response.data.flightDetails?.airlineName || 'companhia aérea';
      
      // Determinar tipo de dados para o toast
      let dataType = 'estimativa';
      if (response.data.isRealData) {
        dataType = 'preços reais';
      } else if (response.data.hasRealFlightData && !response.data.hasRealAccommodationData) {
        dataType = 'voos reais, hospedagem estimada';
      }
      
      toast({
        title: "Destino encontrado!",
        description: `Que tal ${response.data.destination.name}? Voo com ${airlineName}, hospedagem no ${hotelName}. Dados: ${dataType}.`,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar destino surpresa:', error);
      
      let errorMessage = "Tente novamente em alguns instantes";
      
      if (error instanceof Error) {
        if (error.message.includes('Orçamento')) {
          errorMessage = error.message;
        } else if (error.message.includes('autenticação')) {
          errorMessage = "Erro de autenticação. Faça login novamente.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao buscar destino",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSuggestion = () => {
    setSuggestion(null);
  };

  return {
    searchDestination,
    isSearching,
    suggestion,
    clearSuggestion,
  };
};
