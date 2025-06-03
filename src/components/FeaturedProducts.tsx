
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './product/ProductCard';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  // Filter valid products
  const validProducts = products.filter(product => 
    product.name && 
    product.name.length >= 3 && 
    product.scoreMestre >= 1 && 
    product.scoreMestre <= 10
  );

  // Search for product images when they change
  useEffect(() => {
    const searchProductImages = async () => {
      for (const product of validProducts) {
        // Skip if we already have an image for this product or it's currently loading
        if (productImages[product.id] || loadingImages[product.id]) {
          continue;
        }

        setLoadingImages(prev => ({ ...prev, [product.id]: true }));
        setImageErrors(prev => ({ ...prev, [product.id]: false }));

        try {
          console.log('Searching for product image:', product.name);
          
          const { data, error } = await supabase.functions.invoke('search-product-images', {
            body: { productName: product.name }
          });

          if (error) {
            console.error('Error searching image for', product.name, ':', error);
            setImageErrors(prev => ({ ...prev, [product.id]: true }));
            setProductImages(prev => ({ ...prev, [product.id]: '' }));
          } else if (data?.imageUrl) {
            console.log('Product image found successfully for:', product.name);
            setProductImages(prev => ({
              ...prev,
              [product.id]: data.imageUrl
            }));
          } else {
            setImageErrors(prev => ({ ...prev, [product.id]: true }));
            setProductImages(prev => ({ ...prev, [product.id]: '' }));
          }
        } catch (err) {
          console.error('Error searching product image for', product.name, ':', err);
          setImageErrors(prev => ({ ...prev, [product.id]: true }));
          setProductImages(prev => ({ ...prev, [product.id]: '' }));
        } finally {
          setLoadingImages(prev => ({ ...prev, [product.id]: false }));
        }
      }
    };

    if (validProducts.length > 0) {
      searchProductImages();
    }
  }, [validProducts.map(p => p.id).join(',')]); // Only re-run if product IDs change

  const retryImageSearch = async (product: FeaturedProduct) => {
    setLoadingImages(prev => ({ ...prev, [product.id]: true }));
    setImageErrors(prev => ({ ...prev, [product.id]: false }));

    try {
      console.log('Retrying image search for:', product.name);
      
      const { data, error } = await supabase.functions.invoke('search-product-images', {
        body: { productName: product.name }
      });

      if (error) {
        throw error;
      }

      if (data?.imageUrl) {
        console.log('Image search retry successful for:', product.name);
        setProductImages(prev => ({
          ...prev,
          [product.id]: data.imageUrl
        }));
        setImageErrors(prev => ({ ...prev, [product.id]: false }));
      } else {
        setImageErrors(prev => ({ ...prev, [product.id]: true }));
        setProductImages(prev => ({ ...prev, [product.id]: '' }));
      }
    } catch (err) {
      console.error('Retry failed for', product.name, ':', err);
      setImageErrors(prev => ({ ...prev, [product.id]: true }));
      setProductImages(prev => ({ ...prev, [product.id]: '' }));
    } finally {
      setLoadingImages(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
    setProductImages(prev => ({ ...prev, [productId]: '' }));
  };

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Produtos em Destaque</h2>
        <p className="text-gray-600">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} pelo Mestre dos Produtos com imagens reais via Google Search
        </p>
      </div>
      
      <div className={`grid gap-6 ${
        validProducts.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
        validProducts.length === 2 ? 'md:grid-cols-2' : 
        'md:grid-cols-3'
      }`}>
        {validProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            imageUrl={productImages[product.id]}
            isImageLoading={loadingImages[product.id] || false}
            hasImageError={imageErrors[product.id] || false}
            onRetryImage={() => retryImageSearch(product)}
            onImageError={() => handleImageError(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
