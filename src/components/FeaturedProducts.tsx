import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, DollarSign, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  // Generate images for products when they change
  useEffect(() => {
    const generateImages = async () => {
      for (const product of validProducts) {
        // Skip if we already have an image for this product or it's currently loading
        if (productImages[product.id] || loadingImages[product.id]) {
          continue;
        }

        setLoadingImages(prev => ({ ...prev, [product.id]: true }));
        setImageErrors(prev => ({ ...prev, [product.id]: false }));

        try {
          console.log('Generating AI image for product:', product.name);
          
          const { data, error } = await supabase.functions.invoke('generate-product-image', {
            body: { productName: product.name }
          });

          if (error) {
            console.error('Error generating image for', product.name, ':', error);
            setImageErrors(prev => ({ ...prev, [product.id]: true }));
            // Use fallback image
            setProductImages(prev => ({
              ...prev,
              [product.id]: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
            }));
          } else if (data?.imageUrl) {
            console.log('AI image generated successfully for:', product.name);
            setProductImages(prev => ({
              ...prev,
              [product.id]: data.imageUrl
            }));
          } else {
            throw new Error('No image returned from API');
          }
        } catch (err) {
          console.error('Error generating AI image for', product.name, ':', err);
          setImageErrors(prev => ({ ...prev, [product.id]: true }));
          // Use fallback image
          setProductImages(prev => ({
            ...prev,
            [product.id]: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
          }));
        } finally {
          setLoadingImages(prev => ({ ...prev, [product.id]: false }));
        }
      }
    };

    if (validProducts.length > 0) {
      generateImages();
    }
  }, [validProducts.map(p => p.id).join(',')]); // Only re-run if product IDs change

  const retryImageGeneration = async (product: FeaturedProduct) => {
    setLoadingImages(prev => ({ ...prev, [product.id]: true }));
    setImageErrors(prev => ({ ...prev, [product.id]: false }));

    try {
      console.log('Retrying AI image generation for:', product.name);
      
      const { data, error } = await supabase.functions.invoke('generate-product-image', {
        body: { productName: product.name }
      });

      if (error) {
        throw error;
      }

      if (data?.imageUrl) {
        console.log('AI image retry successful for:', product.name);
        setProductImages(prev => ({
          ...prev,
          [product.id]: data.imageUrl
        }));
        setImageErrors(prev => ({ ...prev, [product.id]: false }));
      }
    } catch (err) {
      console.error('Retry failed for', product.name, ':', err);
      setImageErrors(prev => ({ ...prev, [product.id]: true }));
    } finally {
      setLoadingImages(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (validProducts.length === 0) {
    return null;
  }

  const getSealInfo = (seal: string) => {
    switch (seal) {
      case 'melhor':
        return {
          label: 'Melhor da Avaliação',
          emoji: '🏆',
          description: 'Melhor desempenho técnico',
          color: 'bg-yellow-500 text-white',
          bgColor: 'from-yellow-50 to-orange-50',
          icon: <Award className="w-4 h-4" />
        };
      case 'barato':
        return {
          label: 'Barato da Avaliação',
          emoji: '💰',
          description: 'Melhor custo-benefício',
          color: 'bg-green-500 text-white',
          bgColor: 'from-green-50 to-emerald-50',
          icon: <DollarSign className="w-4 h-4" />
        };
      case 'recomendacao':
        return {
          label: 'Nossa Recomendação',
          emoji: '⭐',
          description: 'Melhor equilíbrio geral',
          color: 'bg-blue-500 text-white',
          bgColor: 'from-blue-50 to-indigo-50',
          icon: <Star className="w-4 h-4" />
        };
      default:
        return {
          label: 'Produto',
          emoji: '',
          description: '',
          color: 'bg-gray-500 text-white',
          bgColor: 'from-gray-50 to-slate-50',
          icon: null
        };
    }
  };

  const handleVerOfertas = (product: FeaturedProduct) => {
    if (product.link) {
      window.open(product.link, '_blank');
    } else {
      // Fallback: search for the product on Google Shopping
      const searchQuery = encodeURIComponent(product.name);
      window.open(`https://www.google.com/search?q=${searchQuery}&tbm=shop`, '_blank');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Produtos em Destaque</h2>
        <p className="text-gray-600">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} pelo Mestre dos Produtos com base em análise técnica e avaliações
        </p>
      </div>
      
      <div className={`grid gap-6 ${
        validProducts.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
        validProducts.length === 2 ? 'md:grid-cols-2' : 
        'md:grid-cols-3'
      }`}>
        {validProducts.map((product) => {
          const sealInfo = getSealInfo(product.seal);
          const isImageLoading = loadingImages[product.id];
          const hasImageError = imageErrors[product.id];
          const productImage = productImages[product.id] || product.image;
          
          return (
            <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br ${sealInfo.bgColor} border-2`}>
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {isImageLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Gerando imagem IA...</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center';
                        }}
                      />
                      {hasImageError && (
                        <button
                          onClick={() => retryImageGeneration(product)}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md transition-colors"
                          title="Tentar gerar imagem novamente"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <Badge className={`absolute top-3 left-3 ${sealInfo.color} shadow-lg`}>
                  <div className="flex items-center gap-1">
                    {sealInfo.icon}
                    <span className="text-xs font-semibold">{sealInfo.emoji} {sealInfo.label}</span>
                  </div>
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight text-gray-900 line-clamp-2">
                  {product.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Preço Médio</p>
                    <p className="text-xl font-bold text-green-600">{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score Mestre</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-orange-600">
                        {typeof product.scoreMestre === 'number' ? product.scoreMestre.toFixed(1) : '8.0'}
                      </span>
                      <span className="text-sm text-gray-500">/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerOfertas(product)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Ofertas
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;
