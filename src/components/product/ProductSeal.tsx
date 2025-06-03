
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, DollarSign, Star } from 'lucide-react';

interface ProductSealProps {
  seal: 'melhor' | 'barato' | 'recomendacao';
}

const ProductSeal = ({ seal }: ProductSealProps) => {
  const getSealInfo = (sealType: string) => {
    switch (sealType) {
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

  const sealInfo = getSealInfo(seal);

  return {
    sealInfo,
    component: (
      <Badge className={`absolute top-3 left-3 ${sealInfo.color} shadow-lg`}>
        <div className="flex items-center gap-1">
          {sealInfo.icon}
          <span className="text-xs font-semibold">{sealInfo.emoji} {sealInfo.label}</span>
        </div>
      </Badge>
    )
  };
};

export default ProductSeal;
