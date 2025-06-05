
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TravelItineraryParams {
  destination: string;
  budget?: number;
  departureDate: string;
  returnDate: string;
  travelersCount: number;
  travelStyle: string;
  additionalPreferences?: string;
}

interface ItineraryActivity {
  horario: string;
  atividade: string;
  descricao: string;
  custoEstimado: string;
  localizacao: string;
  custoBRL?: string;
  precoReal?: boolean;
  confiancaPreco?: 'high' | 'medium' | 'low';
  fontePreco?: 'google_places' | 'cache' | 'estimate';
  exchangeRate?: number;
  exchangeDate?: string;
  originalCurrency?: string;
}

interface ItineraryDay {
  dia: number;
  titulo: string;
  atividades: ItineraryActivity[];
}

interface ItineraryData {
  titulo: string;
  resumo: string;
  custoEstimado: string;
  dicas: string[];
  dias: ItineraryDay[];
}

interface TravelCosts {
  flightCost: {
    pricePerPerson: number;
    totalPrice: number;
    source: 'real' | 'estimate';
    currency?: string;
  };
  accommodationCost: {
    pricePerDay: number;
    totalPrice: number;
    source: 'real' | 'estimate';
    currency?: string;
  };
  extraExpenses: number;
  totalEstimatedCost: number;
}

interface BudgetAnalysis {
  isEnough: boolean;
  difference: number;
  percentDifference: number;
  message: string;
}

export interface TravelItineraryResponse {
  itineraryData: ItineraryData;
  travelCosts: TravelCosts;
  budgetAnalysis: BudgetAnalysis | null;
}

export const useTravelItinerary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<TravelItineraryResponse | null>(null);
  const { toast } = useToast();

  const generateItinerary = async (params: TravelItineraryParams) => {
    setIsGenerating(true);
    
    try {
      console.log('Iniciando geração de roteiro com parâmetros:', params);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para gerar roteiros",
          variant: "destructive",
        });
        return;
      }

      console.log('Usuário autenticado, chamando edge function...');

      const response = await supabase.functions.invoke('create-travel-itinerary', {
        body: params,
      });

      console.log('Resposta da edge function:', response);

      if (response.error) {
        console.error('Erro na edge function:', response.error);
        throw new Error(response.error.message || 'Erro desconhecido na geração do roteiro');
      }

      if (!response.data) {
        throw new Error('Nenhum dado retornado pela função');
      }

      const { itineraryData, travelCosts, budgetAnalysis } = response.data;
      
      if (!itineraryData) {
        throw new Error('Dados do roteiro não encontrados na resposta');
      }

      console.log('Roteiro gerado com sucesso:', itineraryData);
      console.log('Custos estimados:', travelCosts);
      console.log('Análise de orçamento:', budgetAnalysis);
      
      setGeneratedItinerary({
        itineraryData,
        travelCosts,
        budgetAnalysis
      });

      toast({
        title: "Roteiro gerado com sucesso!",
        description: "Seu roteiro personalizado foi criado com análise de custos.",
      });

      return {
        itineraryData,
        travelCosts,
        budgetAnalysis
      };
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      
      let errorMessage = "Tente novamente em alguns instantes";
      
      if (error instanceof Error) {
        if (error.message.includes('OpenAI')) {
          errorMessage = "Erro na geração do roteiro pela IA. Tente novamente.";
        } else if (error.message.includes('autenticação')) {
          errorMessage = "Erro de autenticação. Faça login novamente.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao gerar roteiro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearItinerary = () => {
    setGeneratedItinerary(null);
  };

  return {
    generateItinerary,
    isGenerating,
    generatedItinerary,
    clearItinerary,
  };
};
