
import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

interface BatteryInfo {
  batteryLevel?: number;
  isCharging?: boolean;
}

export function useBatteryStatus() {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await Device.getBatteryInfo();
          setBatteryInfo({
            batteryLevel: info.batteryLevel,
            isCharging: info.isCharging
          });
        } else {
          // Fallback para web usando Battery API (se disponível)
          if ('getBattery' in navigator) {
            try {
              const battery = await (navigator as any).getBattery();
              setBatteryInfo({
                batteryLevel: Math.round(battery.level * 100),
                isCharging: battery.charging
              });

              // Listeners para mudanças de status
              battery.addEventListener('chargingchange', () => {
                setBatteryInfo(prev => ({
                  ...prev,
                  isCharging: battery.charging
                }));
              });

              battery.addEventListener('levelchange', () => {
                setBatteryInfo(prev => ({
                  ...prev,
                  batteryLevel: Math.round(battery.level * 100)
                }));
              });
            } catch (error) {
              console.log('Battery API não disponível');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao obter informações da bateria:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getBatteryInfo();
  }, []);

  const getBatteryIcon = () => {
    const level = batteryInfo.batteryLevel || 0;
    
    if (batteryInfo.isCharging) return 'battery-charging';
    if (level <= 20) return 'battery-low';
    if (level <= 50) return 'battery-medium';
    if (level >= 90) return 'battery-full';
    return 'battery';
  };

  const getBatteryColor = () => {
    const level = batteryInfo.batteryLevel || 0;
    
    if (batteryInfo.isCharging) return 'text-green-500';
    if (level <= 20) return 'text-red-500';
    if (level <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  return {
    batteryInfo,
    isLoading,
    getBatteryIcon,
    getBatteryColor
  };
}
