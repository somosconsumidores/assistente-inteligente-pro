
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import IntelligentChat from '@/components/IntelligentChat';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatInteligente: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 overflow-hidden">
          <IntelligentChat />
        </div>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <IntelligentChat />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatInteligente;
