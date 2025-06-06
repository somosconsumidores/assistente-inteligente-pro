
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Scale, TrendingUp, Package, ShoppingCart, MapPin } from 'lucide-react';
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
    title: 'Direito',
    url: '/direito-consumidor',
    icon: Scale,
    isPremium: true
  },
  {
    title: 'Finanças',
    url: '/financas',
    icon: TrendingUp,
    isPremium: true
  },
  {
    title: 'Produtos',
    url: '/produtos',
    icon: Package,
    isPremium: true
  },
  {
    title: 'Mercado',
    url: '/supermercado',
    icon: ShoppingCart,
    isPremium: true
  },
  {
    title: 'Viagens',
    url: '/viagens',
    icon: MapPin,
    isPremium: true
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 safe-area-bottom">
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {mobileMenuItems.map((item) => {
          const isItemActive = isActive(item.url);
          const hasAccess = isPremiumUser || !item.isPremium || 
            (profile?.selected_assistant_id && 
             ((item.url === '/direito-consumidor' && profile.selected_assistant_id === 'direito') ||
              (item.url === '/financas' && profile.selected_assistant_id === 'financas') ||
              (item.url === '/produtos' && profile.selected_assistant_id === 'produtos') ||
              (item.url === '/supermercado' && profile.selected_assistant_id === 'supermercado') ||
              (item.url === '/viagens' && profile.selected_assistant_id === 'viagens')));

          return (
            <button
              key={item.title}
              onClick={() => handleNavigation(item)}
              disabled={!hasAccess}
              className={`
                flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium
                transition-all duration-200 touch-target min-h-[60px]
                ${isItemActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : hasAccess 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700' 
                    : 'text-gray-500 opacity-50'
                }
              `}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] leading-tight text-center">
                {item.title}
              </span>
              {!isPremiumUser && item.isPremium && !hasAccess && (
                <Badge variant="secondary" className="mt-1 text-[8px] px-1 py-0 h-4">
                  Premium
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
