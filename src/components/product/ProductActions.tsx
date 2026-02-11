
import React from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface ProductActionsProps {
  productName: string;
  productLink?: string;
}

const ProductActions = ({ productName, productLink }: ProductActionsProps) => {
  const searchQuery = encodeURIComponent(productName);

  const handleMercadoLivre = () => {
    if (productLink && productLink.includes('mercadolivre')) {
      window.open(productLink, '_blank');
    } else {
      window.open(`https://lista.mercadolivre.com.br/${searchQuery}`, '_blank');
    }
  };

  const handleAmazon = () => {
    if (productLink && productLink.includes('amazon')) {
      window.open(productLink, '_blank');
    } else {
      window.open(`https://www.amazon.com.br/s?k=${searchQuery}`, '_blank');
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleMercadoLivre}
        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Mercado Livre
      </button>
      <button 
        onClick={handleAmazon}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        Amazon
      </button>
    </div>
  );
};

export default ProductActions;
