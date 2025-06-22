
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Scale, TrendingUp, Package, ShoppingCart, MapPin, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

const mobileMenuItems = [
  {
    title: 'Painel',
    url: '/dashboard',
    icon: LayoutDashboard,
    isPremium: false
  },
  {
    title: 'Chat IA',
    url: '/chat-inteligente',
    icon: MessageSquare,
    isPremium: true
  },
  {
    title: 'Direito',
    url: '/direito-consumidor',
    icon: Scale,
    isPremium: false
  },
  {
    title: 'Finanças',
    url: '/financas',
    icon: TrendingUp,
    isPremium: false
  },
  {
    title: 'Produtos',
    url: '/produtos',
    icon: Package,
    isPremium: false
  },
  {
    title: 'Mercado',
    url: '/supermercado',
    icon: ShoppingCart,
    isPremium: false
  },
  {
    title: 'Viagens',
    url: '/viagens',
    icon: MapPin,
    isPremium: false
  }
];

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isMobile } = useMobileDeviceInfo();

  if (!isMobile) return null;

  const isPremiumUser = profile?.plan === 'premium';

  const isActive = (path: string) => {
    const pathWithoutQuery = path.split('?')[0];
    const currentPathWithoutQuery = location.pathname;
    return currentPathWithoutQuery === pathWithoutQuery;
  };

  const handleNavigation = (item: typeof mobileMenuItems[0]) => {
    if (item.url === '/viagens') {
      navigate('/viagens?tab=planner', { replace: true });
    } else {
      navigate(item.url);
    }
  };

  const hasAccessToAssistant = (item: typeof mobileMenuItems[0]) => {
    // Chat Inteligente é premium only
    if (item.url === '/chat-inteligente') {
      return isPremiumUser;
    }
    
    // Outros assistentes: premium users têm acesso total, free users precisam ter selecionado
    if (isPremiumUser) return true;
    
    if (!profile?.selected_assistant_id) return false;
    
    // Mapear URLs para IDs dos assistentes
    const urlToAssistantId: { [key: string]: string } = {
      '/direito-consumidor': 'direito-consumidor',
      '/financas': 'financas',
      '/produtos': 'produtos',
      '/supermercado': 'supermercado',
      '/viagens': 'viagens'
    };
    
    const assistantId = urlToAssistantId[item.url];
    return assistantId === profile.selected_assistant_id;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
      {/* Safe area spacer */}
      <div className="pb-safe">
        <div className="grid grid-cols-7 gap-0.5 px-1 py-2">
          {mobileMenuItems.map((item) => {
            const isItemActive = isActive(item.url);
            const hasAccess = hasAccessToAssistant(item);

            return (
              <button
                key={item.title}
                onClick={() => handleNavigation(item)}
                disabled={!hasAccess}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium
                  transition-all duration-200 min-h-[64px] relative
                  ${isItemActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : hasAccess 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700' 
                      : 'text-gray-500 opacity-50'
                  }
                `}
              >
                <item.icon className="w-4 h-4 mb-1 flex-shrink-0" />
                <span className="text-[8px] leading-tight text-center truncate w-full px-0.5">
                  {item.title}
                </span>
                {!hasAccess && item.isPremium && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[6px] px-1 py-0 h-3 min-w-0">
                    Pro
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
