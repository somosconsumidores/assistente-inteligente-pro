
import { useState, useCallback } from 'react';
import { useSwipeGestures } from './useSwipeGestures';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 100,
  enabled = true
}: PullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleRefresh = useCallback(async () => {
    if (!enabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, enabled, isRefreshing]);

  const swipeRef = useSwipeGestures({
    onSwipeDown: () => {
      if (enabled && window.scrollY === 0) {
        handleRefresh();
      }
    }
  });

  return {
    ref: swipeRef,
    isRefreshing,
    pullDistance,
    refresh: handleRefresh
  };
}
