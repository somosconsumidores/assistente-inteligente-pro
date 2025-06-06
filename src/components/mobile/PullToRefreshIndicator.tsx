
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  threshold?: number;
}

export function PullToRefreshIndicator({
  isRefreshing,
  pullDistance,
  threshold = 100
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 20 || isRefreshing;

  if (!shouldShow) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4">
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 bg-gray-800/90 backdrop-blur-sm rounded-full',
        'border border-gray-600 text-slate-50 text-sm',
        'transition-all duration-200 animate-slide-in-bottom'
      )}>
        <RefreshCw 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isRefreshing && 'animate-spin',
            !isRefreshing && progress >= 1 && 'rotate-180'
          )}
          style={{
            transform: !isRefreshing ? `rotate(${progress * 180}deg)` : undefined
          }}
        />
        <span>
          {isRefreshing ? 'Atualizando...' : progress >= 1 ? 'Solte para atualizar' : 'Puxe para atualizar'}
        </span>
      </div>
    </div>
  );
}
