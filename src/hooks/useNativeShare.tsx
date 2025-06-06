
import { useState } from 'react';
import { Share, ShareOptions } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export function useNativeShare() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const shareText = async (text: string, title?: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback para web usando Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Compartilhar',
            text: text,
          });
          return;
        } catch (error) {
          console.log('Compartilhamento cancelado ou erro:', error);
        }
      }
      
      // Fallback final: copiar para clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copiado!",
          description: "Texto copiado para a área de transferência",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar o texto",
          variant: "destructive"
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const options: ShareOptions = {
        title: title || 'Compartilhar',
        text: text,
        dialogTitle: 'Escolha como compartilhar'
      };

      await Share.share(options);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro no compartilhamento",
        description: "Não foi possível compartilhar o conteúdo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = async (url: string, title?: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback para web
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Compartilhar',
            url: url,
          });
          return;
        } catch (error) {
          console.log('Compartilhamento cancelado ou erro:', error);
        }
      }
      
      // Fallback: copiar URL
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Copiado!",
          description: "Link copiado para a área de transferência",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar o link",
          variant: "destructive"
        });
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const options: ShareOptions = {
        title: title || 'Compartilhar',
        url: url,
        dialogTitle: 'Escolha como compartilhar'
      };

      await Share.share(options);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro no compartilhamento",
        description: "Não foi possível compartilhar o link",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shareText,
    shareUrl,
    isLoading
  };
}
