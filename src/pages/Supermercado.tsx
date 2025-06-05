
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Search, Star, ShoppingBasket, Upload, Loader2, ImageIcon, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProductComparison from '@/components/ProductComparison';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useIsMobile } from '@/hooks/use-mobile';

const Supermercado = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  // Product search hook
  const {
    isSearching,
    searchResult,
    error: searchError,
    searchProducts,
    clearSearch
  } = useProductSearch();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis(null);
    }
  };

  const analyzeProduct = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione uma foto primeiro');
      return;
    }
    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        // Call the edge function to analyze the product
        const { data, error } = await supabase.functions.invoke('analyze-product', {
          body: {
            image: base64Image,
            type: 'barcode_analysis'
          }
        });

        if (error) {
          console.error('Error analyzing product:', error);
          toast.error('Erro ao analisar produto');
          return;
        }

        setAnalysis(data);
        toast.success('Produto analisado com sucesso!');
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchProducts(searchQuery);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Mobile-optimized content wrapper */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 safe-area-bottom">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex-shrink-0">
                <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Assistente de Compras</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Scanner de produtos, comparação de preços e recomendações inteligentes
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Navigation Tabs */}
          <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'space-x-4'} mb-6 sm:mb-8`}>
            <Button 
              variant={activeTab === 'scanner' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('scanner')} 
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <Camera className="w-4 h-4" />
              <span>Scanner</span>
            </Button>
            <Button 
              variant={activeTab === 'compare' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('compare')} 
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <Zap className="w-4 h-4" />
              <span>Comparar</span>
            </Button>
            <Button 
              variant={activeTab === 'search' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('search')} 
              className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Button>
          </div>

          {/* Scanner Tab */}
          {activeTab === 'scanner' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Scanner de Produtos</CardTitle>
                  <CardDescription className="text-sm">Tire uma foto do código de barras do produto para análise completa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 sm:p-8 text-center">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md" 
                        />
                        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-4'} justify-center`}>
                          <Button 
                            onClick={analyzeProduct} 
                            disabled={isAnalyzing}
                            className="mobile-button mobile-button-primary"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analisando...
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4 mr-2" />
                                Analisar Produto
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={clearAnalysis}
                            className="mobile-button mobile-button-secondary"
                          >
                            Nova Foto
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-slate-50 mb-2">Selecione uma foto</h3>
                        <p className="text-slate-400 mb-4 text-sm">Envie uma foto do código de barras do produto</p>
                        <div className="flex flex-col space-y-4 items-center">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors mobile-button">
                              <Upload className="w-4 h-4" />
                              <span>Enviar da Galeria</span>
                            </div>
                            <input 
                              id="file-upload" 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileSelect} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysis && (
                <Card className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-700/50">
                  <CardHeader>
                    <CardTitle className="text-emerald-400 flex items-center space-x-2 text-lg sm:text-xl">
                      <Star className="w-5 h-5" />
                      <span>Análise do Produto</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-emerald-300 text-sm sm:text-base">{analysis.productName || 'Produto Identificado'}</h4>
                        <p className="text-emerald-200 text-xs sm:text-sm">{analysis.brand && `Marca: ${analysis.brand}`}</p>
                      </div>
                      
                      {analysis.analysis && (
                        <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-emerald-700/30">
                          <h5 className="font-medium text-emerald-300 mb-2 text-sm sm:text-base">💡 Análise Detalhada:</h5>
                          <p className="text-emerald-200 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{analysis.analysis}</p>
                        </div>
                      )}

                      {analysis.price && (
                        <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-emerald-700/30">
                          <h5 className="font-medium text-emerald-300 mb-2 text-sm sm:text-base">💰 Preço Estimado:</h5>
                          <p className="text-lg sm:text-xl font-bold text-green-400">{analysis.price}</p>
                        </div>
                      )}

                      {analysis.recommendations && (
                        <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-emerald-700/30">
                          <h5 className="font-medium text-emerald-300 mb-2 text-sm sm:text-base">⭐ Recomendações:</h5>
                          <div className="space-y-2">
                            {analysis.recommendations.map((rec: string, index: number) => (
                              <p key={index} className="text-emerald-200 text-xs sm:text-sm">✓ {rec}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How it works */}
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Como Funciona</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">1. Fotografe</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Tire uma foto do código de barras do produto</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">2. Analisamos</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Nossa IA identifica e analisa o produto</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">3. Recomendamos</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Receba análise detalhada e recomendações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === 'compare' && <ProductComparison />}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Buscar Produtos com IA</CardTitle>
                  <CardDescription className="text-sm">Digite o nome do produto e receba recomendações categorizadas por custo-benefício, qualidade e premium</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Ex: molho de tomate, azeite, sabão em pó..." 
                        className="pl-10 mobile-form-input" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        disabled={isSearching} 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSearching || !searchQuery.trim()}
                      className="mobile-button mobile-button-primary"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        'Buscar'
                      )}
                    </Button>
                  </form>

                  {searchError && (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mt-4">
                      <p className="text-red-400 text-sm">{searchError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search Results */}
              {searchResult && (
                <Card className="border-gray-700 bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Recomendações: {searchResult.category}</CardTitle>
                    <CardDescription className="text-sm">3 opções categorizadas pela nossa IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} mb-6`}>
                      {/* Cost Benefit */}
                      <div className="border rounded-lg p-4 space-y-3 bg-blue-900/20 border-blue-700/50">
                        <div className="text-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                          </div>
                          <h4 className="font-medium text-blue-300 text-sm sm:text-base">💰 Melhor Custo-Benefício</h4>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-50 text-sm sm:text-base">{searchResult.products.cost_benefit.name}</h5>
                          <p className="text-xs sm:text-sm text-slate-400">{searchResult.products.cost_benefit.brand}</p>
                          <p className="text-base sm:text-lg font-bold text-green-400">{searchResult.products.cost_benefit.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.floor(searchResult.products.cost_benefit.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-slate-400">{searchResult.products.cost_benefit.rating}/5</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-300">{searchResult.products.cost_benefit.reason}</p>
                        <p className="text-xs text-slate-500">📍 {searchResult.products.cost_benefit.where_to_find}</p>
                      </div>

                      {/* Best Quality */}
                      <div className="border rounded-lg p-4 space-y-3 bg-orange-900/20 border-orange-700/50">
                        <div className="text-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                          </div>
                          <h4 className="font-medium text-orange-300 text-sm sm:text-base">⭐ Melhor Qualidade</h4>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-50 text-sm sm:text-base">{searchResult.products.best_quality.name}</h5>
                          <p className="text-xs sm:text-sm text-slate-400">{searchResult.products.best_quality.brand}</p>
                          <p className="text-base sm:text-lg font-bold text-green-400">{searchResult.products.best_quality.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.floor(searchResult.products.best_quality.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-slate-400">{searchResult.products.best_quality.rating}/5</span>
                        </div>
                        <p className="text-xs sm:text-sm text-orange-300">{searchResult.products.best_quality.reason}</p>
                        <p className="text-xs text-slate-500">📍 {searchResult.products.best_quality.where_to_find}</p>
                      </div>

                      {/* Premium */}
                      <div className="border rounded-lg p-4 space-y-3 bg-purple-900/20 border-purple-700/50">
                        <div className="text-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                          </div>
                          <h4 className="font-medium text-purple-300 text-sm sm:text-base">👑 Opção Premium</h4>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-50 text-sm sm:text-base">{searchResult.products.premium.name}</h5>
                          <p className="text-xs sm:text-sm text-slate-400">{searchResult.products.premium.brand}</p>
                          <p className="text-base sm:text-lg font-bold text-green-400">{searchResult.products.premium.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.floor(searchResult.products.premium.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-slate-400">{searchResult.products.premium.rating}/5</span>
                        </div>
                        <p className="text-xs sm:text-sm text-purple-300">{searchResult.products.premium.reason}</p>
                        <p className="text-xs text-slate-500">📍 {searchResult.products.premium.where_to_find}</p>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <Card className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-700/50">
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-emerald-400 flex items-center space-x-2 text-base sm:text-lg">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>🎯 Recomendação da IA</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-emerald-200 leading-relaxed text-sm sm:text-base">{searchResult.recommendation}</p>
                      </CardContent>
                    </Card>

                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          clearSearch();
                          setSearchQuery('');
                        }}
                        className="mobile-button mobile-button-secondary"
                      >
                        Nova Busca
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How it works */}
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Como Funciona a Busca</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">1. Digite o Produto</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Informe qual produto você está procurando</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">2. IA Analisa</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Nossa IA busca e categoriza as melhores opções</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base text-slate-50">3. Escolha Ideal</h4>
                      <p className="text-xs sm:text-sm text-slate-400">Receba 3 opções categorizadas para sua necessidade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Supermercado;
