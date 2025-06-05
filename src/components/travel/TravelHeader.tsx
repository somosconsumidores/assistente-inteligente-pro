
import React from 'react';
import { Plane } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const TravelHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="mobile-padding py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-50">Consultor de Viagens</h1>
            {!isMobile && (
              <p className="text-sm text-slate-400">
                Planeje sua viagem perfeita com roteiros personalizados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
