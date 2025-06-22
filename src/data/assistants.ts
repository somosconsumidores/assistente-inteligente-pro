
export interface Assistant {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  gradient: string;
  isPremium: boolean;
  bgColor: string;
  color: string;
  benefits: string[];
}

import { Scale, Calculator, Package, MapPin, ShoppingCart, MessageSquare } from 'lucide-react';

export const assistants: Assistant[] = [
  {
    id: 'chat-inteligente',
    title: 'Chat Inteligente IA',
    description: 'IA conversacional avançada com geração de imagens, análise de documentos e transformação de fotos. Economize US$ 20/mês do ChatGPT Plus!',
    icon: MessageSquare,
    path: '/chat-inteligente',
    gradient: 'from-indigo-500 to-purple-700',
    isPremium: true,
    bgColor: 'from-indigo-900/20 to-purple-900/20',
    color: 'from-indigo-500 to-purple-700',
    benefits: [
      'Conversação avançada com IA',
      'Geração de imagens por IA',
      'Análise de documentos PDF',
      'Transformação de fotos',
      'Respostas contextualmente inteligentes'
    ]
  },
  {
    id: 'direito-consumidor',
    title: 'Advogado do Consumidor',
    description: 'Especialista em defesa dos direitos do consumidor, análise de contratos e orientações legais.',
    icon: Scale,
    path: '/direito-consumidor',
    gradient: 'from-blue-500 to-blue-700',
    isPremium: false,
    bgColor: 'from-blue-900/20 to-blue-800/20',
    color: 'from-blue-500 to-blue-700',
    benefits: [
      'Análise de contratos detalhada',
      'Orientações legais especializadas',
      'Defesa dos direitos do consumidor',
      'Geração de petições jurídicas',
      'Consultoria jurídica personalizada'
    ]
  },
  {
    id: 'financas',
    title: 'Consultor Financeiro',
    description: 'Planejamento financeiro pessoal, organização de dívidas e controle de gastos na palma da mão.',
    icon: Calculator,
    path: '/financas',
    gradient: 'from-green-500 to-green-700',
    isPremium: true,
    bgColor: 'from-green-900/20 to-green-800/20',
    color: 'from-green-500 to-green-700',
    benefits: [
      'Planejamento financeiro personalizado',
      'Organização inteligente de dívidas',
      'Controle detalhado de gastos',
      'Estratégias de investimento',
      'Relatórios financeiros completos'
    ]
  },
  {
    id: 'produtos',
    title: 'Mestre dos Produtos',
    description: 'Ajuda para escolher o melhor produto pelo melhor preço com base em avaliações e comparativos reais.',
    icon: Package,
    path: '/produtos',
    gradient: 'from-purple-500 to-purple-700',
    isPremium: true,
    bgColor: 'from-purple-900/20 to-purple-800/20',
    color: 'from-purple-500 to-purple-700',
    benefits: [
      'Comparação inteligente de produtos',
      'Análise de custo-benefício',
      'Recomendações personalizadas',
      'Histórico de preços',
      'Avaliações e reviews detalhados'
    ]
  },
  {
    id: 'viagens',
    title: 'Consultor de Viagens',
    description: 'Planejamento de viagens, economia em passagens, melhores épocas e destinos com base no seu perfil.',
    icon: MapPin,
    path: '/viagens',
    gradient: 'from-orange-500 to-orange-700',
    isPremium: true,
    bgColor: 'from-orange-900/20 to-orange-800/20',
    color: 'from-orange-500 to-orange-700',
    benefits: [
      'Roteiros personalizados',
      'Economia em passagens aéreas',
      'Sugestões de hospedagem',
      'Planejamento de atividades',
      'Dicas de destinos exclusivos'
    ]
  },
  {
    id: 'supermercado',
    title: 'Assistente de Compras Domésticas',
    description: 'Listas inteligentes, sugestões econômicas e comparativos de mercado.',
    icon: ShoppingCart,
    path: '/supermercado',
    gradient: 'from-red-500 to-red-700',
    isPremium: true,
    bgColor: 'from-red-900/20 to-red-800/20',
    color: 'from-red-500 to-red-700',
    benefits: [
      'Listas de compras inteligentes',
      'Comparativos de preços',
      'Sugestões econômicas',
      'Planejamento de refeições',
      'Controle de gastos domésticos'
    ]
  }
];
