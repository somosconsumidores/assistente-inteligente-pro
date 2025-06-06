
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Lightbulb, RefreshCw, Calculator } from 'lucide-react';
import FinancialChat from '@/components/FinancialChat';
import FinancialDashboard from '@/components/FinancialDashboard';
import FinancialInsights from '@/components/FinancialInsights';
import FinancialAdvisorChat from '@/components/FinancialAdvisorChat';
import { FinancialData } from '@/hooks/useFinancialChat';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFinancialDataStorage } from '@/hooks/useFinancialDataStorage';
import { useToast } from '@/hooks/use-toast';

const Financas = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [hasCompletedChat, setHasCompletedChat] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { loadFinancialData, deleteFinancialData } = useFinancialDataStorage();

  // Load existing data on component mount
  useEffect(() => {
    let isMounted = true;

    const loadExistingData = async () => {
      try {
        console.log('Carregando dados financeiros no painel...');
        const existingData = await loadFinancialData();
        
        if (!isMounted) return;
        
        if (existingData && Object.keys(existingData).length > 0) {
          console.log('Dados financeiros carregados:', existingData);
          setFinancialData(existingData);
          setHasCompletedChat(true);
        } else {
          console.log('Nenhum dado financeiro encontrado');
          setFinancialData(null);
          setHasCompletedChat(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        if (isMounted) {
          toast({
            title: "Aviso",
            description: "Não foi possível carregar dados salvos. Iniciando novo questionário.",
            variant: "default"
          });
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    loadExistingData();

    return () => {
      isMounted = false;
    };
  }, [loadFinancialData, toast]);

  const handleChatComplete = async (data: FinancialData) => {
    console.log('Chat completed with data:', data);
    setFinancialData(data);
    setHasCompletedChat(true);
    
    toast({
      title: "Sucesso! 🎉",
      description: "Seus dados financeiros foram salvos com sucesso!"
    });
  };

  const resetExperience = async () => {
    try {
      const deleted = await deleteFinancialData();
      if (deleted) {
        setFinancialData(null);
        setHasCompletedChat(false);
        toast({
          title: "Dados resetados",
          description: "Seus dados foram resetados. Você pode começar um novo questionário."
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível resetar os dados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao resetar os dados",
        variant: "destructive"
      });
    }
  };

  if (isInitializing) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Iniciando Mestre das Finanças...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900">
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
          {!hasCompletedChat && (
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
          {hasCompletedChat && financialData && (
            <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-green-600 text-white border-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Bem-vindo de volta! 🎉</CardTitle>
                <CardDescription className="text-white/90 text-sm sm:text-base">
                  Seus dados financeiros estão salvos e seguros. Visualize seu dashboard, análises detalhadas
                  ou converse com seu consultor financeiro IA para receber conselhos personalizados.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Content */}
          {hasCompletedChat && financialData ? (
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 mb-6 h-12">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Análises</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="advisor" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Consultor IA</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
                <FinancialDashboard data={financialData} />
              </TabsContent>

              <TabsContent value="insights" className="mt-0 focus-visible:outline-none">
                <FinancialInsights data={financialData} />
              </TabsContent>

              <TabsContent value="advisor" className="mt-0 focus-visible:outline-none">
                <FinancialAdvisorChat />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <FinancialChat onComplete={handleChatComplete} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Financas;
