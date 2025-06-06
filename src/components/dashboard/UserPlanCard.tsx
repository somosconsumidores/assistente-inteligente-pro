
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CheckCircle, Clock } from 'lucide-react';
import SubscriptionButton from '@/components/SubscriptionButton';

interface UserPlanCardProps {
  userPlan: 'free' | 'premium';
  selectedAssistant?: string | null;
}

const UserPlanCard: React.FC<UserPlanCardProps> = ({ userPlan, selectedAssistant }) => {
  const assistantNames = {
    direito: 'Mestre do Direito do Consumidor',
    financas: 'Mestre das Finanças',
    produtos: 'Mestre dos Produtos',
    viagens: 'Mestre das Viagens',
    supermercado: 'Mestre do Supermercado'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 relative overflow-hidden">
      {/* Selo de tempo limitado - apenas para plano gratuito */}
      {userPlan === 'free' && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-bold transform rotate-12 shadow-lg">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Acesso gratuito por tempo limitado</span>
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {userPlan === 'premium' ? (
            <>
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Plano Premium
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Plano Gratuito</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedAssistant && (
          <div className="p-3 bg-white/70 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Assistente Escolhido</p>
            <p className="font-medium text-gray-800">
              {assistantNames[selectedAssistant as keyof typeof assistantNames] || selectedAssistant}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {userPlan === 'premium' ? 'Benefícios Premium:' : 'Benefícios Inclusos:'}
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {userPlan === 'premium' ? (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Todos os assistentes disponíveis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Histórico completo salvos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Suporte prioritário
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  1 assistente de sua escolha
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Histórico básico
                </li>
              </>
            )}
          </ul>
        </div>

        <SubscriptionButton className="w-full" />
      </CardContent>
    </Card>
  );
};

export default UserPlanCard;
