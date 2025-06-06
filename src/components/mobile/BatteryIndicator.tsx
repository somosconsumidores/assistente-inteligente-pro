
import React from 'react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryFull, 
  BatteryLow, 
  BatteryMedium 
} from 'lucide-react';
import { useBatteryStatus } from '@/hooks/useBatteryStatus';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BatteryIndicatorProps {
  showPercentage?: boolean;
  className?: string;
}

export function BatteryIndicator({ 
  showPercentage = true, 
  className 
}: BatteryIndicatorProps) {
  const { batteryInfo, isLoading, getBatteryIcon, getBatteryColor } = useBatteryStatus();
  const { isMobile } = useMobileDeviceInfo();

  if (!isMobile || isLoading) {
    return <Skeleton className="h-6 w-16" />;
  }

  if (batteryInfo.batteryLevel === undefined) {
    return null;
  }

  const iconName = getBatteryIcon();
  const colorClass = getBatteryColor();

  const getIcon = () => {
    switch (iconName) {
      case 'battery-charging':
        return <BatteryCharging className="w-4 h-4" />;
      case 'battery-low':
        return <BatteryLow className="w-4 h-4" />;
      case 'battery-medium':
        return <BatteryMedium className="w-4 h-4" />;
      case 'battery-full':
        return <BatteryFull className="w-4 h-4" />;
      default:
        return <Battery className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-1 text-sm font-medium',
      colorClass,
      className
    )}>
      {getIcon()}
      {showPercentage && (
        <span>{batteryInfo.batteryLevel}%</span>
      )}
    </div>
  );
}
