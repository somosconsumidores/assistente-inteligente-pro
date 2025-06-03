
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Calendar, Users, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const Viagens = () => {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-sky-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Mestre das Viagens</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button 
            variant={activeTab === 'planner' ? 'default' : 'outline'}
            onClick={() => setActiveTab('planner')}
            className="flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Planejador</span>
          </Button>
          <Button 
            variant={activeTab === 'itinerary' ? 'default' : 'outline'}
            onClick={() => setActiveTab('itinerary')}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Roteiro</span>
          </Button>
        </div>

        {/* Planner Tab */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planeje sua Viagem Perfeita</CardTitle>
                <CardDescription>Conte-me seus detalhes e criarei um roteiro personalizado para você</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destino">Destino</Label>
                    <Input id="destino" placeholder="Ex: Paris, França" />
                  </div>
                  <div>
                    <Label htmlFor="orcamento">Orçamento Total</Label>
                    <Input id="orcamento" placeholder="R$ 0,00" />
                  </div>
                  <div>
                    <Label htmlFor="data-ida">Data de Ida</Label>
                    <Input id="data-ida" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="data-volta">Data de Volta</Label>
                    <Input id="data-volta" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="pessoas">Número de Pessoas</Label>
                    <Input id="pessoas" type="number" min="1" placeholder="1" />
                  </div>
                  <div>
                    <Label htmlFor="estilo">Estilo de Viagem</Label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Econômica</option>
                      <option>Conforto</option>
                      <option>Luxo</option>
                      <option>Aventura</option>
                      <option>Cultural</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full" size="lg">Criar Roteiro Personalizado</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspirações de Destino</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Europa Clássica</h3>
                    <p className="text-sm opacity-90">15 dias por 5 países</p>
                    <p className="font-bold mt-2">A partir de R$ 8.500</p>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Tailândia Exótica</h3>
                    <p className="text-sm opacity-90">10 dias de aventura</p>
                    <p className="font-bold mt-2">A partir de R$ 5.200</p>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Chile & Argentina</h3>
                    <p className="text-sm opacity-90">12 dias pela Cordilheira</p>
                    <p className="font-bold mt-2">A partir de R$ 6.800</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roteiro: Paris, França</CardTitle>
                <CardDescription>7 dias • 2 pessoas • Estilo Conforto • R$ 12.500</CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((day) => (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-lg">Dia {day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">09:00 - Café da manhã</h4>
                          <p className="text-gray-600 text-sm">Café Du Flore - Clássico bistro parisiense</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">10:30 - Visita ao Louvre</h4>
                          <p className="text-gray-600 text-sm">3 horas - Reserve com antecedência</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">14:00 - Almoço</h4>
                          <p className="text-gray-600 text-sm">L'As du Fallafel - Especialidade do Marais</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">16:00 - Torre Eiffel</h4>
                          <p className="text-gray-600 text-sm">Subida ao topo + fotos no Trocadéro</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">💡 Dicas do Especialista</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li>• Compre o Paris Museum Pass para economizar nas atrações</li>
                  <li>• Use o metrô - é mais rápido que táxi no centro</li>
                  <li>• Restaurantes fecham entre 14h-19h, planeje suas refeições</li>
                  <li>• Gorjetas de 10% são esperadas em restaurantes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viagens;
