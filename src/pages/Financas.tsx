
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Lightbulb, RefreshCw, MessageCircle } from 'lucide-react';
import FinancialChat from '@/components/FinancialChat';
import FinancialDashboard from '@/components/FinancialDashboard';
import FinancialInsights from '@/components/FinancialInsights';
import { FinancialData } from '@/hooks/useFinancialChat';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFinancialDataStorage } from '@/hooks/useFinancialDataStorage';

const Financas = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [hasCompletedChat, setHasCompletedChat] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const isMobile = useIsMobile();

  const { loadFinancialData, deleteFinancialData } = useFinancialDataStorage();

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      const existingData = await loadFinancialData();
      if (existingData) {
        setFinancialData(existingData);
        setHasCompletedChat(true);
        setActiveTab('dashboard');
      }
      setIsLoadingData(false);
    };

    loadExistingData();
  }, [loadFinancialData]);

  const handleChatComplete = (data: FinancialData) => {
    setFinancialData(data);
    setHasCompletedChat(true);
    setActiveTab('dashboard');
  };

  const resetExperience = async () => {
    // Delete saved data
    await deleteFinancialData();
    setFinancialData(null);
    setHasCompletedChat(false);
    setActiveTab('chat');
  };

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando seus dados financeiros...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Mobile-optimized content wrapper */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 safe-area-bottom">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">Mestre das Finanças</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Seu consultor financeiro pessoal
                </p>
              </div>
            </div>
            
            {hasCompletedChat && (
              <Button 
                onClick={resetExperience} 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="mobile-button-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            )}
          </div>

          {/* Welcome Card - Apenas se não completou o chat */}
          {!hasCompletedChat && activeTab === 'chat' && (
            <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Bem-vindo ao seu Consultor Financeiro Pessoal! 🎯</CardTitle>
                <CardDescription className="text-white/90 text-sm sm:text-base">
                  Vou te ajudar a organizar suas finanças de forma simples e personalizada. 
                  Através de uma conversa, vou entender sua situação e criar um plano sob medida para você.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Welcome back card for returning users */}
          {hasCompletedChat && activeTab === 'dashboard' && (
            <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-green-600 text-white border-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Bem-vindo de volta! 🎉</CardTitle>
                <CardDescription className="text-white/90 text-sm sm:text-base">
                  Seus dados financeiros estão salvos e seguros. Visualize seu dashboard atualizado e continue
                  acompanhando seu progresso financeiro.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Navigation Tabs - Apenas após completar o chat */}
          {hasCompletedChat && (
            <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'space-x-4'} mb-6 sm:mb-8`}>
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('dashboard')} 
                className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <Button 
                variant={activeTab === 'insights' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('insights')} 
                className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Análises</span>
              </Button>
              <Button 
                variant={activeTab === 'chat' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('chat')} 
                className={`flex items-center space-x-2 ${isMobile ? 'h-10 text-xs px-3' : 'h-10 sm:h-auto'}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar</span>
              </Button>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4 sm:space-y-6">
              <FinancialChat onComplete={handleChatComplete} />
            </div>
          )}

          {activeTab === 'dashboard' && financialData && (
            <div className="space-y-4 sm:space-y-6">
              <FinancialDashboard data={financialData} />
            </div>
          )}

          {activeTab === 'insights' && financialData && (
            <div className="space-y-4 sm:space-y-6">
              <FinancialInsights data={financialData} />
            </div>
          )}

          {/* Placeholder se não há dados e tentou acessar dashboard/insights */}
          {(activeTab === 'dashboard' || activeTab === 'insights') && !financialData && (
            <Card className="max-w-md mx-auto text-center border-gray-700 bg-gray-800/50">
              <CardContent className="p-6 sm:p-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-50">Primeiro, vamos conversar!</h3>
                <p className="text-slate-400 mb-4 text-sm">
                  Para gerar seu dashboard personalizado, preciso conhecer sua situação financeira.
                </p>
                <Button 
                  onClick={() => setActiveTab('chat')}
                  className="mobile-button mobile-button-primary w-full"
                >
                  Começar Conversa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Financas;
