
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ProductActionsProps {
  productName: string;
  productLink?: string;
}

const ProductActions = ({ productName, productLink }: ProductActionsProps) => {
  const handleVerOfertas = () => {
    if (productLink) {
      window.open(productLink, '_blank');
    } else {
      // Fallback: search for the product on Google Shopping
      const searchQuery = encodeURIComponent(productName);
      window.open(`https://www.google.com/search?q=${searchQuery}&tbm=shop`, '_blank');
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleVerOfertas}
        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Ver Ofertas
      </button>
    </div>
  );
};

export default ProductActions;
