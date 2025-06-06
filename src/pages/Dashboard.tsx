
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserPlanCard from '@/components/dashboard/UserPlanCard';
import SavedPetitionsCard from '@/components/dashboard/SavedPetitionsCard';
import SavedRecommendationsCard from '@/components/dashboard/SavedRecommendationsCard';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import RecentTravelCard from '@/components/dashboard/RecentTravelCard';
import SelectedAssistantCard from '@/components/dashboard/SelectedAssistantCard';
import AssistantCards from '@/components/AssistantCards';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isPremiumUser = profile?.plan === 'premium';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-50">Meu Painel</h1>
                <p className="text-slate-50">
                  Bem-vindo, {profile?.name || 'Usuário'}! Aqui está o resumo das suas atividades.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid - Layout otimizado para desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Primeira linha - Cards principais */}
          <div className="xl:col-span-1">
            <UserPlanCard 
              userPlan={profile?.plan || 'free'} 
              selectedAssistant={profile?.selected_assistant_id} 
            />
          </div>

          {!isPremiumUser && (
            <div className="xl:col-span-1">
              <SelectedAssistantCard selectedAssistantId={profile?.selected_assistant_id} />
            </div>
          )}

          <div className={`${!isPremiumUser ? 'xl:col-span-1' : 'xl:col-span-2'}`}>
            <FinancialSummaryCard 
              financialData={financialData} 
              onViewDashboard={() => navigate('/financas')} 
            />
          </div>

          {!isPremiumUser && (
            <div className="xl:col-span-1">
              <RecentTravelCard 
                travelPlans={savedItineraries} 
                onViewAll={() => {
                  navigate('/viagens?tab=saved');
                }} 
              />
            </div>
          )}

          {/* Segunda linha - Cards de conteúdo */}
          <div className={`${isPremiumUser ? 'xl:col-span-2' : 'xl:col-span-2'}`}>
            <SavedPetitionsCard 
              petitions={petitions} 
              onViewAll={() => navigate('/peticoes-salvas')} 
            />
          </div>

          <div className={`${isPremiumUser ? 'xl:col-span-2' : 'xl:col-span-2'}`}>
            <SavedRecommendationsCard 
              recommendations={productRecommendations} 
              onViewAll={() => navigate('/recomendacoes-salvas')} 
              onUpdate={refetch} 
            />
          </div>

          {/* Para usuários premium, adicionar o card de viagens na segunda linha */}
          {isPremiumUser && (
            <div className="xl:col-span-4">
              <RecentTravelCard 
                travelPlans={savedItineraries} 
                onViewAll={() => {
                  navigate('/viagens?tab=saved');
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
