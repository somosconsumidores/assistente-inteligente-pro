
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Cpu, HardDrive } from 'lucide-react';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { Skeleton } from '@/components/ui/skeleton';

export function DeviceInfoCard() {
  const { deviceInfo, isLoading } = useDeviceInfo();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Informações do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!deviceInfo) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {deviceInfo.isNative ? (
            <Smartphone className="w-5 h-5 text-blue-600" />
          ) : (
            <Monitor className="w-5 h-5 text-green-600" />
          )}
          Informações do Dispositivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Plataforma:</span>
              <span className="text-gray-600">{deviceInfo.platform}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Modelo:</span>
              <span className="text-gray-600">{deviceInfo.model}</span>
            </div>

            {deviceInfo.manufacturer && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Fabricante:</span>
                <span className="text-gray-600">{deviceInfo.manufacturer}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {deviceInfo.osVersion && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">OS Version:</span>
                <span className="text-gray-600">{deviceInfo.osVersion}</span>
              </div>
            )}

            {deviceInfo.isNative && deviceInfo.memUsed > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Memória Usada:</span>
                <span className="text-gray-600">{formatBytes(deviceInfo.memUsed)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Tipo:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                deviceInfo.isNative 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {deviceInfo.isNative ? 'App Nativo' : 'Web App'}
              </span>
            </div>
          </div>
        </div>

        {deviceInfo.isNative && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Executando como aplicativo nativo com acesso total aos recursos do dispositivo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
