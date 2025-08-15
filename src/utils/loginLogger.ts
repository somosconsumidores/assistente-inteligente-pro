import { supabase } from '@/integrations/supabase/client';

export const logUserAccess = async (
  userId: string,
  email: string,
  success: boolean = true,
  failureReason?: string
) => {
  try {
    // Obter informações do navegador
    const userAgent = navigator.userAgent;
    
    // Tentar obter o IP (limitado no browser, mas vamos deixar null)
    const ipAddress = null;
    
    // Gerar um ID de sessão único
    const sessionId = crypto.randomUUID();

    const { error } = await supabase
      .from('login_logs')
      .insert({
        user_id: userId,
        email: email,
        login_timestamp: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        success: success,
        failure_reason: failureReason,
        session_id: sessionId
      });

    if (error) {
      console.error('Erro ao registrar log de acesso:', error);
    } else {
      console.log('Log de acesso registrado com sucesso para:', email);
    }
  } catch (error) {
    console.error('Erro ao registrar log de acesso:', error);
  }
};