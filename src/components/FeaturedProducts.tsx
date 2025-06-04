
import React from 'react';
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
  // Filter valid products
  const validProducts = products.filter(product => 
    product.name && 
    product.name.length >= 3 && 
    product.scoreMestre >= 1 && 
    product.scoreMestre <= 10
  );

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Produtos em Destaque</h2>
        <p className="text-gray-600">
          {validProducts.length === 1 ? '1 produto selecionado' : `${validProducts.length} produtos selecionados`} pelo Mestre dos Produtos
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
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
