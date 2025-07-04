import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assistants } from '@/data/assistants';
import { Crown, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

const MeusAssistentes = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isMobile } = useMobileDeviceInfo();
  const isPremiumUser = profile?.plan === 'premium';

  const handleAssistantClick = (assistant: typeof assistants[0]) => {
    if (assistant.path === '/viagens') {
      navigate('/viagens?tab=planner', { replace: true });
    } else {
      navigate(assistant.path);
    }
  };

  return (
    <DashboardLayout>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? 'mobile-safe-area' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  Meus Assistentes
                </h1>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                  Escolha um dos nossos assistentes especializados para começar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assistants Grid */}
        <div className={`grid gap-6 ${
          isMobile 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {assistants.map((assistant) => {
            const IconComponent = assistant.icon;
            const canAccess = !assistant.isPremium || isPremiumUser;

            return (
              <div
                key={assistant.id}
                onClick={() => canAccess && handleAssistantClick(assistant)}
                className={`
                  group relative bg-card border border-border rounded-lg p-6 transition-all duration-300 cursor-pointer
                  ${canAccess 
                    ? 'hover:shadow-lg hover:border-primary/50' 
                    : 'opacity-60 cursor-not-allowed'
                  }
                  ${!canAccess ? 'grayscale' : ''}
                `}
              >
                {/* Premium Badge */}
                {assistant.isPremium && !isPremiumUser && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-yellow-900" />
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto
                  bg-gradient-to-br ${assistant.color} shadow-lg
                  ${canAccess ? 'group-hover:scale-110' : ''}
                  transition-transform duration-300
                `}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                  {assistant.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
                  {assistant.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {assistant.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Access Status */}
                <div className="mt-4 pt-4 border-t border-border">
                  {canAccess ? (
                    <div className="text-center">
                      <span className="text-green-500 text-sm font-medium">
                        ✓ Acesso liberado
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-yellow-500 text-sm font-medium">
                        🔒 Requer plano Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Effect Overlay */}
                {canAccess && (
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-lg border border-border">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-muted-foreground">
              {!isPremiumUser ? (
                <>Faça upgrade para <span className="text-yellow-500 font-semibold">Premium</span> e libere todos os assistentes</>
              ) : (
                <>Você tem acesso <span className="text-green-500 font-semibold">Premium</span> a todos os assistentes</>
              )}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeusAssistentes;