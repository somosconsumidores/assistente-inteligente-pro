import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assistants } from '@/data/assistants';
import { Crown } from 'lucide-react';

const MeusAssistentes = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isPremiumUser = profile?.plan === 'premium';

  const handleAssistantClick = (assistant: typeof assistants[0]) => {
    if (assistant.path === '/viagens') {
      navigate('/viagens?tab=planner', { replace: true });
    } else {
      navigate(assistant.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Meus <span className="text-gradient-neon">Assistentes</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Escolha um dos nossos assistentes especializados para começar. Cada um foi treinado para ajudar você em diferentes áreas.
          </p>
        </div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => {
            const IconComponent = assistant.icon;
            const canAccess = !assistant.isPremium || isPremiumUser;

            return (
              <div
                key={assistant.id}
                onClick={() => canAccess && handleAssistantClick(assistant)}
                className={`
                  group relative card-futuristic p-6 transition-all duration-300 cursor-pointer
                  ${canAccess 
                    ? 'hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20' 
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
                <h3 className="text-xl font-bold text-white mb-3 text-center">
                  {assistant.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4 text-center">
                  {assistant.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {assistant.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Access Status */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {canAccess ? (
                    <div className="text-center">
                      <span className="text-green-400 text-sm font-medium">
                        ✓ Acesso liberado
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-yellow-400 text-sm font-medium">
                        🔒 Requer plano Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Effect Overlay */}
                {canAccess && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 rounded-2xl border border-gray-700">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-300">
              {!isPremiumUser ? (
                <>Faça upgrade para <span className="text-yellow-400 font-semibold">Premium</span> e libere todos os assistentes</>
              ) : (
                <>Você tem acesso <span className="text-green-400 font-semibold">Premium</span> a todos os assistentes</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeusAssistentes;