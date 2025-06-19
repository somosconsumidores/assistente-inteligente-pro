
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import IntelligentChat from '@/components/IntelligentChat';

const ChatInteligente: React.FC = () => {
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
