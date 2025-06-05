import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Package, Trash2, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useSaveRecommendation } from '@/hooks/useSaveRecommendation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product/ProductCard';
import type { Json } from '@/integrations/supabase/types';

interface SavedRecommendation {
  id: string;
  query: string;
  recommendations: Json;
  featured_products: Json;
  created_at: string;
}

const SavedRecommendations: React.FC = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    deleteRecommendation,
    isLoading: deleteLoading
  } = useSaveRecommendation();
  const [recommendations, setRecommendations] = useState<SavedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('saved_product_recommendations').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as recomendações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const handleDelete = async (id: string) => {
    const success = await deleteRecommendation(id);
    if (success) {
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
    }
  };

  // Helper function to safely parse featured_products
  const getFeaturedProducts = (featuredProducts: Json): any[] => {
    if (Array.isArray(featuredProducts)) {
      return featuredProducts;
    }
    return [];
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-6">
            {Array.from({
            length: 3
          }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 bg-zinc-800 safe-area-top">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          {/* Back Button - Mobile Optimized */}
          <div className="mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-slate-50 hover:bg-gray-700 mobile-button p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Voltar ao Painel</span>
            </Button>
          </div>
          
          {/* Title Section - Mobile Optimized */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex-shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50 leading-tight">
                Recomendações Salvas
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1">
                {recommendations.length === 0 
                  ? 'Nenhuma recomendação salva' 
                  : recommendations.length === 1 
                  ? '1 recomendação salva' 
                  : `${recommendations.length} recomendações salvas`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {recommendations.length === 0 ? <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação salva</h3>
                <p className="mb-6">Use o Mestre dos Produtos para comparar produtos e salvar suas recomendações favoritas</p>
                <Button onClick={() => navigate('/produtos')} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Comparar Produtos
                </Button>
              </div>
            </CardContent>
          </Card> : <div className="space-y-6 sm:space-y-8">
            {recommendations.map(rec => {
          const featuredProducts = getFeaturedProducts(rec.featured_products);
          return <Card key={rec.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">
                          {rec.query}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(rec.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR
                      })}
                          </span>
                          {featuredProducts.length > 0 && <span className="text-green-600 font-medium">
                              {featuredProducts.length} {featuredProducts.length === 1 ? 'produto' : 'produtos'}
                            </span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rec.id)} disabled={deleteLoading} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {featuredProducts.length > 0 ? <div>
                        <h4 className="font-semibold mb-4 text-slate-50">Produtos Recomendados</h4>
                        <div className={`grid gap-6 ${featuredProducts.length === 1 ? 'md:grid-cols-1 max-w-md' : featuredProducts.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                          {featuredProducts.map((product, index) => <div key={`${rec.id}-${index}`} className="border rounded-lg p-4 bg-white">
                              <ProductCard product={{
                      id: product.id || `${rec.id}-${index}`,
                      name: product.name || 'Produto sem nome',
                      image: product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center',
                      price: product.price || 'Consulte',
                      scoreMestre: product.scoreMestre || 8.0,
                      seal: product.seal || 'recomendacao',
                      link: product.link
                    }} />
                            </div>)}
                        </div>
                      </div> : <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum produto salvo nesta recomendação</p>
                      </div>}
                  </CardContent>
                </Card>;
        })}
          </div>}
      </div>
    </div>;
};

export default SavedRecommendations;
