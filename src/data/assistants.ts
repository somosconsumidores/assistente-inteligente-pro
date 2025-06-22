
export interface Assistant {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  gradient: string;
  isPremium: boolean;
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
    isPremium: true
  },
  {
    id: 'direito-consumidor',
    title: 'Advogado do Consumidor',
    description: 'Especialista em defesa dos direitos do consumidor, análise de contratos e orientações legais.',
    icon: Scale,
    path: '/direito-consumidor',
    gradient: 'from-blue-500 to-blue-700',
    isPremium: false
  },
  {
    id: 'financas',
    title: 'Consultor Financeiro',
    description: 'Planejamento financeiro pessoal, organização de dívidas e controle de gastos na palma da mão.',
    icon: Calculator,
    path: '/financas',
    gradient: 'from-green-500 to-green-700',
    isPremium: true
  },
  {
    id: 'produtos',
    title: 'Mestre dos Produtos',
    description: 'Ajuda para escolher o melhor produto pelo melhor preço com base em avaliações e comparativos reais.',
    icon: Package,
    path: '/produtos',
    gradient: 'from-purple-500 to-purple-700',
    isPremium: true
  },
  {
    id: 'viagens',
    title: 'Consultor de Viagens',
    description: 'Planejamento de viagens, economia em passagens, melhores épocas e destinos com base no seu perfil.',
    icon: MapPin,
    path: '/viagens',
    gradient: 'from-orange-500 to-orange-700',
    isPremium: true
  },
  {
    id: 'supermercado',
    title: 'Assistente de Compras Domésticas',
    description: 'Listas inteligentes, sugestões econômicas e comparativos de mercado.',
    icon: ShoppingCart,
    path: '/supermercado',
    gradient: 'from-red-500 to-red-700',
    isPremium: true
  }
];
