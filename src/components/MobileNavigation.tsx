
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Scale, TrendingUp, Package, ShoppingCart, MapPin, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

const mobileMenuItems = [
  {
    title: 'Meus Assistentes',
    url: '/meus-assistentes',
    icon: LayoutDashboard,
    isPremium: false
  },
  {
    title: 'Meu Painel',
    url: '/dashboard',
    icon: LayoutDashboard,
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
    navigate(item.url);
  };

  const hasAccessToAssistant = () => {
    // Ambos os itens são sempre acessíveis
    return true;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
      {/* Safe area spacer */}
      <div className="pb-safe">
        <div className="grid grid-cols-2 gap-2 px-4 py-2">
          {mobileMenuItems.map((item) => {
            const isItemActive = isActive(item.url);
            const hasAccess = hasAccessToAssistant();

            return (
              <button
                key={item.title}
                onClick={() => handleNavigation(item)}
                disabled={!hasAccess}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium
                  transition-all duration-200 min-h-[48px] relative
                  ${isItemActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : hasAccess 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700' 
                      : 'text-gray-500 opacity-50'
                  }
                `}
              >
                <item.icon className="w-4 h-4 mb-1 flex-shrink-0" />
                <span className="text-[10px] leading-tight text-center truncate w-full px-0.5">
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
