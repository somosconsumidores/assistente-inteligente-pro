
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle } from 'lucide-react';

interface UserPlanCardProps {
  userPlan: 'free' | 'premium';
  selectedAssistant?: string | null;
  onUpgrade: () => void;
}

const UserPlanCard: React.FC<UserPlanCardProps> = ({ userPlan, selectedAssistant, onUpgrade }) => {
  const assistantNames = {
    direito: 'Mestre do Direito do Consumidor',
    financas: 'Mestre das Finanças',
    produtos: 'Mestre dos Produtos',
    viagens: 'Mestre das Viagens',
    supermercado: 'Mestre do Supermercado'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
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

        {userPlan === 'free' && (
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Upgrade para Premium
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPlanCard;
