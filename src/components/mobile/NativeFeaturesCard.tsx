
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Wifi } from 'lucide-react';
import { MobileOptimizedCard } from './MobileOptimizedCard';
import { NativeCameraButton } from './NativeCameraButton';
import { NotificationButton } from './NotificationButton';
import { ShareButton } from './ShareButton';
import { BatteryIndicator } from './BatteryIndicator';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

export function NativeFeaturesCard() {
  const { isMobile } = useMobileDeviceInfo();

  return (
    <MobileOptimizedCard
      title="Recursos Nativos"
      headerAction={<BatteryIndicator />}
      compact
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NativeCameraButton
            onPhotoTaken={(photo) => {
              console.log('Foto capturada:', photo);
            }}
            variant="outline"
            size="sm"
          />
          
          <NotificationButton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ShareButton
            text="Confira este aplicativo incrível!"
            title="Assistente Inteligente Pro"
            size="sm"
            className="w-full"
          />
          
          <ShareButton
            url={window.location.href}
            title="Assistente Inteligente Pro"
            size="sm"
            className="w-full"
          />
        </div>

        {!isMobile && (
          <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded-lg">
            💡 Os recursos nativos funcionam melhor em dispositivos móveis
          </div>
        )}
      </div>
    </MobileOptimizedCard>
  );
}
