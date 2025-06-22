
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SubscriptionButton from '@/components/SubscriptionButton';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { assistants } from '@/data/assistants';

interface AssistantCardsProps {
  userPlan?: 'free' | 'premium';
  onUpgrade?: () => void;
  isFirstAccess?: boolean;
}

const AssistantCards = ({
  userPlan,
  onUpgrade,
  isFirstAccess = false
}: AssistantCardsProps) => {
  return (
    <div id="assistentes" className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">6 especialistas digitais para te ajudar no que importa.</h2>
        <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">Cada assistente foi treinado com base em conteúdo validado e está pronto pra responder com precisão. Você escolhe um e recebe orientação sob medida.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {assistants.map(assistant => {
          const Icon = assistant.icon;
          const isAvailable = userPlan ? (userPlan === 'premium' || !assistant.isPremium) : true;
          
          return (
            <Card key={assistant.id} className={`relative overflow-hidden transition-all duration-300 group border-gray-800 bg-gray-900/50 backdrop-blur-sm ${isAvailable ? 'hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer hover-lift' : 'opacity-60'}`}>
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${assistant.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* Premium Badge */}
              {userPlan && !isAvailable && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Free Badge */}
              {userPlan === 'free' && !assistant.isPremium && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gratuito
                  </Badge>
                </div>
              )}
              
              <CardHeader className="relative z-10 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${assistant.gradient} text-white shadow-lg flex-shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl text-white leading-tight">
                      {assistant.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-400">
                  {assistant.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
                {userPlan ? (
                  // Authenticated user view
                  isAvailable ? (
                    <Link to={assistant.path}>
                      <Button className={`w-full bg-gradient-to-r ${assistant.gradient} hover:opacity-90 text-white font-medium py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 touch-target`}>
                        Acessar Assistente
                      </Button>
                    </Link>
                  ) : (
                    <SubscriptionButton className="w-full" />
                  )
                ) : (
                  // Landing page view
                  <Link to="/login">
                    <Button className={`w-full bg-gradient-to-r ${assistant.gradient} hover:opacity-90 text-white font-medium py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 touch-target`}>
                      Começar Agora
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AssistantCards;
