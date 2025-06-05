
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TravelInspirations = () => {
  return (
    <Card className="border-gray-700 bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-slate-50">Inspirações de Destino</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6 text-white touch-target">
            <h3 className="font-bold text-base sm:text-lg mb-2">Europa Clássica</h3>
            <p className="text-sm opacity-90">15 dias por 5 países</p>
            <p className="font-bold mt-2 text-sm sm:text-base">A partir de R$ 8.500</p>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 p-4 sm:p-6 text-white touch-target">
            <h3 className="font-bold text-base sm:text-lg mb-2">Tailândia Exótica</h3>
            <p className="text-sm opacity-90">10 dias de aventura</p>
            <p className="font-bold mt-2 text-sm sm:text-base">A partir de R$ 5.200</p>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-4 sm:p-6 text-white touch-target sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-2">Chile & Argentina</h3>
            <p className="text-sm opacity-90">12 dias pela Cordilheira</p>
            <p className="font-bold mt-2 text-sm sm:text-base">A partir de R$ 6.800</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
