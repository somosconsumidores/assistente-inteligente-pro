
import { useState, useEffect } from 'react';
import { Device, DeviceInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

interface ExtendedDeviceInfo extends DeviceInfo {
  isNative: boolean;
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<ExtendedDeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await Device.getInfo();
          setDeviceInfo({
            ...info,
            isNative: true
          });
        } else {
          // Informações básicas para web
          setDeviceInfo({
            model: 'Web Browser',
            platform: 'web' as any,
            operatingSystem: 'unknown' as any,
            osVersion: '',
            manufacturer: '',
            isVirtual: false,
            isNative: false,
            memUsed: 0,
            webViewVersion: ''
          });
        }
      } catch (error) {
        console.error('Erro ao obter informações do dispositivo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getDeviceInfo();
  }, []);

  return { deviceInfo, isLoading };
}
