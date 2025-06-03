
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
                <div className="text-2xl font-bold text-green-600">R$ 4.500</div>
                <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ 3.200</div>
                <p className="text-xs text-muted-foreground">71% da renda</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">R$ 1.300</div>
                <p className="text-xs text-muted-foreground">29% da renda poupada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">R$ 1.740 de R$ 2.000</p>
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
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium">1. Quite dívidas do cartão de crédito</span>
                    <span className="text-green-600 font-bold">Prioridade Alta</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <span className="font-medium">2. Crie reserva de emergência</span>
                    <span className="text-yellow-600 font-bold">Prioridade Média</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium">3. Invista 20% da renda</span>
                    <span className="text-blue-600 font-bold">Prioridade Baixa</span>
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
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Reserva de Emergência</span>
                      <span className="text-sm text-gray-600">R$ 8.500 / R$ 15.000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '57%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Viagem para Europa</span>
                      <span className="text-sm text-gray-600">R$ 3.200 / R$ 12.000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Entrada do Apartamento</span>
                      <span className="text-sm text-gray-600">R$ 15.000 / R$ 50.000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">Adicionar Nova Meta</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financas;
