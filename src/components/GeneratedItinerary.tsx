
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Lightbulb, Calendar } from 'lucide-react';

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
  itinerary: ItineraryData;
  onBackToPlanner: () => void;
}

const GeneratedItinerary: React.FC<GeneratedItineraryProps> = ({ 
  itinerary, 
  onBackToPlanner 
}) => {
  return (
    <div className="space-y-6">
      {/* Header do Roteiro */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{itinerary.titulo}</CardTitle>
              <p className="text-gray-600 mt-2">{itinerary.resumo}</p>
            </div>
            <Button variant="outline" onClick={onBackToPlanner}>
              Criar Novo Roteiro
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium">{itinerary.custoEstimado}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{itinerary.dias.length} dias</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dicas */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
            <Lightbulb className="w-5 h-5" />
            Dicas do Especialista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-yellow-700">
            {itinerary.dicas.map((dica, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{dica}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Roteiro por Dias */}
      <div className="space-y-4">
        {itinerary.dias.map((day) => (
          <Card key={day.dia}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {day.dia}
                </div>
                {day.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {day.atividades.map((atividade, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium min-w-16">
                      <Clock className="w-3 h-3" />
                      {atividade.horario}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {atividade.atividade}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {atividade.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{atividade.localizacao}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
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
