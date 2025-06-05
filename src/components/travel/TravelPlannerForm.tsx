
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormData {
  destination: string;
  budget: string;
  departureDate: string;
  returnDate: string;
  travelersCount: string;
  travelStyle: string;
  additionalPreferences: string;
}

interface TravelPlannerFormProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onCreateItinerary: () => void;
  isGenerating: boolean;
}

export const TravelPlannerForm: React.FC<TravelPlannerFormProps> = ({
  formData,
  onInputChange,
  onCreateItinerary,
  isGenerating
}) => {
  return (
    <Card className="border-gray-700 bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-slate-50">Planeje sua Viagem Perfeita</CardTitle>
        <CardDescription className="text-slate-400">
          Conte-me seus detalhes e criarei um roteiro personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="destino" className="text-slate-300">Destino</Label>
            <Input 
              id="destino" 
              placeholder="Ex: Paris, França" 
              value={formData.destination} 
              onChange={e => onInputChange('destination', e.target.value)}
              className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="data-ida" className="text-slate-300">Data de Ida</Label>
              <Input 
                id="data-ida" 
                type="date" 
                value={formData.departureDate} 
                onChange={e => onInputChange('departureDate', e.target.value)}
                className="bg-gray-700 border-gray-600 text-slate-50 h-12 touch-target"
              />
            </div>
            <div>
              <Label htmlFor="data-volta" className="text-slate-300">Data de Volta</Label>
              <Input 
                id="data-volta" 
                type="date" 
                value={formData.returnDate} 
                onChange={e => onInputChange('returnDate', e.target.value)}
                className="bg-gray-700 border-gray-600 text-slate-50 h-12 touch-target"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="orcamento" className="text-slate-300">Orçamento (R$)</Label>
              <Input 
                id="orcamento" 
                placeholder="0,00" 
                type="number" 
                value={formData.budget} 
                onChange={e => onInputChange('budget', e.target.value)}
                className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
              />
            </div>
            <div>
              <Label htmlFor="pessoas" className="text-slate-300">Pessoas</Label>
              <Input 
                id="pessoas" 
                type="number" 
                min="1" 
                placeholder="1" 
                value={formData.travelersCount} 
                onChange={e => onInputChange('travelersCount', e.target.value)}
                className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estilo" className="text-slate-300">Estilo de Viagem</Label>
            <select 
              className="w-full p-3 h-12 bg-gray-700 border border-gray-600 rounded-md text-slate-50 touch-target"
              value={formData.travelStyle} 
              onChange={e => onInputChange('travelStyle', e.target.value)}
            >
              <option>Econômica</option>
              <option>Conforto</option>
              <option>Luxo</option>
              <option>Aventura</option>
              <option>Cultural</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="preferencias" className="text-slate-300">Preferências Adicionais (Opcional)</Label>
            <textarea 
              id="preferencias" 
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-slate-50 placeholder-gray-400 min-h-[80px] touch-target" 
              rows={3} 
              placeholder="Ex: Gosto de museus, prefiro evitar atividades muito físicas..." 
              value={formData.additionalPreferences} 
              onChange={e => onInputChange('additionalPreferences', e.target.value)} 
            />
          </div>
          
          <Button 
            className="w-full h-12 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium touch-target" 
            size="lg" 
            onClick={onCreateItinerary} 
            disabled={isGenerating || !formData.destination || !formData.departureDate || !formData.returnDate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando Roteiro...
              </>
            ) : (
              'Criar Roteiro Personalizado'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
