
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import SavedItinerariesList from '@/components/SavedItinerariesList';

interface SavedItinerariesTabProps {
  isLoadingSaved: boolean;
  savedItineraries: any[];
  onDelete: (id: string) => void;
  onView: (itinerary: any) => void;
}

export const SavedItinerariesTab: React.FC<SavedItinerariesTabProps> = ({
  isLoadingSaved,
  savedItineraries,
  onDelete,
  onView
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-slate-50">Seus Roteiros Salvos</CardTitle>
          <CardDescription className="text-slate-400">
            Acesse e gerencie todos os roteiros que você salvou
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoadingSaved ? (
        <Card className="border-gray-700 bg-gray-800/50">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-sky-500" />
            <p className="text-slate-400">Carregando roteiros salvos...</p>
          </CardContent>
        </Card>
      ) : (
        <SavedItinerariesList 
          itineraries={savedItineraries} 
          onDelete={onDelete} 
          onView={onView} 
        />
      )}
    </div>
  );
};
