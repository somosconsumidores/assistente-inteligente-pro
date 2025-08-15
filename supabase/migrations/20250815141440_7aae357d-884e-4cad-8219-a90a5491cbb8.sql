-- Criar tabela para logs de acesso/login
CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  login_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  failure_reason text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios logs
CREATE POLICY "Users can view their own login logs" 
ON public.login_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para inserir logs (permitir inserção para qualquer usuário autenticado)
CREATE POLICY "Allow insert login logs" 
ON public.login_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX idx_login_logs_timestamp ON public.login_logs(login_timestamp DESC);
CREATE INDEX idx_login_logs_email ON public.login_logs(email);