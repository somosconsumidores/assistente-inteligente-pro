
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileNavigation } from './MobileNavigation';
import { ConnectionIndicator } from './mobile/ConnectionIndicator';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from './mobile/PullToRefreshIndicator';
import { MobilePageTransition } from './mobile/MobilePageTransition';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  enablePullToRefresh?: boolean;
}

export function DashboardLayout({ 
  children, 
  onRefresh,
  enablePullToRefresh = false 
}: DashboardLayoutProps) {
  const { isMobile } = useMobileDeviceInfo();
  
  const { ref: pullToRefreshRef, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: onRefresh || (() => {}),
    enabled: enablePullToRefresh && isMobile
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        {!isMobile && <AppSidebar />}
        <main className="flex-1 flex flex-col min-w-0" ref={pullToRefreshRef}>
          <header className="sticky top-0 z-40 border-b border-gray-800 mobile-padding h-12 sm:h-14 flex items-center gap-3 sm:gap-4 bg-gray-900/95 backdrop-blur-md">
            {!isMobile && <SidebarTrigger className="text-slate-50 touch-target" />}
            <div className="flex-1" />
          </header>
          
          <MobilePageTransition>
            <div className={`flex-1 bg-gray-900 ${isMobile ? 'pb-20' : ''}`}>
              {children}
            </div>
          </MobilePageTransition>
        </main>
      </div>
      
      <MobileNavigation />
      <ConnectionIndicator />
      
      {enablePullToRefresh && (
        <PullToRefreshIndicator 
          isRefreshing={isRefreshing} 
          pullDistance={pullDistance} 
        />
      )}
    </SidebarProvider>
  );
}
