
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductSeal from './ProductSeal';
import ProductImage from './ProductImage';
import ProductActions from './ProductActions';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
}

interface ProductCardProps {
  product: FeaturedProduct;
  imageUrl?: string;
  isImageLoading: boolean;
  hasImageError: boolean;
  onRetryImage: () => void;
  onImageError: () => void;
}

const formatPrice = (price: number): string => {
  if (!price || price === 0) return 'Consulte';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const ProductCard = ({ 
  product, 
  imageUrl, 
  isImageLoading, 
  hasImageError, 
  onRetryImage,
  onImageError
}: ProductCardProps) => {
  const sealComponent = ProductSeal({ seal: product.seal });
  
  // Parse the price correctly - it should already be a number in the database
  const priceValue = typeof product.price === 'string' 
    ? parseFloat(product.price.replace(/[^\d.,]/g, '').replace(',', '.')) 
    : product.price;
  
  const formattedPrice = typeof priceValue === 'number' ? formatPrice(priceValue) : product.price;

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br ${sealComponent.sealInfo.bgColor} border-2`}>
      <div className="relative">
        <ProductImage
          productId={product.id}
          productName={product.name}
          imageUrl={imageUrl}
          isLoading={isImageLoading}
          hasError={hasImageError}
          onRetry={onRetryImage}
        />
        {sealComponent.component}
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
            <p className="text-xl font-bold text-green-600">{formattedPrice}</p>
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
        
        <ProductActions productName={product.name} productLink={product.link} />
      </CardContent>
    </Card>
  );
};

export default ProductCard;
