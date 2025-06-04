
import React from 'react';
import { AssistantCards } from '@/components/AssistantCards';
import { UserPlanCard } from '@/components/dashboard/UserPlanCard';
import { SelectedAssistantCard } from '@/components/dashboard/SelectedAssistantCard';
import { SavedPetitionsCard } from '@/components/dashboard/SavedPetitionsCard';
import { SavedRecommendationsCard } from '@/components/dashboard/SavedRecommendationsCard';
import { FinancialSummaryCard } from '@/components/dashboard/FinancialSummaryCard';
import { RecentTravelCard } from '@/components/dashboard/RecentTravelCard';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Painel</h1>
        <p className="text-gray-600">Bem-vindo de volta! Aqui você pode acessar todos os seus assistentes inteligentes.</p>
      </div>

      {/* User Plan Card */}
      <div className="mb-6">
        <UserPlanCard />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SelectedAssistantCard />
        <SavedPetitionsCard />
        <SavedRecommendationsCard />
        <FinancialSummaryCard />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <RecentTravelCard />
      </div>

      {/* Assistant Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Seus Assistentes Inteligentes</h2>
        <AssistantCards />
      </div>
    </div>
  );
};

export default Dashboard;
