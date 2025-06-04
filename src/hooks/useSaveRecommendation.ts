
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

export const useSaveRecommendation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const saveRecommendation = async (
    query: string,
    recommendations: any,
    featuredProducts: FeaturedProduct[]
  ) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar recomendações",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Convert FeaturedProduct[] to JSON-compatible format
      const featuredProductsJson = featuredProducts.map(product => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        scoreMestre: product.scoreMestre,
        seal: product.seal,
        link: product.link || null
      }));

      const { error } = await supabase
        .from('saved_product_recommendations')
        .insert({
          user_id: user.id,
          query,
          recommendations: recommendations as any,
          featured_products: featuredProductsJson as any
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Recomendação salva no seu painel",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar recomendação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a recomendação",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecommendation = async (id: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('saved_product_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Recomendação removida do painel",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar recomendação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a recomendação",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveRecommendation,
    deleteRecommendation,
    isLoading
  };
};
