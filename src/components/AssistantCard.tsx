
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubscriptionButton from '@/components/SubscriptionButton';
import LockedAssistantFeatures from '@/components/LockedAssistantFeatures';
import { Lock, Crown, CheckCircle } from 'lucide-react';
import { Assistant } from '@/data/assistants';

interface AssistantCardProps {
  assistant: Assistant;
  userPlan: 'free' | 'premium';
  selectedAssistantId?: string | null;
  isClickable: boolean;
  isLocked: boolean;
  isSelected: boolean;
  cardActionText: string;
  onAssistantClick: (assistant: Assistant) => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({
  assistant,
  userPlan,
  selectedAssistantId,
  isClickable,
  isLocked,
  isSelected,
  cardActionText,
  onAssistantClick
}) => {
  const IconComponent = assistant.icon;

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'border-2 border-green-400 shadow-lg bg-gray-800/50' 
          : isClickable 
            ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gray-800/30 border-gray-700' 
            : 'border-2 border-gray-600 bg-gray-800/20'
      } bg-gradient-to-br ${assistant.bgColor} backdrop-blur-sm`}
      onClick={() => isClickable && onAssistantClick(assistant)}
    >
      {/* Badge do assistente */}
      <div className="absolute top-4 right-4 z-10">
        {isSelected && userPlan === 'free' ? (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-400 to-blue-400 text-white">
            <CheckCircle className="w-3 h-3" />
            <span>Plano Gratuito</span>
          </div>
        ) : assistant.isPremium ? (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            userPlan === 'premium'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
              : 'bg-gray-700 text-gray-300 border border-gray-600'
          }`}>
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        ) : null}
      </div>

      {/* Lock Overlay para assistentes bloqueados */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {assistant.title}
            </h3>
            <p className="text-sm text-gray-300 mb-4 font-medium">
              Você já selecionou outro assistente gratuito.
            </p>
            
            {/* Botão para ver features */}
            <div className="space-y-2">
              <LockedAssistantFeatures 
                assistant={assistant} 
                userPlan={userPlan}
              />
              <SubscriptionButton size="sm" />
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${assistant.color} rounded-lg flex items-center justify-center mb-4`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-white">
          {assistant.title}
        </CardTitle>
        <CardDescription className="leading-relaxed text-gray-300">
          {assistant.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 mb-6">
          {assistant.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
              <span className="text-sm text-gray-300">
                {benefit}
              </span>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          {!isLocked && (
            <Button 
              className={`w-full bg-gradient-to-r ${assistant.color} hover:opacity-90 transition-opacity text-white`}
            >
              {cardActionText}
            </Button>
          )}
          
          {/* Botão para ver features em assistentes premium não bloqueados */}
          {!isLocked && assistant.isPremium && userPlan === 'free' && (
            <LockedAssistantFeatures 
              assistant={assistant} 
              userPlan={userPlan}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssistantCard;
