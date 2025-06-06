
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Cpu, HardDrive } from 'lucide-react';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileOptimizedCard } from './MobileOptimizedCard';

export function DeviceInfoCard() {
  const { deviceInfo, isLoading } = useDeviceInfo();
  const { isMobile, platform, isRetina, viewportWidth, viewportHeight } = useMobileDeviceInfo();

  if (isLoading) {
    return (
      <MobileOptimizedCard title="Informações do Dispositivo" compact>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </MobileOptimizedCard>
    );
  }

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="w-5 h-5 text-blue-600" />;
    return <Monitor className="w-5 h-5 text-green-600" />;
  };

  const deviceData = [
    {
      label: 'Modelo',
      value: deviceInfo?.model || 'Desconhecido',
      icon: <Smartphone className="w-4 h-4" />
    },
    {
      label: 'Sistema',
      value: `${deviceInfo?.operatingSystem || 'Web'} ${deviceInfo?.osVersion || ''}`.trim(),
      icon: <Cpu className="w-4 h-4" />
    },
    {
      label: 'Plataforma',
      value: platform.charAt(0).toUpperCase() + platform.slice(1),
      icon: <Monitor className="w-4 h-4" />
    },
    {
      label: 'Resolução',
      value: `${viewportWidth}x${viewportHeight}${isRetina ? ' (Retina)' : ''}`,
      icon: <HardDrive className="w-4 h-4" />
    }
  ];

  if (deviceInfo?.manufacturer) {
    deviceData.splice(1, 0, {
      label: 'Fabricante',
      value: deviceInfo.manufacturer,
      icon: <Cpu className="w-4 h-4" />
    });
  }

  return (
    <MobileOptimizedCard 
      title="Informações do Dispositivo" 
      headerAction={getDeviceIcon()}
      compact
    >
      <div className="space-y-3">
        {deviceData.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[150px] truncate">
              {item.value}
            </span>
          </div>
        ))}

        {deviceInfo?.isNative && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                Ambiente Nativo
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Todos os recursos nativos estão disponíveis
            </p>
          </div>
        )}
      </div>
    </MobileOptimizedCard>
  );
}
