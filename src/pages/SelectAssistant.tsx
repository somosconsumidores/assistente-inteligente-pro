
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AssistantPanel from '@/components/AssistantPanel';

const SelectAssistant = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  useEffect(() => {
    // Check if user is coming from registration
    const searchParams = new URLSearchParams(location.search);
    const fromRegistration = searchParams.get('from') === 'register';
    setIsFirstAccess(fromRegistration);
  }, [location]);

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
            <span className="text-sm font-medium">
              Plano {profile?.plan === 'premium' ? 'Premium' : 'Gratuito'}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Welcome Message for First Access */}
        {isFirstAccess && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                🎉 Bem-vindo à Biblioteca AI!
              </h2>
              <p className="text-blue-700 text-lg mb-4">
                Sua conta foi criada com sucesso! Agora escolha seu primeiro assistente especializado para começar.
              </p>
              <div className="bg-white/50 rounded-lg p-4 inline-block">
                <p className="text-sm text-blue-600 font-medium">
                  💡 Como usuário gratuito, você tem acesso ao <strong>Mestre do Direito do Consumidor</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isFirstAccess ? 'Escolha seu ' : 'Painel de '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isFirstAccess ? 'Primeiro Assistente' : 'Assistentes Especializados'}
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            {profile?.plan === 'premium' 
              ? 'Como usuário premium, você tem acesso completo a todos os 5 assistentes especializados!'
              : isFirstAccess 
                ? 'No plano gratuito, você pode acessar o Mestre do Direito do Consumidor. Clique nele abaixo para começar!'
                : 'No plano gratuito, você tem acesso ao Mestre do Direito do Consumidor. Faça upgrade para acessar todos os assistentes.'
            }
          </p>
          
          {profile?.plan !== 'premium' && !isFirstAccess && (
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-xl border border-orange-200">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-medium">Quer acesso a todos os 5 assistentes? </span>
              <button 
                onClick={handleUpgrade}
                className="ml-2 text-orange-600 hover:text-orange-700 font-semibold underline"
              >
                Fazer upgrade para Premium
              </button>
            </div>
          )}
        </div>

        {/* Assistant Panel */}
        <AssistantPanel 
          userPlan={profile?.plan as 'free' | 'premium' || 'free'} 
          onUpgrade={handleUpgrade}
          isFirstAccess={isFirstAccess}
        />

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
            {profile?.plan === 'premium' 
              ? '🚀 Você tem acesso completo a todos os assistentes!' 
              : isFirstAccess
                ? '🎯 Clique no Mestre do Direito do Consumidor para começar!'
                : '⭐ Upgrade para Premium e desbloqueie todos os assistentes'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAssistant;
