
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
import { MobileOptimizedCard } from '@/components/mobile/MobileOptimizedCard';
import { LazyLoadWrapper } from '@/components/mobile/LazyLoadWrapper';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useMobileDeviceInfo();
  const { isSlowConnection } = useNetworkStatus();
  const {
    petitions,
    productRecommendations,
    financialData,
    savedItineraries,
    isLoading,
    refetch
  } = useDashboardData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MobileOptimizedCard key={i} isLoading={true}>
                <div />
              </MobileOptimizedCard>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isPremiumUser = profile?.plan === 'premium';

  return (
    <DashboardLayout onRefresh={refetch} enablePullToRefresh={true}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-800 ${isMobile ? 'mobile-safe-area' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-slate-50 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  Meu Painel
                </h1>
                <p className={`text-slate-50 ${isMobile ? 'text-sm' : ''}`}>
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
            <LazyLoadWrapper enabled={isSlowConnection} height="200px">
              <UserPlanCard 
                userPlan={profile?.plan || 'free'} 
                selectedAssistant={profile?.selected_assistant_id} 
              />
            </LazyLoadWrapper>
            
            {/* Só mostra o card do assistente selecionado se não for usuário premium */}
            {!isPremiumUser && (
              <LazyLoadWrapper enabled={isSlowConnection} height="150px">
                <SelectedAssistantCard selectedAssistantId={profile?.selected_assistant_id} />
              </LazyLoadWrapper>
            )}
          </div>

          {/* Coluna 2 - Petições e Recomendações */}
          <div className="space-y-6">
            <LazyLoadWrapper enabled={isSlowConnection} height="250px">
              <SavedPetitionsCard 
                petitions={petitions} 
                onViewAll={() => navigate('/peticoes-salvas')} 
              />
            </LazyLoadWrapper>
            
            <LazyLoadWrapper enabled={isSlowConnection} height="250px">
              <SavedRecommendationsCard 
                recommendations={productRecommendations} 
                onViewAll={() => navigate('/recomendacoes-salvas')} 
                onUpdate={refetch} 
              />
            </LazyLoadWrapper>
          </div>

          {/* Coluna 3 - Finanças e Viagens */}
          <div className="space-y-6">
            <LazyLoadWrapper enabled={isSlowConnection} height="200px">
              <FinancialSummaryCard 
                financialData={financialData} 
                onViewDashboard={() => navigate('/financas')} 
              />
            </LazyLoadWrapper>
            
            <LazyLoadWrapper enabled={isSlowConnection} height="200px">
              <RecentTravelCard 
                travelPlans={savedItineraries} 
                onViewAll={() => {
                  navigate('/viagens?tab=saved');
                }} 
              />
            </LazyLoadWrapper>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
