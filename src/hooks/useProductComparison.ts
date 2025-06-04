
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductImage {
  id: string;
  file: File;
  preview: string;
}

interface ComparisonResult {
  products: Array<{
    name: string;
    brand: string;
    price: string;
    analysis: string;
    rating: number;
  }>;
  comparison: {
    winner_price: string;
    winner_quality: string;
    winner_overall: string;
    summary: string;
  };
}

export const useProductComparison = () => {
  const [selectedImages, setSelectedImages] = useState<ProductImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addImage = (file: File) => {
    if (selectedImages.length >= 3) {
      setError('Máximo de 3 produtos para comparação');
      return;
    }

    const id = Math.random().toString(36);
    const preview = URL.createObjectURL(file);
    
    setSelectedImages(prev => [...prev, { id, file, preview }]);
    setError(null);
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up preview URL
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const compareProducts = async () => {
    if (selectedImages.length < 2) {
      setError('Selecione pelo menos 2 produtos para comparar');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert images to base64
      const imagePromises = selectedImages.map(async (img) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(img.file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      const { data, error: functionError } = await supabase.functions.invoke('compare-products', {
        body: {
          images: base64Images,
          type: 'product_comparison'
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao comparar produtos');
      }

      setComparisonResult(data);
    } catch (err) {
      console.error('Error comparing products:', err);
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearComparison = () => {
    // Clean up preview URLs
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setComparisonResult(null);
    setError(null);
  };

  return {
    selectedImages,
    isAnalyzing,
    comparisonResult,
    error,
    addImage,
    removeImage,
    compareProducts,
    clearComparison
  };
};
