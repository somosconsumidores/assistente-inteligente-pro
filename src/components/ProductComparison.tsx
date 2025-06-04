
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, Trophy, Star, DollarSign } from 'lucide-react';
import { useProductComparison } from '@/hooks/useProductComparison';

const ProductComparison = () => {
  const {
    selectedImages,
    isAnalyzing,
    comparisonResult,
    error,
    addImage,
    removeImage,
    compareProducts,
    clearComparison
  } = useProductComparison();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => addImage(file));
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comparar Produtos</CardTitle>
          <CardDescription>
            Envie fotos de até 3 produtos para comparação detalhada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Image Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map(index => (
              <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {selectedImages[index] ? (
                  <div className="relative">
                    <img 
                      src={selectedImages[index].preview} 
                      alt={`Produto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                      onClick={() => removeImage(selectedImages[index].id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <Badge className="absolute bottom-2 left-2">
                      Produto {index + 1}
                    </Badge>
                  </div>
                ) : (
                  <label htmlFor={`file-upload-${index}`} className="cursor-pointer">
                    <div className="flex flex-col items-center py-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Produto {index + 1}
                        {index < 2 && <span className="text-gray-400"> (opcional)</span>}
                      </span>
                    </div>
                    <input
                      id={`file-upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={selectedImages.length >= 3}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <Button 
              onClick={compareProducts}
              disabled={selectedImages.length < 2 || isAnalyzing}
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comparando...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Comparar Produtos</span>
                </>
              )}
            </Button>
            
            {(selectedImages.length > 0 || comparisonResult) && (
              <Button variant="outline" onClick={clearComparison}>
                Nova Comparação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {comparisonResult && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Resultado da Comparação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Individual Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonResult.products.map((product, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-emerald-200">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-emerald-900">{product.name}</h4>
                      <p className="text-sm text-emerald-700">{product.brand}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-600">{product.price}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{product.rating}/5</span>
                    </div>
                    
                    <p className="text-sm text-emerald-800">{product.analysis}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Summary */}
            <div className="bg-white p-6 rounded-lg border border-emerald-200">
              <h5 className="font-semibold text-emerald-900 mb-4">🏆 Resumo da Comparação</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-900">Melhor Preço</p>
                  <p className="text-sm text-emerald-700">{comparisonResult.comparison.winner_price}</p>
                </div>
                
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-900">Melhor Qualidade</p>
                  <p className="text-sm text-emerald-700">{comparisonResult.comparison.winner_quality}</p>
                </div>
                
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-900">Recomendação Geral</p>
                  <p className="text-sm text-emerald-700">{comparisonResult.comparison.winner_overall}</p>
                </div>
              </div>
              
              <div className="border-t border-emerald-200 pt-4">
                <p className="text-emerald-800 leading-relaxed">{comparisonResult.comparison.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;
