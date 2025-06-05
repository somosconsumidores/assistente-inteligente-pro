
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSavedItineraries = () => {
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
        title: 'Erro',
        description: 'Não foi possível carregar seus roteiros salvos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar roteiros ao iniciar
  useEffect(() => {
    if (user) {
      fetchSavedItineraries();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Salvar um novo roteiro
  const saveItinerary = async (itineraryData, formData) => {
    if (!user) {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar logado para salvar roteiros',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_itineraries')
        .insert([
          {
            user_id: user.id,
            title: `Viagem para ${formData.destination}`,
            destination: formData.destination,
            itinerary_data: itineraryData,
            departure_date: formData.departureDate,
            return_date: formData.returnDate,
            travelers_count: parseInt(formData.travelersCount),
            budget: formData.budget || null,
            travel_style: formData.travelStyle
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: 'Roteiro salvo',
        description: 'Seu roteiro foi salvo com sucesso'
      });
      
      // Atualizar a lista
      await fetchSavedItineraries();
      
      return data[0];
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o roteiro',
        variant: 'destructive',
      });
    }
  };

  // Deletar um roteiro
  const deleteItinerary = async (id) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_itineraries')
        .delete()
        .match({ id, user_id: user.id });
        
      if (error) throw error;
      
      toast({
        title: 'Roteiro excluído',
        description: 'O roteiro foi removido com sucesso'
      });
      
      // Atualizar a lista
      await fetchSavedItineraries();
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir roteiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o roteiro',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    savedItineraries,
    isLoading,
    saveItinerary,
    deleteItinerary,
    refreshItineraries: fetchSavedItineraries
  };
};
