
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  PiggyBank,
  CreditCard,
  Wallet
} from 'lucide-react';
import { FinancialData } from '@/hooks/useFinancialChat';

interface FinancialDashboardProps {
  data: FinancialData;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ data }) => {
  // Cálculos financeiros
  const totalGastos = data.gastosFixes + data.gastosVariaveis;
  const saldoMensal = data.renda - totalGastos;
  const comprometimentoRenda = (totalGastos / data.renda) * 100;
  const saudeFinanceira = comprometimentoRenda <= 70 ? 'Boa' : comprometimentoRenda <= 85 ? 'Atenção' : 'Crítica';
  const corSaude = saudeFinanceira === 'Boa' ? 'text-green-600' : saudeFinanceira === 'Atenção' ? 'text-yellow-600' : 'text-red-600';

  // Dados para gráficos
  const gastosData = [
    { name: 'Gastos Fixos', value: data.gastosFixes, color: '#ef4444' },
    { name: 'Gastos Variáveis', value: data.gastosVariaveis, color: '#f59e0b' },
    { name: 'Disponível', value: Math.max(0, saldoMensal), color: '#10b981' }
  ];

  const patrimonioData = [
    { name: 'Reserva de Emergência', value: data.reservaEmergencia },
    { name: 'Investimentos', value: data.investimentos },
    { name: 'Dívidas', value: -data.dividas }
  ];

  const metasData = [
    {
      nome: 'Meta de Economia Mensal',
      atual: Math.max(0, saldoMensal),
      meta: data.metaEconomia,
      progresso: Math.min(100, (Math.max(0, saldoMensal) / data.metaEconomia) * 100)
    }
  ];

  const insights = [
    {
      type: saldoMensal > 0 ? 'success' : 'warning',
      icon: saldoMensal > 0 ? CheckCircle : AlertTriangle,
      titulo: saldoMensal > 0 ? 'Parabéns!' : 'Atenção!',
      descricao: saldoMensal > 0 
        ? `Você tem R$ ${saldoMensal.toLocaleString('pt-BR')} disponível por mês`
        : `Seus gastos excedem sua renda em R$ ${Math.abs(saldoMensal).toLocaleString('pt-BR')}`
    },
    {
      type: comprometimentoRenda <= 70 ? 'success' : 'warning',
      icon: comprometimentoRenda <= 70 ? TrendingUp : TrendingDown,
      titulo: comprometimentoRenda <= 70 ? 'Renda bem administrada' : 'Renda comprometida',
      descricao: `${comprometimentoRenda.toFixed(1)}% da sua renda está comprometida com gastos`
    },
    {
      type: data.reservaEmergencia >= (data.gastosFixes * 6) ? 'success' : 'warning',
      icon: data.reservaEmergencia >= (data.gastosFixes * 6) ? PiggyBank : AlertTriangle,
      titulo: data.reservaEmergencia >= (data.gastosFixes * 6) ? 'Reserva adequada' : 'Reserva insuficiente',
      descricao: data.reservaEmergencia >= (data.gastosFixes * 6)
        ? 'Sua reserva cobre mais de 6 meses de gastos fixos'
        : `Recomendamos R$ ${(data.gastosFixes * 6).toLocaleString('pt-BR')} para 6 meses`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com resumo da situação */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Seu Panorama Financeiro</span>
          </CardTitle>
          <CardDescription className="text-white/80">
            Situação financeira: <span className={`font-bold ${corSaude.replace('text-', 'text-white')}`}>{saudeFinanceira}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/80 text-sm">Renda Mensal</p>
              <p className="text-2xl font-bold">R$ {data.renda.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total de Gastos</p>
              <p className="text-2xl font-bold">R$ {totalGastos.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Saldo Mensal</p>
              <p className={`text-2xl font-bold ${saldoMensal >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                R$ {saldoMensal.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Patrimônio Líquido</p>
              <p className="text-2xl font-bold">
                R$ {(data.reservaEmergencia + data.investimentos - data.dividas).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights importantes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`border-l-4 ${
            insight.type === 'success' ? 'border-l-green-500' : 'border-l-yellow-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <insight.icon className={`w-5 h-5 mt-1 ${
                  insight.type === 'success' ? 'text-green-500' : 'text-yellow-500'
                }`} />
                <div>
                  <h4 className="font-semibold text-sm">{insight.titulo}</h4>
                  <p className="text-xs text-gray-600 mt-1">{insight.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Distribuição de Gastos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gastosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gastosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {gastosData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patrimônio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PiggyBank className="w-5 h-5" />
              <span>Composição do Patrimônio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={patrimonioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${Math.abs(value).toLocaleString('pt-BR')}`, '']}
                />
                <Bar 
                  dataKey="value" 
                  fill={(data) => data.value >= 0 ? '#10b981' : '#ef4444'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Metas e Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Suas Metas e Objetivos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progresso da meta de economia */}
          {metasData.map((meta, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{meta.nome}</span>
                <span className="text-sm text-gray-600">
                  R$ {meta.atual.toLocaleString('pt-BR')} / R$ {meta.meta.toLocaleString('pt-BR')}
                </span>
              </div>
              <Progress value={meta.progresso} className="h-3" />
              <p className="text-xs text-gray-600">
                {meta.progresso.toFixed(1)}% da meta atingida
              </p>
            </div>
          ))}

          {/* Objetivos */}
          <div>
            <h4 className="font-medium mb-3">Seus Objetivos Financeiros:</h4>
            <div className="flex flex-wrap gap-2">
              {data.objetivos?.map((objetivo, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {objetivo}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
