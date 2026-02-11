import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Share, Plus, Smartphone, Download } from 'lucide-react';
import { useMobileDeviceInfo } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AddToHomeScreenDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { isMobile, platform } = useMobileDeviceInfo();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        const hasSeenDialog = localStorage.getItem('hasSeenAddToHomeScreen');
        if (!hasSeenDialog) {
          setIsOpen(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      handleClose();
    }
  }, [deferredPrompt]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenAddToHomeScreen', 'true');
  };

  const getInstructions = () => {
    if (platform === 'ios') {
      return {
        steps: [
          'Toque no ícone de compartilhar',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" para confirmar'
        ],
        icon: <Share className="w-6 h-6 text-blue-400" />
      };
    }
    return {
      steps: [
        'Toque no menu (⋮) do navegador',
        'Selecione "Adicionar à tela inicial"',
        'Toque em "Adicionar" para confirmar'
      ],
      icon: <Plus className="w-6 h-6 text-blue-400" />
    };
  };

  if (!isMobile) return null;

  const instructions = getInstructions();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="mx-4 max-w-sm bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-lg font-bold text-white">
                Instalar App
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-300 text-left">
            Tenha acesso rápido aos seus assistentes inteligentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {deferredPrompt ? (
            <div className="bg-gray-800/50 rounded-lg p-4 text-center space-y-3">
              <Download className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-sm text-gray-300">
                Instale o app diretamente no seu dispositivo com um toque!
              </p>
              <Button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Instalar Agora
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                {instructions.icon}
                Como adicionar:
              </h4>
              <ol className="space-y-2">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <span className="text-sm font-medium text-blue-400">Dica:</span>
            </div>
            <p className="text-xs text-gray-300">
              Com o app instalado, você acessa seus assistentes como um app nativo, com suporte offline!
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Agora não
            </Button>
            {!deferredPrompt && (
              <Button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Entendi!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
