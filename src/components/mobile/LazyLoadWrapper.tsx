
import React from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string | number;
  className?: string;
  enabled?: boolean;
}

export function LazyLoadWrapper({
  children,
  fallback,
  height = '200px',
  className,
  enabled = true
}: LazyLoadWrapperProps) {
  const { ref, hasLoaded } = useLazyLoad({ enabled });

  const defaultFallback = (
    <div 
      style={{ height }} 
      className={`flex items-center justify-center ${className || ''}`}
    >
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : (fallback || defaultFallback)}
    </div>
  );
}
