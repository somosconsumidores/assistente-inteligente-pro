
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedPetitionsCardProps {
  petitions: any[];
  onViewAll: () => void;
}

const SavedPetitionsCard: React.FC<SavedPetitionsCardProps> = ({ petitions, onViewAll }) => {
  if (petitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-blue-600" />
            Petições Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma petição salva ainda</p>
            <p className="text-sm">Use o Mestre do Direito para gerar petições</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="w-5 h-5 text-blue-600" />
          Petições Salvas
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          Ver todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {petitions.slice(0, 3).map((petition) => (
          <div key={petition.id} className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1 truncate">
              {petition.title}
            </h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(petition.created_at), "dd 'de' MMM", { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
        {petitions.length > 3 && (
          <p className="text-sm text-gray-500 text-center pt-2">
            +{petitions.length - 3} petições adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPetitionsCard;
