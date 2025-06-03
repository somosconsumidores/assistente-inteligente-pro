
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingUp, DollarSign, PiggyBank, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Financas = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <Button 
            variant={activeTab === 'planning' ? 'default' : 'outline'}
            onClick={() => setActiveTab('planning')}
            className="flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Planejamento</span>
          </Button>
          <Button 
            variant={activeTab === 'goals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('goals')}
            className="flex items-center space-x-2"
          >
            <PiggyBank className="w-4 h-4" />
            <span>Metas</span>
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Nenhuma renda cadastrada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Nenhum gasto registrado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Nenhuma economia acumulada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Nenhuma meta definida</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Planning Tab */}
        {activeTab === 'planning' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Plano Financeiro</CardTitle>
                <CardDescription>Vamos criar um plano personalizado para sua situação financeira</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="renda">Renda Mensal Total</Label>
                    <Input id="renda" placeholder="R$ 0,00" />
                  </div>
                  <div>
                    <Label htmlFor="gastos-fixos">Gastos Fixos</Label>
                    <Input id="gastos-fixos" placeholder="R$ 0,00" />
                  </div>
                  <div>
                    <Label htmlFor="gastos-variaveis">Gastos Variáveis</Label>
                    <Input id="gastos-variaveis" placeholder="R$ 0,00" />
                  </div>
                  <div>
                    <Label htmlFor="dividas">Dívidas Totais</Label>
                    <Input id="dividas" placeholder="R$ 0,00" />
                  </div>
                </div>
                <Button className="w-full">Gerar Plano Personalizado</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seu Plano de Recuperação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Configure seus dados acima para gerar um plano personalizado</span>
                    <span className="text-gray-500 font-bold">Aguardando dados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Metas</CardTitle>
                <CardDescription>Acompanhe o progresso das suas metas financeiras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta cadastrada</h3>
                  <p className="text-gray-500 mb-4">Comece definindo suas primeiras metas financeiras</p>
                  <Button>Adicionar Nova Meta</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financas;
