
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AssistantPanel from '@/components/AssistantPanel';

const SelectAssistant = () => {
  const { profile, updateSelectedAssistant } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Aqui seria a lógica para upgrade do plano
    console.log('Redirect to upgrade page');
  };

  const handleSelectAssistant = async (assistantId: string) => {
    try {
      await updateSelectedAssistant(assistantId);
      toast({
        title: "Sucesso!",
        description: "Assistente selecionado com sucesso"
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao selecionar assistente",
        variant: "destructive"
      });
    }
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
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Painel de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assistentes Especializados
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            {(() => {
              let descriptionText = '';
              if (profile?.plan === 'premium') {
                descriptionText = 'Como usuário premium, você tem acesso completo a todos os 5 assistentes especializados!';
              } else if (profile?.selected_assistant_id) {
                descriptionText = 'Você já selecionou seu assistente gratuito. Utilize-o abaixo ou faça upgrade para ter acesso a todos!';
                // TODO: Potentially display the name of the selected assistant if easily available.
                // For now, this generic message is fine.
              } else {
                descriptionText = 'No plano gratuito, você tem direito a escolher UM assistente especializado. Faça sua escolha abaixo.';
              }
              return descriptionText;
            })()}
          </p>
          
          {profile?.plan !== 'premium' && (
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
          selectedAssistantId={profile?.selected_assistant_id} 
          onSelectAssistant={handleSelectAssistant} 
        />

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
            {profile?.plan === 'premium' 
              ? '🚀 Você tem acesso completo a todos os assistentes!' 
              : '⭐ Upgrade para Premium e desbloqueie todos os assistentes'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAssistant;
