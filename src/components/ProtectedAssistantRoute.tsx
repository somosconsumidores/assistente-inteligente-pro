
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
  const { checkAssistantAccess, handleBlockedAccess } = useAssistantAccess();

  useEffect(() => {
    // Aguarda o carregamento do profile
    if (isLoading) return;

    // Se não tem profile (não logado), redireciona para login
    if (!profile) {
      navigate('/login');
      return;
    }

    // Verifica se tem acesso ao assistente
    const hasAccess = checkAssistantAccess(assistantId);
    
    if (!hasAccess) {
      handleBlockedAccess();
      navigate('/select-assistant');
      return;
    }
  }, [profile, isLoading, assistantId, navigate, checkAssistantAccess, handleBlockedAccess]);

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
    return null; // Ou um componente de acesso negado
  }

  return <>{children}</>;
};

export default ProtectedAssistantRoute;
