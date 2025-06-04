import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { LayoutDashboard, Scale, TrendingUp, Package, ShoppingCart, MapPin, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const menuItems = [{
  title: 'Meu Painel',
  url: '/dashboard',
  icon: LayoutDashboard,
  isPremium: false
}, {
  title: 'Mestre do Direito do Consumidor',
  url: '/direito-consumidor',
  icon: Scale,
  isPremium: true
}, {
  title: 'Mestre das Finanças',
  url: '/financas',
  icon: TrendingUp,
  isPremium: true
}, {
  title: 'Mestre dos Produtos',
  url: '/produtos',
  icon: Package,
  isPremium: true
}, {
  title: 'Assistente de Compras no Supermercado',
  url: '/supermercado',
  icon: ShoppingCart,
  isPremium: true
}, {
  title: 'Consultor de Viagens',
  url: '/viagens',
  icon: MapPin,
  isPremium: true
}];
export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    profile,
    logout
  } = useAuth();
  const {
    state
  } = useSidebar();
  const isActive = (path: string) => location.pathname === path;
  const isPremiumUser = profile?.plan === 'premium';
  const isCollapsed = state === 'collapsed';
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  const getPlanBadge = (isPremium: boolean) => {
    if (!isPremium) return null;
    if (isPremiumUser) {
      return <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800 border-yellow-200">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>;
    }
    return;
  };
  return <Sidebar className="bg-slate-900 border-slate-700">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && <div>
              <h2 className="text-lg font-bold text-white">AssistIA</h2>
              <p className="text-xs text-slate-400">Seus assistentes inteligentes</p>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            {!isCollapsed && 'Navegação'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)} className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive(item.url) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                      ${!isPremiumUser && item.isPremium ? 'opacity-75' : ''}
                    `}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <>
                        <span className="flex-1 text-left text-sm font-medium text-slate-600">
                          {item.title}
                        </span>
                        {getPlanBadge(item.isPremium)}
                      </>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-700">
        {!isCollapsed && profile && <div className="mb-4 p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {profile.name || 'Usuário'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={isPremiumUser ? "default" : "secondary"} className={`text-xs ${isPremiumUser ? 'bg-yellow-500 text-yellow-900' : 'bg-gray-600 text-gray-200'}`}>
                    {isPremiumUser ? 'Premium' : 'Gratuito'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>}
        
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800">
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>;
}