
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Scale, DollarSign, ShoppingCart, Plane, ShoppingBasket, Crown, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SelectAssistant = () => {
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const navigate = useNavigate();

  const assistants = [
    {
      id: 'direito',
      title: 'Mestre do Direito do Consumidor',
      description: 'Advogado pessoal para questões de consumo, petições e orientação jurídica.',
      icon: Scale,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      path: '/direito-consumidor',
      benefits: ['Consultoria jurídica 24/7', 'Geração de petições', 'Guia passo a passo']
    },
    {
      id: 'financas',
      title: 'Mestre das Finanças',
      description: 'Planejador financeiro que cria planos de recuperação e metas personalizadas.',
      icon: DollarSign,
      color: 'from-green-600 to-blue-600',
      bgColor: 'from-green-50 to-blue-50',
      path: '/financas',
      benefits: ['Plano financeiro personalizado', 'Dashboard de controle', 'Metas inteligentes']
    },
    {
      id: 'produtos',
      title: 'Mestre dos Produtos',
      description: 'Consultor de compras que compara produtos e recomenda a melhor escolha.',
      icon: ShoppingCart,
      color: 'from-orange-600 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      path: '/produtos',
      benefits: ['Comparação inteligente', 'Análise de custo-benefício', 'Recomendações precisas']
    },
    {
      id: 'viagens',
      title: 'Mestre das Viagens',
      description: 'Planejador completo que cria roteiros personalizados para suas viagens.',
      icon: Plane,
      color: 'from-sky-600 to-indigo-600',
      bgColor: 'from-sky-50 to-indigo-50',
      path: '/viagens',
      benefits: ['Roteiros personalizados', 'Sugestões de hospedagem', 'Planejamento completo']
    },
    {
      id: 'supermercado',
      title: 'Mestre do Supermercado',
      description: 'Avaliador de produtos que compara qualidade, preço e recomenda opções.',
      icon: ShoppingBasket,
      color: 'from-emerald-600 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      path: '/supermercado',
      benefits: ['Scanner de produtos', 'Comparação de qualidade', 'Escolhas inteligentes']
    }
  ];

  const handleContinue = () => {
    const assistant = assistants.find(a => a.id === selectedAssistant);
    if (assistant) {
      navigate(assistant.path);
    }
  };

  const handleUpgrade = () => {
    // Aqui seria a lógica para upgrade do plano
    console.log('Redirect to upgrade page');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BI</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Biblioteca AI</span>
          </Link>
          
          <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Plano Gratuito</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha Seu <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assistente Especializado
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            No plano gratuito, você pode escolher 1 assistente para usar gratuitamente.
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-xl border border-orange-200">
            <Crown className="w-5 h-5 mr-2" />
            <span className="font-medium">Quer acesso a todos os 5 assistentes? </span>
            <button 
              onClick={handleUpgrade}
              className="ml-2 text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Fazer upgrade
            </button>
          </div>
        </div>

        {/* Assistant Selection */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Selecione seu assistente gratuito
            </CardTitle>
            <CardDescription className="text-center">
              Você poderá trocar de assistente a qualquer momento
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <RadioGroup 
              value={selectedAssistant} 
              onValueChange={setSelectedAssistant}
              className="space-y-4"
            >
              {assistants.map((assistant) => {
                const IconComponent = assistant.icon;
                const isSelected = selectedAssistant === assistant.id;
                
                return (
                  <div key={assistant.id} className="relative">
                    <Label 
                      htmlFor={assistant.id}
                      className={`block cursor-pointer transition-all duration-200 ${
                        isSelected ? 'transform scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <Card className={`border-2 transition-all duration-200 ${
                        isSelected 
                          ? `border-blue-500 bg-gradient-to-br ${assistant.bgColor} shadow-lg` 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <RadioGroupItem 
                              value={assistant.id} 
                              id={assistant.id}
                              className="mt-1"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center`}>
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900">
                                    {assistant.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {assistant.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {assistant.benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            
            <div className="mt-8 text-center">
              <Button 
                onClick={handleContinue}
                disabled={!selectedAssistant}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar com o Assistente Selecionado
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Você poderá trocar de assistente ou fazer upgrade para o plano premium a qualquer momento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectAssistant;
