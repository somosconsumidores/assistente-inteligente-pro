
import { useState } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export function useLocalNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Recurso não disponível",
        description: "Notificações locais só estão disponíveis em dispositivos móveis",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissões de notificação:', error);
      return false;
    }
  };

  const scheduleNotification = async (options: {
    title: string;
    body: string;
    scheduleAt?: Date;
    id?: number;
  }) => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Recurso não disponível",
        description: "Notificações locais só estão disponíveis em dispositivos móveis",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        toast({
          title: "Permissão negada",
          description: "É necessário permitir notificações para usar este recurso",
          variant: "destructive"
        });
        return;
      }

      const notificationOptions: ScheduleOptions = {
        notifications: [
          {
            id: options.id || Date.now(),
            title: options.title,
            body: options.body,
            schedule: options.scheduleAt ? { at: options.scheduleAt } : undefined,
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: {}
          }
        ]
      };

      await LocalNotifications.schedule(notificationOptions);
      
      toast({
        title: "Notificação agendada",
        description: "A notificação foi configurada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      toast({
        title: "Erro na notificação",
        description: "Não foi possível agendar a notificação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAllNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({ notifications: [] });
      toast({
        title: "Notificações canceladas",
        description: "Todas as notificações foram canceladas",
      });
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  };

  return {
    scheduleNotification,
    cancelAllNotifications,
    isLoading
  };
}
