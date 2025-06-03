
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, AlertTriangle } from 'lucide-react';
import { FinancialData } from '@/hooks/useFinancialChatFlow';

interface PersonalizedFinancialDashboardProps {
  data: FinancialData;
}

export const PersonalizedFinancialDashboard: React.FC<PersonalizedFinancialDashboardProps> = ({ data }) => {
  const {
    nome,
    rendaMensal = 0,
    gastosMoradia = 0,
    gastosTransporte = 0,
    gastosAlimentacao = 0,
    gastosLazer = 0,
    outrosGastos = 0,
    dividas = 0,
    economia = 0,
    objetivoFinanceiro,
    prazoObjetivo = 1
  } = data;

  const totalGastos = gastosMoradia + gastosTransporte + gastosAlimentacao + gastosLazer + outrosGastos;
  const sobra = rendaMensal - totalGastos;
  const economiaAtual = economia;
  const situacaoFinanceira = sobra > 0 ? 'positiva' : sobra === 0 ? 'equilibrada' : 'negativa';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFinancialAdvice = () => {
    if (situacaoFinanceira === 'negativa') {
      return {
        type: 'warning',
        message: 'Seus gastos excedem sua renda. É importante revisar e reduzir despesas urgentemente.'
      };
    } else if (situacaoFinanceira === 'equilibrada') {
      return {
        type: 'caution',
        message: 'Você está no equilíbrio, mas sem margem para emergências. Considere reduzir gastos para criar uma reserva.'
      };
    } else {
      return {
        type: 'success',
        message: 'Parabéns! Você tem uma sobra mensal positiva. Continue assim e considere investir essa sobra.'
      };
    }
  };

  const advice = getFinancialAdvice();

  const calculateGoalViability = () => {
    if (!objetivoFinanceiro || !prazoObjetivo) return null;
    
    const sobraMensal = Math.max(0, sobra);
    const potencialEconomia = sobraMensal * prazoObjetivo;
    
    return {
      potencialEconomia,
      viavel: potencialEconomia > 0
    };
  };

  const goalViability = calculateGoalViability();

  return (
    <div className="space-y-6">
      {/* Header personalizado */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Financeiro {nome ? `de ${nome}` : 'Personalizado'}
        </h2>
        <p className="text-gray-600">Sua situação financeira em tempo real</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(rendaMensal)}</div>
            <p className="text-xs text-muted-foreground">Valor informado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalGastos / rendaMensal) * 100).toFixed(1)}% da renda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sobra Mensal</CardTitle>
            <TrendingUp className={`h-4 w-4 ${sobra >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${sobra >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(sobra)}
            </div>
            <p className="text-xs text-muted-foreground">
              {sobra >= 0 ? 'Situação positiva' : 'Atenção necessária'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserva Atual</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(economiaAtual)}</div>
            <p className="text-xs text-muted-foreground">
              {economiaAtual > 0 ? 'Parabéns pela reserva!' : 'Comece a poupar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gastos</CardTitle>
            <CardDescription>Como você distribui seus gastos mensais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { categoria: 'Moradia', valor: gastosMoradia, cor: 'bg-blue-500' },
              { categoria: 'Transporte', valor: gastosTransporte, cor: 'bg-green-500' },
              { categoria: 'Alimentação', valor: gastosAlimentacao, cor: 'bg-yellow-500' },
              { categoria: 'Lazer', valor: gastosLazer, cor: 'bg-purple-500' },
              { categoria: 'Outros', valor: outrosGastos, cor: 'bg-gray-500' }
            ].map((item) => {
              const percentage = totalGastos > 0 ? (item.valor / totalGastos) * 100 : 0;
              return (
                <div key={item.categoria} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.categoria}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(item.valor)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.cor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Análise e recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${
                advice.type === 'success' ? 'text-green-500' : 
                advice.type === 'warning' ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <span>Análise da Situação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${
              advice.type === 'success' ? 'bg-green-50 border border-green-200' : 
              advice.type === 'warning' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className="text-sm">{advice.message}</p>
            </div>

            {dividas > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Atenção às Dívidas</h4>
                <p className="text-sm text-orange-700">
                  Você possui {formatCurrency(dividas)} em dívidas. 
                  Considere priorizar o pagamento dessas dívidas antes de novos investimentos.
                </p>
              </div>
            )}

            {objetivoFinanceiro && goalViability && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Seu Objetivo: {objetivoFinanceiro}</h4>
                <p className="text-sm text-blue-700">
                  {goalViability.viavel ? 
                    `Com sua sobra atual de ${formatCurrency(sobra)}, você pode acumular ${formatCurrency(goalViability.potencialEconomia)} em ${prazoObjetivo} meses.` :
                    `Com a situação atual, será difícil alcançar esse objetivo em ${prazoObjetivo} meses. Considere revisar seus gastos ou estender o prazo.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
