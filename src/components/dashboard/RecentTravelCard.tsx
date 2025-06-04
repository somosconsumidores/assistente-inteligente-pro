
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentTravelCardProps {
  travelPlans: any[];
  onViewAll: () => void;
}

const RecentTravelCard: React.FC<RecentTravelCardProps> = ({ travelPlans, onViewAll }) => {
  if (travelPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="w-5 h-5 text-sky-600" />
            Planos de Viagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum plano de viagem salvo</p>
            <p className="text-sm">Use o Mestre das Viagens para planejar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mostRecentTravel = travelPlans[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plane className="w-5 h-5 text-sky-600" />
          Planos de Viagem
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 rounded-full">
              <MapPin className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                {mostRecentTravel.destination}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar className="w-3 h-3" />
                <span>
                  Criado em {format(new Date(mostRecentTravel.created_at), "dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>
              {mostRecentTravel.travel_dates && (
                <div className="text-sm text-sky-700 bg-sky-100 px-2 py-1 rounded inline-block">
                  {mostRecentTravel.travel_dates.inicio} - {mostRecentTravel.travel_dates.fim}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {travelPlans.length > 1 && (
          <p className="text-sm text-gray-500 text-center mt-3">
            +{travelPlans.length - 1} planos adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTravelCard;
