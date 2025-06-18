
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDestinationSurprise } from '@/hooks/useDestinationSurprise';
import { Loader2, MapPin, Plane, Hotel, DollarSign, RefreshCw } from 'lucide-react';

export const DestinationSurprise = () => {
  const [budget, setBudget] = useState('');
  const { searchDestination, isSearching, suggestion, clearSuggestion } = useDestinationSurprise();

  const handleSearch = async () => {
    const budgetValue = parseFloat(budget.replace(/\D/g, ''));
    if (!budgetValue || budgetValue < 1000) {
      return;
    }
    await searchDestination(budgetValue);
  };

  const handleTryAgain = () => {
    clearSuggestion();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(parseInt(value) / 100);
    }
    setBudget(value);
  };

  return (
    <Card className="border-gray-700 bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-slate-50 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Destinos Surpresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!suggestion ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Insira seu orçamento total e descubra o destino perfeito para você! 
              Nossa IA analisa preços reais de voos e hospedagens para sugerir o melhor destino.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-slate-50">
                Qual seu orçamento total para a viagem?
              </Label>
              <Input
                id="budget"
                type="text"
                placeholder="R$ 0,00"
                value={budget}
                onChange={handleBudgetChange}
                className="bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                disabled={isSearching}
              />
              <p className="text-xs text-gray-400">
                Orçamento mínimo: R$ 1.000 (inclui voo, hospedagem e gastos extras)
              </p>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching || !budget || parseFloat(budget.replace(/\D/g, '')) < 100000}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando seu destino perfeito...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Descobrir Meu Destino
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-50">
                🎉 Seu destino é...
              </h3>
              <div className="text-2xl font-bold text-sky-400">
                {suggestion.destination.name}, {suggestion.destination.country}
              </div>
              <p className="text-gray-300 text-sm">
                {suggestion.destination.description}
              </p>
              {suggestion.isEstimate && (
                <p className="text-yellow-400 text-xs">
                  ⚠️ Preços estimados - valores reais podem variar
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <Plane className="w-4 h-4" />
                  <span className="font-semibold">Voos</span>
                </div>
                <p className="text-white font-bold">
                  {formatCurrency(suggestion.flightCost)}
                </p>
                <p className="text-xs text-gray-400">Ida e volta</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-400">
                  <Hotel className="w-4 h-4" />
                  <span className="font-semibold">Hospedagem</span>
                </div>
                <p className="text-white font-bold">
                  {formatCurrency(suggestion.accommodationCost)}
                </p>
                <p className="text-xs text-gray-400">7 noites - {suggestion.travelStyle}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-900/30 to-indigo-900/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">Resumo Financeiro</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total da viagem:</span>
                  <span className="text-white font-bold">
                    {formatCurrency(suggestion.totalTravelCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sobra para gastos extras:</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(suggestion.remainingBudget)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Outro Destino
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
