
import React from 'react';
import { Search, ImageOff, RefreshCw } from 'lucide-react';

interface ProductImageProps {
  productId: string;
  productName: string;
  imageUrl?: string;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

const ProductImage = ({ 
  productId, 
  productName, 
  imageUrl, 
  isLoading, 
  hasError, 
  onRetry 
}: ProductImageProps) => {
  const handleImageError = () => {
    // This will be handled by the parent component
  };

  return (
    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <Search className="w-8 h-8 animate-pulse text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Buscando imagem...</span>
        </div>
      ) : imageUrl ? (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {hasError && (
            <button
              onClick={onRetry}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md transition-colors"
              title="Buscar imagem novamente"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <ImageOff className="w-12 h-12 mb-2" />
          <span className="text-sm font-medium">Imagem Não Encontrada</span>
          <button
            onClick={onRetry}
            className="mt-2 bg-white/80 hover:bg-white p-1 rounded-full shadow-md transition-colors"
            title="Buscar imagem novamente"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
