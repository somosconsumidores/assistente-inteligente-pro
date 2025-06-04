
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travelers_count: number;
  travel_style: string;
  budget: number;
  itinerary_data: any;
  created_at: string;
}

interface SavedItinerariesListProps {
  itineraries: SavedItinerary[];
  onDelete: (id: string) => void;
  onView: (itinerary: SavedItinerary) => void;
}

const SavedItinerariesList: React.FC<SavedItinerariesListProps> = ({
  itineraries,
  onDelete,
  onView
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (itineraries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum roteiro salvo
          </h3>
          <p className="text-gray-600">
            Crie seu primeiro roteiro personalizado para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {itineraries.map((itinerary) => (
        <Card key={itinerary.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{itinerary.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{itinerary.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(itinerary.departure_date)} - {formatDate(itinerary.return_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{itinerary.travelers_count} pessoa(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(itinerary)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(itinerary.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {itinerary.travel_style}
                </span>
                {itinerary.budget && (
                  <span className="text-green-600 font-medium">
                    R$ {itinerary.budget.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-gray-500">
                Criado em {formatDate(itinerary.created_at)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedItinerariesList;
