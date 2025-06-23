
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductSeal from './ProductSeal';
import ProductActions from './ProductActions';
import { ShoppingCart, TrendingUp } from 'lucide-react';

interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  scoreMestre: number;
  seal: 'melhor' | 'barato' | 'recomendacao';
  link?: string;
  priceConfidence?: 'real' | 'estimated';
  priceSource?: string;
  lastUpdated?: string;
}

interface ProductCardProps {
  product: FeaturedProduct;
}

const formatPrice = (price: string | number): string => {
  if (!price || price === 0 || price === '0') return 'Consulte';
  
  let numericPrice: number;
  
  if (typeof price === 'string') {
    // Remove any non-numeric characters except dots and commas
    const cleanPrice = price.replace(/[^\d.,]/g, '');
    // Replace comma with dot for parsing
    numericPrice = parseFloat(cleanPrice.replace(',', '.'));
  } else {
    numericPrice = price;
  }
  
  if (isNaN(numericPrice) || numericPrice === 0) return 'Consulte';
  
  // If the price seems to be in thousands (like 38 meaning 38000), multiply by 1000
  if (numericPrice < 100) {
    numericPrice = numericPrice * 1000;
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericPrice);
};

const getPriceConfidenceBadge = (confidence?: 'real' | 'estimated') => {
  if (confidence === 'real') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        <ShoppingCart className="w-3 h-3 mr-1" />
        Preço Real
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
      <TrendingUp className="w-3 h-3 mr-1" />
      Estimativa
    </Badge>
  );
};

const ProductCard = ({ product }: ProductCardProps) => {
  const sealComponent = ProductSeal({ seal: product.seal });
  
  const formattedPrice = formatPrice(product.price);

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br ${sealComponent.sealInfo.bgColor} border-2`}>
      <div className="relative">
        {/* Área visual sem imagem - apenas com gradiente e selo */}
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">{sealComponent.sealInfo.emoji}</div>
            <span className="text-sm font-medium">{sealComponent.sealInfo.label}</span>
          </div>
        </div>
        {sealComponent.component}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight text-gray-900 line-clamp-2">
          {product.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
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
        
        {/* Price confidence indicator */}
        <div className="mb-4 flex items-center justify-between">
          {getPriceConfidenceBadge(product.priceConfidence)}
          {product.priceSource && (
            <span className="text-xs text-gray-500">
              Fonte: {product.priceSource}
            </span>
          )}
        </div>
        
        {product.lastUpdated && (
          <div className="mb-3">
            <span className="text-xs text-gray-500">
              Atualizado: {new Date(product.lastUpdated).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        
        <ProductActions productName={product.name} productLink={product.link} />
      </CardContent>
    </Card>
  );
};

export default ProductCard;
