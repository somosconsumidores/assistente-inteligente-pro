import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
interface FinancialSummaryCardProps {
  financialData: any;
  onViewDashboard: () => void;
}
const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  financialData,
  onViewDashboard
}) => {
  if (!financialData) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Dashboard Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Configure seus dados financeiros</p>
            <p className="text-sm">Use o Mestre das Finanças para começar</p>
          </div>
        </CardContent>
      </Card>;
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const saldoLiquido = Number(financialData.renda) - Number(financialData.gastos_fixes) - Number(financialData.gastos_variaveis);
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Dashboard Financeiro
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewDashboard} className="text-slate-50 bg-zinc-900 hover:bg-zinc-800">
          Ver dashboard
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Renda</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(Number(financialData.renda))}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${saldoLiquido >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {saldoLiquido >= 0 ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-sm font-medium ${saldoLiquido >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                Saldo
              </span>
            </div>
            <p className={`text-lg font-bold ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(saldoLiquido)}
            </p>
          </div>
        </div>

        {financialData.meta_economia && <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Meta de Economia</span>
            </div>
            <p className="text-lg font-bold text-yellow-700">
              {formatCurrency(Number(financialData.meta_economia))}
            </p>
          </div>}
      </CardContent>
    </Card>;
};
export default FinancialSummaryCard;