
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, MessageCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialChat } from '@/components/FinancialChat';
import { PersonalizedFinancialDashboard } from '@/components/PersonalizedFinancialDashboard';
import { useFinancialChatFlow } from '@/hooks/useFinancialChatFlow';

const Financas = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { financialData, isCollecting } = useFinancialChatFlow();

  const hasFinancialData = Object.keys(financialData).length > 1; // Mais que apenas o nome

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-green-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mestre das Finanças</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat')}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultor Financeiro</span>
          </Button>
          <Button 
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2"
            disabled={!hasFinancialData}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Meu Dashboard</span>
            {!hasFinancialData && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Complete o chat primeiro
              </span>
            )}
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Consultor Financeiro Pessoal
              </h1>
              <p className="text-gray-600">
                Converse comigo para entender sua situação financeira e receber recomendações personalizadas
              </p>
            </div>
            <FinancialChat />
            
            {/* Dashboard preview quando dados estão disponíveis */}
            {hasFinancialData && !isCollecting && (
              <div className="mt-8">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Seu Dashboard Está Pronto!</span>
                    </CardTitle>
                    <CardDescription>
                      Clique na aba "Meu Dashboard" para ver sua análise financeira completa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setActiveTab('dashboard')}
                      className="bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      Ver Meu Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && hasFinancialData && (
          <div className="max-w-6xl mx-auto">
            <PersonalizedFinancialDashboard data={financialData} />
          </div>
        )}

        {activeTab === 'dashboard' && !hasFinancialData && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Dashboard não disponível
                </h3>
                <p className="text-gray-600 mb-6">
                  Para gerar seu dashboard personalizado, você precisa primeiro conversar com o consultor financeiro.
                </p>
                <Button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  Iniciar Consulta Financeira
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financas;
