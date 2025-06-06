
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { useNativeCamera, PhotoResult } from '@/hooks/useNativeCamera';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NativeCameraButtonProps {
  onPhotoTaken?: (photo: PhotoResult) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function NativeCameraButton({
  onPhotoTaken,
  className,
  variant = 'default',
  size = 'default'
}: NativeCameraButtonProps) {
  const { takePhoto, selectFromGallery, isLoading } = useNativeCamera();
  const { impact } = useNativeHaptics();
  const { isMobile } = useMobileDeviceInfo();
  const [isOpen, setIsOpen] = useState(false);

  const handleTakePhoto = async () => {
    await impact('light');
    const photo = await takePhoto();
    if (photo && onPhotoTaken) {
      onPhotoTaken(photo);
      await impact('success');
    }
    setIsOpen(false);
  };

  const handleSelectFromGallery = async () => {
    await impact('light');
    const photo = await selectFromGallery();
    if (photo && onPhotoTaken) {
      onPhotoTaken(photo);
      await impact('success');
    }
    setIsOpen(false);
  };

  if (!isMobile) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled
      >
        <Camera className="w-4 h-4 mr-2" />
        Câmera (Mobile)
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          Foto
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTakePhoto} className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Tirar foto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSelectFromGallery} className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Escolher da galeria
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
