
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export function useNativeHaptics() {
  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Erro no feedback háptico:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error
      }[type];

      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.error('Erro na notificação háptica:', error);
    }
  };

  const vibrate = async (duration: number = 300) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Erro na vibração:', error);
    }
  };

  const success = async () => {
    await notification('success');
  };

  return {
    impact,
    notification,
    vibrate,
    success
  };
}
