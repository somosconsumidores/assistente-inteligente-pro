
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image, Loader2 } from 'lucide-react';
import { useNativeCamera, PhotoResult } from '@/hooks/useNativeCamera';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NativeCameraButtonProps {
  onPhotoTaken?: (photo: PhotoResult) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function NativeCameraButton({
  onPhotoTaken,
  variant = 'outline',
  size = 'sm',
  className
}: NativeCameraButtonProps) {
  const { takePhoto, selectFromGallery, isLoading } = useNativeCamera();
  const { impact } = useNativeHaptics();
  const { isMobile } = useMobileDeviceInfo();
  const [isOpen, setIsOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoResult | null>(null);

  const handleTakePhoto = async () => {
    await impact('medium');
    const photo = await takePhoto();
    if (photo) {
      setCapturedPhoto(photo);
      onPhotoTaken?.(photo);
      setIsOpen(false);
    }
  };

  const handleSelectFromGallery = async () => {
    await impact('light');
    const photo = await selectFromGallery();
    if (photo) {
      setCapturedPhoto(photo);
      onPhotoTaken?.(photo);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          disabled={!isMobile || isLoading}
          className={className}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {isMobile ? 'Câmera' : 'Câmera (Mobile)'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capturar Foto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            onClick={handleTakePhoto}
            disabled={isLoading}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Tirar Foto
          </Button>
          
          <Button 
            onClick={handleSelectFromGallery}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Image className="w-4 h-4 mr-2" />
            Escolher da Galeria
          </Button>

          {capturedPhoto?.dataUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Última foto capturada:</p>
              <img 
                src={capturedPhoto.dataUrl} 
                alt="Foto capturada" 
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
