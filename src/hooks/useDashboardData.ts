
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  petitions: any[];
  productRecommendations: any[];
  financialData: any;
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
    savedItineraries: [],
    isLoading: true
  });

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('No user found, skipping dashboard data fetch');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      console.log('Fetching dashboard data for user:', user.id);
      setData(prev => ({ ...prev, isLoading: true }));

      // Buscar petições salvas
      console.log('Fetching saved petitions...');
      const { data: petitions, error: petitionsError } = await supabase
        .from('saved_petitions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (petitionsError) {
        console.error('Error fetching petitions:', petitionsError);
      }

      // Buscar recomendações de produtos
      console.log('Fetching product recommendations...');
      const { data: productRecommendations, error: recommendationsError } = await supabase
        .from('saved_product_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recommendationsError) {
        console.error('Error fetching recommendations:', recommendationsError);
      }

      // Buscar dados financeiros
      console.log('Fetching financial data...');
      const { data: financialData, error: financialError } = await supabase
        .from('user_financial_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (financialError) {
        console.error('Error fetching financial data:', financialError);
      }

      // Buscar roteiros salvos (tabela unificada)
      console.log('Fetching saved itineraries...');
      const { data: savedItineraries, error: itinerariesError } = await supabase
        .from('saved_itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (itinerariesError) {
        console.error('Error fetching itineraries:', itinerariesError);
      }

      console.log('Dashboard data fetched successfully:', {
        petitions: petitions?.length || 0,
        recommendations: productRecommendations?.length || 0,
        hasFinancialData: !!financialData,
        itineraries: savedItineraries?.length || 0
      });

      setData({
        petitions: petitions || [],
        productRecommendations: productRecommendations || [],
        financialData: financialData,
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
    console.log('useDashboardData effect triggered, user:', user?.id);
    fetchDashboardData();
  }, [user]);

  return { ...data, refetch: fetchDashboardData };
};
