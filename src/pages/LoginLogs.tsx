import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoginLog {
  id: string;
  user_id: string;
  email: string;
  login_timestamp: string;
  ip_address: unknown;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  session_id: string | null;
  created_at: string;
}

const LoginLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('login_timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar logs:', error);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Desconhecido';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Outro';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Carregando logs de acesso...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs de Acesso</CardTitle>
          <p className="text-muted-foreground">
            Histórico dos seus últimos 50 acessos ao sistema
          </p>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum log de acesso encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Navegador</TableHead>
                  <TableHead>Falha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {formatDate(log.login_timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getBrowserInfo(log.user_agent)}
                    </TableCell>
                    <TableCell>
                      {log.failure_reason || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginLogs;