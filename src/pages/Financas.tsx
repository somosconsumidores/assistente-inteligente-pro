
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Lightbulb, RefreshCw, MessageCircle } from 'lucide-react';
import FinancialChat from '@/components/FinancialChat';
import FinancialDashboard from '@/components/FinancialDashboard';
import FinancialInsights from '@/components/FinancialInsights';
import { FinancialData } from '@/hooks/useFinancialChat';
import { DashboardLayout } from '@/components/DashboardLayout';

const Financas = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [hasCompletedChat, setHasCompletedChat] = useState(false);

  const handleChatComplete = (data: FinancialData) => {
    setFinancialData(data);
    setHasCompletedChat(true);
    setActiveTab('dashboard');
  };

  const resetExperience = () => {
    setFinancialData(null);
    setHasCompletedChat(false);
    setActiveTab('chat');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Mestre das Finanças</span>
              </div>
            </div>
            
            {hasCompletedChat && (
              <Button onClick={resetExperience} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            )}
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Card - Apenas se não completou o chat */}
          {!hasCompletedChat && activeTab === 'chat' && (
            <Card className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Bem-vindo ao seu Consultor Financeiro Pessoal! 🎯</CardTitle>
                <CardDescription className="text-white/90">
                  Vou te ajudar a organizar suas finanças de forma simples e personalizada. 
                  Através de uma conversa, vou entender sua situação e criar um plano sob medida para você.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Navigation Tabs - Apenas após completar o chat */}
          {hasCompletedChat && (
            <div className="flex space-x-4 mb-8">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Meu Dashboard</span>
              </Button>
              <Button 
                variant={activeTab === 'insights' ? 'default' : 'outline'}
                onClick={() => setActiveTab('insights')}
                className="flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Análises e Dicas</span>
              </Button>
              <Button 
                variant={activeTab === 'chat' ? 'default' : 'outline'}
                onClick={() => setActiveTab('chat')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar Novamente</span>
              </Button>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <FinancialChat onComplete={handleChatComplete} />
            </div>
          )}

          {activeTab === 'dashboard' && financialData && (
            <FinancialDashboard data={financialData} />
          )}

          {activeTab === 'insights' && financialData && (
            <FinancialInsights data={financialData} />
          )}

          {/* Placeholder se não há dados e tentou acessar dashboard/insights */}
          {(activeTab === 'dashboard' || activeTab === 'insights') && !financialData && (
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Primeiro, vamos conversar!</h3>
                <p className="text-gray-600 mb-4">
                  Para gerar seu dashboard personalizado, preciso conhecer sua situação financeira.
                </p>
                <Button onClick={() => setActiveTab('chat')}>
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
