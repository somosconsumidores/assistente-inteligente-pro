
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';

interface ProductComparisonProps {
  isLoading: boolean;
  analysis: string | null;
  error: string | null;
  onClear: () => void;
}

const ProductComparison = ({ isLoading, analysis, error, onClear }: ProductComparisonProps) => {
  if (!isLoading && !analysis && !error) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🏆 Análise do Mestre dos Produtos
            </CardTitle>
            <CardDescription>
              Comparação baseada em análise técnica, preços e avaliações de usuários
            </CardDescription>
          </div>
          {(analysis || error) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClear}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Nova Busca
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando produtos e comparando preços...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {analysis && (
          <div className="prose max-w-none">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {analysis}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductComparison;
