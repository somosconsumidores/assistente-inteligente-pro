
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travelers_count: number;
  travel_style: string;
  budget: number;
  itinerary_data: any;
  created_at: string;
}

export const useSavedItineraries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedItineraries = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedItineraries(data || []);
    } catch (error) {
      console.error('Erro ao buscar roteiros salvos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os roteiros salvos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveItinerary = async (itineraryData: any, formData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_itineraries')
        .insert({
          user_id: user.id,
          title: itineraryData.titulo,
          destination: formData.destination,
          departure_date: formData.departureDate,
          return_date: formData.returnDate,
          travelers_count: parseInt(formData.travelersCount),
          travel_style: formData.travelStyle,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          itinerary_data: itineraryData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Roteiro salvo!",
        description: "Seu roteiro foi salvo com sucesso"
      });

      fetchSavedItineraries();
      return data;
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o roteiro",
        variant: "destructive"
      });
    }
  };

  const deleteItinerary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_itineraries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Roteiro excluído",
        description: "O roteiro foi excluído com sucesso"
      });

      fetchSavedItineraries();
    } catch (error) {
      console.error('Erro ao excluir roteiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o roteiro",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSavedItineraries();
  }, [user]);

  return {
    savedItineraries,
    isLoading,
    saveItinerary,
    deleteItinerary,
    refetch: fetchSavedItineraries
  };
};
