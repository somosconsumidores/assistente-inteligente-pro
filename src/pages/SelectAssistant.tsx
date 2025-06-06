
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import AssistantPanel from '@/components/AssistantPanel';

const SelectAssistant = () => {
  const { profile, updateSelectedAssistant } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createCheckout, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true') {
      console.log('Payment successful, session ID:', sessionId);
      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Bem-vindo ao plano Premium! Verificando status da assinatura...",
      });
      
      // Check subscription status after successful payment
      setTimeout(async () => {
        await checkSubscription();
        toast({
          title: "Plano atualizado!",
          description: "Agora você tem acesso a todos os assistentes premium!",
        });
      }, 2000);
      
      // Clean URL
      navigate('/select-assistant', { replace: true });
    }

    if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive"
      });
      
      // Clean URL
      navigate('/select-assistant', { replace: true });
    }
  }, [searchParams, toast, navigate, checkSubscription]);

  const handleUpgrade = async () => {
    try {
      await createCheckout();
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto mobile-padding py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 touch-target">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BI</span>
            </div>
            <span className="font-bold text-xl text-white">Biblioteca AI</span>
          </Link>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 px-4 py-2 rounded-full border border-orange-500/30">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">
              Plano {profile?.plan === 'premium' ? 'Premium' : 'Gratuito'}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-padding py-12 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Painel de <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Assistentes Especializados
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
            {(() => {
              let descriptionText = '';
              if (profile?.plan === 'premium') {
                descriptionText = 'Como usuário premium, você tem acesso completo a todos os 5 assistentes especializados!';
              } else if (profile?.selected_assistant_id) {
                descriptionText = 'Você já selecionou seu assistente gratuito. Utilize-o abaixo ou faça upgrade para ter acesso a todos!';
              } else {
                descriptionText = 'No plano gratuito, você tem direito a escolher UM assistente especializado. Faça sua escolha abaixo.';
              }
              return descriptionText;
            })()}
          </p>
          
          {profile?.plan !== 'premium' && (
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-xl border border-orange-500/30 backdrop-blur-sm">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-medium">Quer acesso a todos os 5 assistentes? </span>
              <button 
                onClick={handleUpgrade}
                className="ml-2 text-orange-400 hover:text-orange-300 font-semibold underline transition-colors"
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
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30 backdrop-blur-sm">
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
