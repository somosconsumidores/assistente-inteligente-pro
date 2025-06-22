
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, MessageSquare } from 'lucide-react';

export interface Assistant {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  path: string;
  benefits: string[];
  isPremium: boolean;
}

export const assistants: Assistant[] = [
  {
    id: 'chat-inteligente',
    title: 'Chat Inteligente IA',
    description: 'IA conversacional avançada com geração de imagens, análise de documentos e transformação de fotos. Economize US$ 20/mês do ChatGPT Plus!',
    icon: MessageSquare,
    color: 'from-indigo-400 to-purple-400',
    bgColor: 'from-indigo-900/20 to-purple-900/20',
    path: '/chat-inteligente',
    benefits: ['Geração de imagens ilimitada', 'Análise de documentos e PDFs', 'Transformação de fotos com IA'],
    isPremium: true
  },
  {
    id: 'direito',
    title: 'Mestre do Direito do Consumidor',
    description: 'Advogado pessoal para questões de consumo, petições e orientação jurídica.',
    icon: Scale,
    color: 'from-blue-400 to-purple-400',
    bgColor: 'from-blue-900/20 to-purple-900/20',
    path: '/direito-consumidor',
    benefits: ['Consultoria jurídica 24/7', 'Geração de petições', 'Guia passo a passo'],
    isPremium: false
  },
  {
    id: 'financas',
    title: 'Mestre das Finanças',
    description: 'Planejador financeiro que cria planos de recuperação e metas personalizadas.',
    icon: DollarSign,
    color: 'from-green-400 to-blue-400',
    bgColor: 'from-green-900/20 to-blue-900/20',
    path: '/financas',
    benefits: ['Plano financeiro personalizado', 'Dashboard de controle', 'Metas inteligentes'],
    isPremium: true
  },
  {
    id: 'produtos',
    title: 'Mestre dos Produtos',
    description: 'Consultor de compras que compara produtos e recomenda a melhor escolha.',
    icon: ShoppingCart,
    color: 'from-orange-400 to-red-400',
    bgColor: 'from-orange-900/20 to-red-900/20',
    path: '/produtos',
    benefits: ['Comparação inteligente', 'Análise de custo-benefício', 'Recomendações precisas'],
    isPremium: true
  },
  {
    id: 'viagens',
    title: 'Mestre das Viagens',
    description: 'Planejador completo que cria roteiros personalizados para suas viagens.',
    icon: Plane,
    color: 'from-sky-400 to-indigo-400',
    bgColor: 'from-sky-900/20 to-indigo-900/20',
    path: '/viagens',
    benefits: ['Roteiros personalizados', 'Sugestões de hospedagem', 'Planejamento completo'],
    isPremium: true
  },
  {
    id: 'supermercado',
    title: 'Mestre do Supermercado',
    description: 'Avaliador de produtos que compara qualidade, preço e recomenda opções.',
    icon: ShoppingBasket,
    color: 'from-emerald-400 to-green-400',
    bgColor: 'from-emerald-900/20 to-green-900/20',
    path: '/supermercado',
    benefits: ['Scanner de produtos', 'Comparação de qualidade', 'Escolhas inteligentes'],
    isPremium: true
  }
];
