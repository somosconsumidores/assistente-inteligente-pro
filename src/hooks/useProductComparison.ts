
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resizeImage, validateImageFile } from '@/utils/imageUtils';

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

  const addImage = async (file: File) => {
    console.log('Adding image:', file.name, 'Size:', file.size);
    
    if (selectedImages.length >= 3) {
      setError('Máximo de 3 produtos para comparação');
      return;
    }

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Arquivo inválido');
      return;
    }

    try {
      const id = Math.random().toString(36);
      const preview = URL.createObjectURL(file);
      
      setSelectedImages(prev => [...prev, { id, file, preview }]);
      setError(null);
      console.log('Image added successfully');
    } catch (err) {
      console.error('Error adding image:', err);
      setError('Erro ao adicionar imagem');
    }
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
    console.log('Starting product comparison with', selectedImages.length, 'images');

    try {
      // Convert images to optimized base64
      console.log('Converting and optimizing images...');
      const imagePromises = selectedImages.map(async (img, index) => {
        console.log(`Processing image ${index + 1}:`, img.file.name);
        try {
          const optimizedImage = await resizeImage(img.file, 800, 600, 0.7);
          console.log(`Image ${index + 1} optimized successfully`);
          return optimizedImage;
        } catch (err) {
          console.error(`Error optimizing image ${index + 1}:`, err);
          // Fallback to original file conversion
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(img.file);
          });
        }
      });

      const base64Images = await Promise.all(imagePromises);
      console.log('All images processed, total payload size:', 
        base64Images.reduce((sum, img) => sum + img.length, 0));

      console.log('Calling compare-products edge function...');
      const { data, error: functionError } = await supabase.functions.invoke('compare-products', {
        body: {
          images: base64Images,
          type: 'product_comparison'
        }
      });

      console.log('Edge function response received');

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Erro ao comparar produtos');
      }

      if (!data) {
        console.error('No data received from edge function');
        throw new Error('Nenhum dado retornado da análise');
      }

      console.log('Comparison successful:', data);
      setComparisonResult(data);
    } catch (err) {
      console.error('Error in compareProducts:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Erro inesperado';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Operação demorou muito. Tente com imagens menores.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Falha na comunicação com o servidor. Tente novamente em alguns segundos.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
