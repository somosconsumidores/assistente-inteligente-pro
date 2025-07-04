import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assistants } from '@/data/assistants';
import { Crown, Users, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
const MeusAssistentes = () => {
  const navigate = useNavigate();
  const {
    profile
  } = useAuth();
  const {
    isMobile
  } = useMobileDeviceInfo();
  const {
    createCheckout
  } = useSubscription();
  const isPremiumUser = profile?.plan === 'premium';
  const handleAssistantClick = (assistant: typeof assistants[0]) => {
    if (assistant.path === '/viagens') {
      navigate('/viagens?tab=planner', {
        replace: true
      });
    } else {
      navigate(assistant.path);
    }
  };
  const handleUpgrade = async () => {
    try {
      await createCheckout();
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
  };

  // Determina se o assistente pode ser acessado
  const getAssistantAccess = (assistant: typeof assistants[0]) => {
    // Se é usuário premium, todos os assistentes estão liberados
    if (isPremiumUser) {
      return {
        canAccess: true,
        isSelected: false,
        isBlocked: false
      };
    }

    // Se é usuário gratuito
    if (!assistant.isPremium) {
      // Assistentes gratuitos - verifica se foi o selecionado
      const isSelected = profile?.selected_assistant_id === assistant.id;
      const canAccess = isSelected || !profile?.selected_assistant_id; // Pode acessar se foi selecionado ou se ainda não selecionou nenhum
      const isBlocked = profile?.selected_assistant_id && !isSelected; // Está bloqueado se já selecionou outro

      return {
        canAccess,
        isSelected,
        isBlocked
      };
    } else {
      // Assistentes premium para usuário gratuito - sempre bloqueados
      return {
        canAccess: false,
        isSelected: false,
        isBlocked: true
      };
    }
  };
  return <DashboardLayout>
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
                
              </div>
            </div>
          </div>
        </div>

        {/* Assistants Grid */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {assistants.map(assistant => {
          const IconComponent = assistant.icon;
          const {
            canAccess,
            isSelected,
            isBlocked
          } = getAssistantAccess(assistant);
          return <div key={assistant.id} className={`
                  group relative bg-card border border-border rounded-lg ${isMobile ? 'p-3' : 'p-6'} transition-all duration-300
                  ${canAccess ? 'hover:shadow-lg hover:border-primary/50 cursor-pointer' : 'opacity-60'}
                  ${isSelected ? 'border-green-500 bg-green-50/5' : ''}
                `} onClick={() => canAccess && handleAssistantClick(assistant)}>
                {/* Status Badge */}
                {isSelected && <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>}
                {assistant.isPremium && !isPremiumUser && !isSelected && <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-yellow-900" />
                  </div>}
                {isBlocked && !assistant.isPremium && <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>}

                {/* Lock Overlay para assistentes bloqueados */}
                {isBlocked && <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center p-4 max-w-xs">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-white text-sm font-bold mb-1">
                        {assistant.title}
                      </h4>
                      <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                        {assistant.description}
                      </p>
                      <p className="text-white text-xs font-medium mb-3">
                        {assistant.isPremium ? 'Requer Premium' : 'Assistente Bloqueado'}
                      </p>
                      <button 
                        onClick={e => {
                          e.stopPropagation();
                          handleUpgrade();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ef4444)',
                          border: 'none',
                          color: 'white'
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl z-[60] relative"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Fazer Upgrade
                      </button>
                    </div>
                  </div>}

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

                {/* Premium users get clean view - only show "Clique para usar" */}
                {isPremiumUser ? (
                  <div className="text-center">
                    <span className="text-blue-500 text-sm font-medium">
                      📱 Clique para usar
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-center">
                      {assistant.description}
                    </p>

                    {/* Benefits */}
                    <ul className="space-y-2">
                      {assistant.benefits.slice(0, 3).map((benefit, index) => <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                          {benefit}
                        </li>)}
                    </ul>

                    {/* Access Status */}
                    <div className="mt-4 pt-4 border-t border-border">
                      {isSelected ? <div className="text-center">
                          <span className="text-green-500 text-sm font-medium">
                            ✓ Assistente Selecionado
                          </span>
                        </div> : canAccess ? <div className="text-center">
                          <span className="text-blue-500 text-sm font-medium">
                            📱 Clique para usar
                          </span>
                        </div> : <div className="text-center">
                          <span className="text-gray-500 text-sm font-medium">
                            🔒 Bloqueado
                          </span>
                        </div>}
                    </div>
                  </>
                )}

                {/* Hover Effect Overlay */}
                {canAccess && !isBlocked && <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>}
              </div>;
        })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          {!isPremiumUser ? <button 
              onClick={handleUpgrade} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-md font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Crown className="w-5 h-5" />
              <span>
                Faça upgrade para <span className="font-semibold">Premium</span> e libere todos os assistentes
              </span>
            </button> : <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-lg border border-border">
              <Crown className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">
                Você tem acesso <span className="text-green-500 font-semibold">Premium</span> a todos os assistentes
              </span>
            </div>}
        </div>
      </div>
    </DashboardLayout>;
};
export default MeusAssistentes;