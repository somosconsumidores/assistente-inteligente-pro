
import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

interface MobilePageTransitionProps {
  children: React.ReactNode;
  direction?: 'slide-left' | 'slide-right' | 'fade' | 'slide-up';
  className?: string;
}

export function MobilePageTransition({
  children,
  direction = 'fade',
  className
}: MobilePageTransitionProps) {
  const { isMobile } = useMobileDeviceInfo();

  const getTransitionClass = () => {
    if (!isMobile) return 'animate-fade-in';
    
    switch (direction) {
      case 'slide-left': return 'animate-slide-in-right';
      case 'slide-right': return 'animate-slide-in-left';
      case 'slide-up': return 'animate-slide-in-bottom';
      default: return 'animate-fade-in';
    }
  };

  return (
    <div className={cn(
      'w-full h-full',
      getTransitionClass(),
      className
    )}>
      {children}
    </div>
  );
}
