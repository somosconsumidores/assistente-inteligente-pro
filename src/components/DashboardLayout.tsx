import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({
  children
}: DashboardLayoutProps) {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b border-gray-200 px-4 h-14 flex items-center gap-4 bg-zinc-800">
            <SidebarTrigger className="text-slate-50" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 bg-zinc-800">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>;
}