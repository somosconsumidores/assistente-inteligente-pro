
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  headerAction?: React.ReactNode;
  compact?: boolean;
}

export function MobileOptimizedCard({
  title,
  children,
  isLoading = false,
  className,
  headerAction,
  compact = false
}: MobileOptimizedCardProps) {
  const { isMobile } = useMobileDeviceInfo();

  if (isLoading) {
    return (
      <Card className={cn(
        'border bg-card text-card-foreground',
        isMobile && 'mx-2 rounded-xl',
        className
      )}>
        <CardHeader className={isMobile && compact ? 'pb-2' : ''}>
          {title && <Skeleton className="h-6 w-32" />}
        </CardHeader>
        <CardContent className={isMobile && compact ? 'pt-0' : ''}>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'border bg-card text-card-foreground transition-all duration-200',
      isMobile && [
        'mx-2 rounded-xl shadow-lg',
        'hover:shadow-xl hover:bg-card/80'
      ],
      !isMobile && 'hover:shadow-md',
      className
    )}>
      {title && (
        <CardHeader className={cn(
          'flex flex-row items-center justify-between space-y-0',
          isMobile && compact ? 'pb-2 px-4 pt-4' : 'pb-3'
        )}>
          <CardTitle className={cn(
            'text-card-foreground',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </CardTitle>
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn(
        isMobile && compact && title ? 'pt-0 px-4 pb-4' : '',
        isMobile && !title ? 'p-4' : ''
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
