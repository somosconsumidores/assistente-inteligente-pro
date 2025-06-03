
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { FinancialData } from '@/hooks/useFinancialChat';

interface FinancialInsightsProps {
  data: FinancialData;
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ data }) => {
  const saldoMensal = data.renda - data.gastosFixes - data.gastosVariaveis;
  const comprometimentoRenda = ((data.gastosFixes + data.gastosVariaveis) / data.renda) * 100;
  const reservaIdeal = data.gastosFixes * 6;
  const patrimonioLiquido = data.reservaEmergencia + data.investimentos - data.dividas;

  // Gerar recomendações baseadas na situação financeira
  const gerarRecomendacoes = () => {
    const recomendacoes = [];

    // Análise de dívidas
    if (data.dividas > 0) {
      const prioridadeDivida = data.dividas > (data.renda * 2) ? 'alta' : 'média';
      recomendacoes.push({
        tipo: 'dividas',
        prioridade: prioridadeDivida,
        titulo: 'Estratégia para Quitação de Dívidas',
        descricao: prioridadeDivida === 'alta' 
          ? 'Suas dívidas representam uma alta porcentagem da renda. Priorize a quitação imediatamente.'
          : 'Considere aumentar o valor destinado ao pagamento de dívidas para quitá-las mais rapidamente.',
        acoes: prioridadeDivida === 'alta'
          ? ['Renegocie as dívidas', 'Corte gastos não essenciais', 'Considere renda extra']
          : ['Destine 20% do saldo mensal para dívidas', 'Quite primeiro as de maior juros']
      });
    }

    // Análise de reserva de emergência
    if (data.reservaEmergencia < reservaIdeal) {
      recomendacoes.push({
        tipo: 'reserva',
        prioridade: data.reservaEmergencia < (reservaIdeal / 2) ? 'alta' : 'média',
        titulo: 'Construir Reserva de Emergência',
        descricao: `Sua reserva atual cobre apenas ${(data.reservaEmergencia / data.gastosFixes).toFixed(1)} meses de gastos. O ideal são 6 meses.`,
        acoes: [
          `Destine R$ ${((reservaIdeal - data.reservaEmergencia) / 12).toLocaleString('pt-BR')} por mês`,
          'Mantenha em conta poupança ou CDB',
          'Automatize o depósito mensal'
        ]
      });
    }

    // Análise de investimentos
    if (data.investimentos < data.renda) {
      recomendacoes.push({
        tipo: 'investimento',
        prioridade: 'média',
        titulo: 'Acelerar Investimentos',
        descricao: 'Com sua reserva e dívidas em dia, é hora de focar em investimentos para o futuro.',
        acoes: [
          'Destine pelo menos 10% da renda para investimentos',
          'Diversifique entre renda fixa e variável',
          'Considere previdência privada'
        ]
      });
    }

    // Análise de gastos
    if (comprometimentoRenda > 70) {
      recomendacoes.push({
        tipo: 'gastos',
        prioridade: comprometimentoRenda > 85 ? 'alta' : 'média',
        titulo: 'Reduzir Gastos',
        descricao: `${comprometimentoRenda.toFixed(1)}% da sua renda está comprometida. O ideal é até 70%.`,
        acoes: [
          'Analise gastos variáveis desnecessários',
          'Renegocie contratos fixos',
          'Implemente orçamento detalhado'
        ]
      });
    }

    // Meta de economia
    if (saldoMensal < data.metaEconomia) {
      recomendacoes.push({
        tipo: 'meta',
        prioridade: 'média',
        titulo: 'Ajustar Meta de Economia',
        descricao: `Sua meta de R$ ${data.metaEconomia.toLocaleString('pt-BR')} está acima do seu saldo atual.`,
        acoes: [
          `Reduza a meta para R$ ${Math.max(0, saldoMensal * 0.8).toLocaleString('pt-BR')}`,
          'Ou aumente a renda',
          'Ou reduza gastos variáveis'
        ]
      });
    }

    return recomendacoes;
  };

  const recomendacoes = gerarRecomendacoes();

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPrioridadeIcon = (tipo: string) => {
    switch (tipo) {
      case 'dividas': return AlertCircle;
      case 'reserva': return Shield;
      case 'investimento': return TrendingUp;
      case 'gastos': return DollarSign;
      case 'meta': return Target;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Análise Financeira Personalizada</span>
          </CardTitle>
          <CardDescription>
            Recomendações baseadas na sua situação atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {comprometimentoRenda.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Renda Comprometida</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(data.reservaEmergencia / data.gastosFixes).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Meses de Reserva</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                R$ {patrimonioLiquido.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-600">Patrimônio Líquido</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {recomendacoes.length}
              </div>
              <div className="text-sm text-gray-600">Recomendações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Plano de Ação Personalizado</span>
        </h3>
        
        {recomendacoes.map((rec, index) => {
          const Icon = getPrioridadeIcon(rec.tipo);
          return (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{rec.titulo}</CardTitle>
                      <CardDescription className="mt-1">{rec.descricao}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getPrioridadeColor(rec.prioridade)}>
                    {rec.prioridade === 'alta' ? 'Urgente' : rec.prioridade === 'média' ? 'Importante' : 'Sugestão'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Próximos passos:</h5>
                  <ul className="space-y-1">
                    {rec.acoes.map((acao, actionIndex) => (
                      <li key={actionIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span>{acao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {recomendacoes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Parabéns! Situação Financeira Excelente
              </h3>
              <p className="text-gray-600">
                Suas finanças estão muito bem organizadas. Continue assim e considere 
                diversificar seus investimentos para acelerar o crescimento do patrimônio.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinancialInsights;
