
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Package, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSaveRecommendation } from '@/hooks/useSaveRecommendation';

interface SavedRecommendationsCardProps {
  recommendations: any[];
  onViewAll: () => void;
  onUpdate?: () => void;
}

const SavedRecommendationsCard: React.FC<SavedRecommendationsCardProps> = ({
  recommendations,
  onViewAll,
  onUpdate
}) => {
  const {
    deleteRecommendation,
    isLoading
  } = useSaveRecommendation();

  const handleDelete = async (id: string) => {
    const success = await deleteRecommendation(id);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Recomendações Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma recomendação salva ainda</p>
            <p className="text-sm">Use o Mestre dos Produtos para comparar produtos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 text-green-600" />
          Recomendações Salvas
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="bg-zinc-900 hover:bg-zinc-800">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 3).map(rec => (
          <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1 truncate">
                  {rec.query}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(rec.created_at), "dd 'de' MMM", {
                      locale: ptBR
                    })}
                  </span>
                  {rec.featured_products && (
                    <span className="text-green-600">
                      {Array.isArray(rec.featured_products) ? rec.featured_products.length : 0} produtos
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(rec.id)} 
                disabled={isLoading} 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {recommendations.length > 3 && (
          <p className="text-sm text-gray-500 text-center pt-2">
            +{recommendations.length - 3} recomendações adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedRecommendationsCard;
