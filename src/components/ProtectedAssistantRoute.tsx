
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistantAccess } from '@/hooks/useAssistantAccess';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedAssistantRouteProps {
  children: React.ReactNode;
  assistantId: string;
  assistantName: string;
}

const ProtectedAssistantRoute: React.FC<ProtectedAssistantRouteProps> = ({ 
  children, 
  assistantId, 
  assistantName 
}) => {
  const navigate = useNavigate();
  const { profile, isLoading } = useAuth();
  const { 
    checkAssistantAccess, 
    handleBlockedAccess, 
    handleNoAssistantSelected,
    hasSelectedAssistant 
  } = useAssistantAccess();

  useEffect(() => {
    console.log('[ProtectedAssistantRoute] Effect triggered', {
      assistantId,
      isLoading,
      profile: profile ? {
        plan: profile.plan,
        selectedAssistant: profile.selected_assistant_id
      } : null
    });

    // Aguarda o carregamento do profile
    if (isLoading) return;

    // Se não tem profile (não logado), redireciona para login
    if (!profile) {
      console.log('[ProtectedAssistantRoute] No profile, redirecting to login');
      navigate('/login');
      return;
    }

    // Se é usuário gratuito e ainda não selecionou assistente
    if (profile.plan === 'free' && !hasSelectedAssistant()) {
      console.log('[ProtectedAssistantRoute] Free user without selected assistant, redirecting to select-assistant');
      handleNoAssistantSelected();
      navigate('/select-assistant');
      return;
    }

    // Verifica se tem acesso ao assistente
    const hasAccess = checkAssistantAccess(assistantId);
    
    if (!hasAccess) {
      console.log('[ProtectedAssistantRoute] Access denied, showing blocked message and redirecting');
      handleBlockedAccess();
      navigate('/select-assistant');
      return;
    }

    console.log('[ProtectedAssistantRoute] Access granted for assistant:', assistantId);
  }, [profile, isLoading, assistantId, navigate, checkAssistantAccess, handleBlockedAccess, handleNoAssistantSelected, hasSelectedAssistant]);

  // Mostra loading enquanto verifica permissões
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Verifica novamente se tem acesso (dupla verificação)
  const hasAccess = checkAssistantAccess(assistantId);
  if (!hasAccess) {
    console.log('[ProtectedAssistantRoute] Final access check failed, returning null');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAssistantRoute;
