
import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export interface PhotoResult {
  webPath?: string;
  dataUrl?: string;
  format?: string;
}

export function useNativeCamera() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const takePhoto = async (): Promise<PhotoResult | null> => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Recurso não disponível",
        description: "A câmera só está disponível em dispositivos móveis",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return {
        webPath: image.webPath,
        dataUrl: image.dataUrl,
        format: image.format
      };
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível tirar a foto. Verifique as permissões.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<PhotoResult | null> => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Recurso não disponível",
        description: "A galeria só está disponível em dispositivos móveis",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return {
        webPath: image.webPath,
        dataUrl: image.dataUrl,
        format: image.format
      };
    } catch (error) {
      console.error('Erro ao selecionar da galeria:', error);
      toast({
        title: "Erro na galeria",
        description: "Não foi possível selecionar a imagem. Verifique as permissões.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePhoto,
    selectFromGallery,
    isLoading
  };
}
