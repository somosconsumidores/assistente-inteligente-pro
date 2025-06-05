import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Lightbulb, Calendar, Save, ArrowLeft, Plane, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TravelItineraryResponse } from '@/hooks/useTravelItinerary';

interface ItineraryActivity {
  horario: string;
  atividade: string;
  descricao: string;
  custoEstimado: string;
  localizacao: string;
}

interface ItineraryDay {
  dia: number;
  titulo: string;
  atividades: ItineraryActivity[];
}

interface ItineraryData {
  titulo: string;
  resumo: string;
  custoEstimado: string;
  dicas: string[];
  dias: ItineraryDay[];
}

interface GeneratedItineraryProps {
  itinerary: TravelItineraryResponse;
  onBackToPlanner: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const GeneratedItinerary: React.FC<GeneratedItineraryProps> = ({ 
  itinerary, 
  onBackToPlanner,
  onSave,
  isSaved = false
}) => {
  const isMobile = useIsMobile();
  const { itineraryData, travelCosts, budgetAnalysis } = itinerary;

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-optimized Header */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <div className="space-y-4">
            {/* Mobile: Stack actions, Desktop: Side by side */}
            <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between'}`}>
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl text-slate-50">{itineraryData.titulo}</CardTitle>
                <p className="text-slate-400 text-sm sm:text-base">{itineraryData.resumo}</p>
              </div>
              
              {/* Mobile: Full width buttons, Desktop: Side by side */}
              <div className={`${isMobile ? 'space-y-2' : 'flex items-center gap-2 flex-shrink-0'}`}>
                {onSave && !isSaved && (
                  <Button 
                    variant="default" 
                    onClick={onSave}
                    className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-10 sm:h-auto ${
                      isMobile ? 'w-full' : ''
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Roteiro
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={onBackToPlanner}
                  className={`border-gray-600 text-slate-300 hover:bg-gray-700 hover:text-white h-10 sm:h-auto ${
                    isMobile ? 'w-full' : ''
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isMobile ? 'Voltar' : 'Criar Novo Roteiro'}
                </Button>
              </div>
            </div>

            {/* Trip info - Mobile optimized */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
              <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{itineraryData.custoEstimado}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{itineraryData.dias.length} dias</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flight and Accommodation Pricing - Mobile optimized */}
      {travelCosts && (
        <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-300">
              <Plane className="w-5 h-5" />
              Estimativa de Custos da Viagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Flight Cost */}
            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-4 h-4 text-blue-400" />
                <h3 className="font-medium text-blue-300">Passagens Aéreas</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Preço por pessoa</span>
                  <span className="text-slate-50">{formatCurrency(travelCosts.flightCost.pricePerPerson)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Total passagens</span>
                  <span className="text-lg font-medium text-blue-300">{formatCurrency(travelCosts.flightCost.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Accommodation Cost */}
            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-purple-400" />
                <h3 className="font-medium text-purple-300">Hospedagem</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Preço por dia</span>
                  <span className="text-slate-50">{formatCurrency(travelCosts.accommodationCost.pricePerDay)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Total hospedagem</span>
                  <span className="text-lg font-medium text-purple-300">{formatCurrency(travelCosts.accommodationCost.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Other Expenses */}
            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h3 className="font-medium text-green-300">Outras Despesas</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Alimentação, transporte e atividades</span>
                  <span className="text-lg font-medium text-green-300">{formatCurrency(travelCosts.extraExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-800/30 to-indigo-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-medium">Custo Total Estimado:</span>
                <span className="text-xl font-bold text-white">{formatCurrency(travelCosts.totalEstimatedCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Analysis - Mobile optimized */}
      {budgetAnalysis && (
        <Card className={`
          border-${budgetAnalysis.isEnough ? 'green' : 'orange'}-700/50 
          bg-gradient-to-r 
          ${budgetAnalysis.isEnough 
            ? 'from-green-900/40 to-emerald-900/40' 
            : 'from-orange-900/40 to-red-900/40'}
        `}>
          <CardHeader>
            <CardTitle className={`text-lg flex items-center gap-2 ${
              budgetAnalysis.isEnough ? 'text-green-300' : 'text-orange-300'
            }`}>
              {budgetAnalysis.isEnough 
                ? <CheckCircle className="w-5 h-5" /> 
                : <AlertTriangle className="w-5 h-5" />
              }
              Análise de Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg bg-${budgetAnalysis.isEnough ? 'green' : 'orange'}-950/20`}>
              <p className={`text-${budgetAnalysis.isEnough ? 'green' : 'orange'}-300 font-medium mb-2`}>
                {budgetAnalysis.message}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Diferença</span>
                  <span className={`font-medium ${
                    budgetAnalysis.isEnough ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {budgetAnalysis.isEnough ? '+' : '-'}{formatCurrency(budgetAnalysis.difference)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Porcentagem</span>
                  <span className={`font-medium ${
                    budgetAnalysis.isEnough ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {budgetAnalysis.isEnough ? '+' : '-'}{budgetAnalysis.percentDifference}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mt-4">
                {budgetAnalysis.isEnough
                  ? 'Seu orçamento é suficiente para esta viagem. Considere reservar parte para despesas extras ou emergências.'
                  : 'Seu orçamento está abaixo do estimado. Considere aumentar seu orçamento ou ajustar suas escolhas de viagem.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expert Tips - Mobile optimized */}
      <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
            <Lightbulb className="w-5 h-5" />
            Dicas do Especialista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-yellow-300">
            {itineraryData.dicas.map((dica, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1 flex-shrink-0">•</span>
                <span className="text-sm sm:text-base">{dica}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Daily Itinerary - Mobile optimized */}
      <div className="space-y-4">
        {itineraryData.dias.map((day) => (
          <Card key={day.dia} className="border-gray-700 bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-slate-50">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {day.dia}
                </div>
                <span className="text-base sm:text-lg">{day.titulo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {day.atividades.map((atividade, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/30 rounded-lg">
                    {/* Time - Mobile: Top, Desktop: Left */}
                    <div className="flex items-center gap-2 text-sm text-blue-400 font-medium sm:min-w-16">
                      <Clock className="w-3 h-3" />
                      {atividade.horario}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium text-slate-50 text-sm sm:text-base">
                        {atividade.atividade}
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {atividade.descricao}
                      </p>
                      
                      {/* Location and Cost - Mobile: Stacked, Desktop: Side by side */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{atividade.localizacao}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          <span>{atividade.custoEstimado}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GeneratedItinerary;
