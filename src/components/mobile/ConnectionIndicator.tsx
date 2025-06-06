
import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ConnectionIndicator() {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();
  const { isMobile } = useMobileDeviceInfo();

  if (!isMobile || isOnline && !isSlowConnection) return null;

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isSlowConnection) return <Signal className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getMessage = () => {
    if (!isOnline) return 'Sem conexão';
    if (isSlowConnection) return 'Conexão lenta';
    return 'Online';
  };

  const getColor = () => {
    if (!isOnline) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (isSlowConnection) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm',
      'text-xs font-medium animate-slide-in-right',
      getColor()
    )}>
      {getIcon()}
      <span>{getMessage()}</span>
    </div>
  );
}
