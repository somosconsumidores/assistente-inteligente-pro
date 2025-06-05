
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ExampleItinerary = () => {
  return (
    <div className="space-y-6">
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-slate-50">Roteiro: Paris, França</CardTitle>
          <CardDescription className="text-slate-400">7 dias • 2 pessoas • Estilo Conforto • R$ 12.500</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(day => (
          <Card key={day} className="border-gray-700 bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg text-slate-50">Dia {day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-slate-50">09:00 - Café da manhã</h4>
                    <p className="text-slate-400 text-sm">Café Du Flore - Clássico bistro parisiense</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-slate-50">10:30 - Visita ao Louvre</h4>
                    <p className="text-slate-400 text-sm">3 horas - Reserve com antecedência</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-slate-50">14:00 - Almoço</h4>
                    <p className="text-slate-400 text-sm">L'As du Fallafel - Especialidade do Marais</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-slate-50">16:00 - Torre Eiffel</h4>
                    <p className="text-slate-400 text-sm">Subida ao topo + fotos no Trocadéro</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-700">
        <CardHeader>
          <CardTitle className="text-green-400">💡 Dicas do Especialista</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-green-300">
            <li>• Compre o Paris Museum Pass para economizar nas atrações</li>
            <li>• Use o metrô - é mais rápido que táxi no centro</li>
            <li>• Restaurantes fecham entre 14h-19h, planeje suas refeições</li>
            <li>• Gorjetas de 10% são esperadas em restaurantes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
