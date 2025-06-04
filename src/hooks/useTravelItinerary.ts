
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

interface ItineraryDay {
  dia: number;
  titulo: string;
  atividades: {
    horario: string;
    atividade: string;
    descricao: string;
    custoEstimado: string;
    localizacao: string;
  }[];
}

interface ItineraryData {
  titulo: string;
  resumo: string;
  custoEstimado: string;
  dicas: string[];
  dias: ItineraryDay[];
}

export const useTravelItinerary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryData | null>(null);
  const { toast } = useToast();

  const generateItinerary = async (params: TravelItineraryParams) => {
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para gerar roteiros",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('create-travel-itinerary', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { itineraryData } = response.data;
      setGeneratedItinerary(itineraryData);

      toast({
        title: "Roteiro gerado com sucesso!",
        description: "Seu roteiro personalizado foi criado e salvo.",
      });

      return itineraryData;
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      toast({
        title: "Erro ao gerar roteiro",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
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
