
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import UserPlanCard from '@/components/dashboard/UserPlanCard';
import SavedPetitionsCard from '@/components/dashboard/SavedPetitionsCard';
import SavedRecommendationsCard from '@/components/dashboard/SavedRecommendationsCard';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import RecentTravelCard from '@/components/dashboard/RecentTravelCard';
import SelectedAssistantCard from '@/components/dashboard/SelectedAssistantCard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useMobileDeviceInfo();
  const {
    petitions,
    productRecommendations,
    financialData,
    savedItineraries,
    isLoading,
    refetch
  } = useDashboardData();

  console.log('Dashboard render:', { profile, isLoading, petitions, productRecommendations, financialData, savedItineraries });

  if (isLoading) {
    console.log('Dashboard is loading...');
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log('Dashboard loaded, rendering content...');
  const isPremiumUser = profile?.plan === 'premium';

  const handleViewAllPetitions = () => {
    navigate('/saved-petitions');
  };

  const handleViewAllRecommendations = () => {
    navigate('/saved-recommendations');
  };

  const handleViewAllItineraries = () => {
    navigate('/viagens');
  };

  const handleViewFinancialDashboard = () => {
    navigate('/financas');
  };

  return (
    <DashboardLayout onRefresh={refetch} enablePullToRefresh={true}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? 'mobile-safe-area' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  Meu Painel
                </h1>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                  Bem-vindo, {profile?.name || 'Usuário'}! Aqui está o resumo das suas atividades.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid - Responsive for mobile */}
        <div className={`grid gap-6 ${
          isMobile 
            ? 'grid-cols-1' 
            : 'grid-cols-1 lg:grid-cols-3'
        }`}>
          {/* Coluna 1 - Informações do usuário e assistente */}
          <div className="space-y-6">
            <UserPlanCard 
              userPlan={profile?.plan || 'free'} 
              selectedAssistant={profile?.selected_assistant_id}
            />
            
            {/* Só mostra o card do assistente selecionado se não for usuário premium */}
            {!isPremiumUser && (
              <SelectedAssistantCard 
                selectedAssistantId={profile?.selected_assistant_id}
              />
            )}
          </div>

          {/* Coluna 2 - Petições e Recomendações */}
          <div className="space-y-6">
            <SavedPetitionsCard 
              petitions={petitions}
              onViewAll={handleViewAllPetitions}
            />
            
            <SavedRecommendationsCard 
              recommendations={productRecommendations}
              onViewAll={handleViewAllRecommendations}
              onUpdate={refetch}
            />
          </div>

          {/* Coluna 3 - Finanças e Viagens */}
          <div className="space-y-6">
            <FinancialSummaryCard 
              financialData={financialData}
              onViewDashboard={handleViewFinancialDashboard}
            />
            
            <RecentTravelCard 
              travelPlans={savedItineraries}
              onViewAll={handleViewAllItineraries}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
