
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  petitions: any[];
  productRecommendations: any[];
  financialData: any;
  travelPlans: any[];
  savedItineraries: any[];
  isLoading: boolean;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    petitions: [],
    productRecommendations: [],
    financialData: null,
    travelPlans: [],
    savedItineraries: [],
    isLoading: true
  });

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setData(prev => ({ ...prev, isLoading: true }));

      // Buscar petições salvas
      const { data: petitions } = await supabase
        .from('saved_petitions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar recomendações de produtos
      const { data: productRecommendations } = await supabase
        .from('saved_product_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar dados financeiros
      const { data: financialData } = await supabase
        .from('user_financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Buscar planos de viagem (deprecated table)
      const { data: travelPlans } = await supabase
        .from('saved_travel_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Buscar roteiros salvos (nova tabela)
      const { data: savedItineraries } = await supabase
        .from('saved_itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setData({
        petitions: petitions || [],
        productRecommendations: productRecommendations || [],
        financialData: financialData,
        travelPlans: travelPlans || [],
        savedItineraries: savedItineraries || [],
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return { ...data, refetch: fetchDashboardData };
};
