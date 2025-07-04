
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Crown, LogOut, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

const mobileMenuItems = [
  {
    title: 'Meus Assistentes',
    url: '/meus-assistentes',
    icon: Users,
    isPremium: false,
    type: 'navigation'
  },
  {
    title: 'Meu Painel',
    url: '/dashboard',
    icon: LayoutDashboard,
    isPremium: false,
    type: 'navigation'
  },
  {
    title: 'Plano',
    url: null,
    icon: Crown,
    isPremium: false,
    type: 'plan'
  },
  {
    title: 'Sair',
    url: null,
    icon: LogOut,
    isPremium: false,
    type: 'logout'
  }
];

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const { isMobile } = useMobileDeviceInfo();

  if (!isMobile) return null;

  const isPremiumUser = profile?.plan === 'premium';

  const isActive = (path: string) => {
    if (!path) return false;
    const pathWithoutQuery = path.split('?')[0];
    const currentPathWithoutQuery = location.pathname;
    return currentPathWithoutQuery === pathWithoutQuery;
  };

  const handleItemClick = async (item: typeof mobileMenuItems[0]) => {
    if (item.type === 'navigation') {
      navigate(item.url);
    } else if (item.type === 'logout') {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
    // Para 'plan' não fazemos nada por enquanto, apenas mostra o status
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
      {/* Safe area spacer */}
      <div className="pb-safe">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {mobileMenuItems.map((item) => {
            const isItemActive = isActive(item.url);
            const isDisabled = false; // Todos os itens estão sempre acessíveis

            return (
              <button
                key={item.title}
                onClick={() => handleItemClick(item)}
                disabled={isDisabled}
                className={`
                  flex flex-col items-center justify-center p-1 rounded-lg text-xs font-medium
                  transition-all duration-200 min-h-[48px] relative
                  ${isItemActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700'
                  }
                `}
              >
                <item.icon className="w-4 h-4 mb-1 flex-shrink-0" />
                <span className="text-[9px] leading-tight text-center truncate w-full px-0.5">
                  {item.type === 'plan' ? (isPremiumUser ? 'Premium' : 'Gratuito') : item.title}
                </span>
                {item.type === 'plan' && isPremiumUser && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[6px] px-1 py-0 h-3 min-w-0 bg-yellow-500 text-yellow-900">
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
