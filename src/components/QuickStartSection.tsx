
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calculator, 
  Users, 
  Target,
  ArrowRight,
  Plus
} from 'lucide-react';

const QuickStartSection = () => {
  const quickStartItems = [
    {
      id: 'petitions',
      title: 'Gerar Petição',
      description: 'Crie petições jurídicas rapidamente',
      icon: FileText,
      gradient: 'from-blue-500 to-purple-600',
      action: '/direito-consumidor'
    },
    {
      id: 'budget',
      title: 'Plano Financeiro',
      description: 'Organize suas finanças pessoais',
      icon: Calculator,
      gradient: 'from-emerald-500 to-blue-600',
      action: '/financas'
    },
    {
      id: 'team',
      title: 'Comparar Produtos',
      description: 'Encontre o melhor custo-benefício',
      icon: Users,
      gradient: 'from-violet-500 to-pink-600',
      action: '/produtos'
    },
    {
      id: 'goals',
      title: 'Planejar Viagem',
      description: 'Roteiros personalizados',
      icon: Target,
      gradient: 'from-orange-500 to-red-600',
      action: '/viagens'
    }
  ];

  return (
    <section className="py-20 px-4 bg-slate-900">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Começar rapidamente
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Acesse rapidamente nossos assistentes mais populares e comece a usar IA hoje mesmo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStartItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Card 
                key={item.id}
                className="relative overflow-hidden bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 cursor-pointer group rounded-2xl"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardHeader className="relative z-10 pb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-0">
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-700/50 p-3 rounded-xl group"
                  >
                    <span>Usar agora</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-1">
                Explorar todos os assistentes
              </h3>
              <p className="text-sm text-slate-400">
                Descubra todos os 5 assistentes disponíveis
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 ml-4"
            >
              Ver todos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStartSection;
