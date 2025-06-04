import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Plane, Loader2, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTravelItinerary } from '@/hooks/useTravelItinerary';
import { useSavedItineraries } from '@/hooks/useSavedItineraries';
import GeneratedItinerary from '@/components/GeneratedItinerary';
import SavedItinerariesList from '@/components/SavedItinerariesList';
import { useSearchParams } from 'react-router-dom';

const Viagens = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'planner';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewingSavedItinerary, setViewingSavedItinerary] = useState(null);
  const [formData, setFormData] = useState({
    destination: '',
    budget: '',
    departureDate: '',
    returnDate: '',
    travelersCount: '1',
    travelStyle: 'Econômica',
    additionalPreferences: ''
  });

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'planner';
    setActiveTab(tab);
  }, [searchParams]);

  const { generateItinerary, isGenerating, generatedItinerary, clearItinerary } = useTravelItinerary();
  const { savedItineraries, isLoading: isLoadingSaved, saveItinerary, deleteItinerary } = useSavedItineraries();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateItinerary = async () => {
    if (!formData.destination || !formData.departureDate || !formData.returnDate) {
      return;
    }

    await generateItinerary({
      destination: formData.destination,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate,
      travelersCount: parseInt(formData.travelersCount),
      travelStyle: formData.travelStyle,
      additionalPreferences: formData.additionalPreferences || undefined
    });
  };

  const handleSaveItinerary = async () => {
    if (generatedItinerary) {
      await saveItinerary(generatedItinerary, formData);
    }
  };

  const handleBackToPlanner = () => {
    clearItinerary();
    setViewingSavedItinerary(null);
    setFormData({
      destination: '',
      budget: '',
      departureDate: '',
      returnDate: '',
      travelersCount: '1',
      travelStyle: 'Econômica',
      additionalPreferences: ''
    });
    setActiveTab('planner');
  };

  const handleViewSavedItinerary = (itinerary: any) => {
    setViewingSavedItinerary(itinerary);
    setActiveTab('viewing');
  };

  const handleDeleteItinerary = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este roteiro?')) {
      await deleteItinerary(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Consultor de Viagens</h1>
                <p className="text-gray-600">
                  Planeje sua viagem perfeita com roteiros personalizados e dicas de especialista
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mostrar roteiro gerado, roteiro salvo ou interface de planejamento */}
        {generatedItinerary ? (
          <GeneratedItinerary 
            itinerary={generatedItinerary}
            onBackToPlanner={handleBackToPlanner}
            onSave={handleSaveItinerary}
          />
        ) : viewingSavedItinerary ? (
          <GeneratedItinerary 
            itinerary={viewingSavedItinerary.itinerary_data}
            onBackToPlanner={handleBackToPlanner}
            isSaved={true}
          />
        ) : (
          <>
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
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                onClick={() => setActiveTab('saved')}
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Roteiros Salvos</span>
              </Button>
              <Button 
                variant={activeTab === 'itinerary' ? 'default' : 'outline'}
                onClick={() => setActiveTab('itinerary')}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Exemplo</span>
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
                        <Input 
                          id="destino" 
                          placeholder="Ex: Paris, França"
                          value={formData.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="orcamento">Orçamento Total (R$)</Label>
                        <Input 
                          id="orcamento" 
                          placeholder="0,00" 
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="data-ida">Data de Ida</Label>
                        <Input 
                          id="data-ida" 
                          type="date"
                          value={formData.departureDate}
                          onChange={(e) => handleInputChange('departureDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="data-volta">Data de Volta</Label>
                        <Input 
                          id="data-volta" 
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pessoas">Número de Pessoas</Label>
                        <Input 
                          id="pessoas" 
                          type="number" 
                          min="1" 
                          placeholder="1"
                          value={formData.travelersCount}
                          onChange={(e) => handleInputChange('travelersCount', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estilo">Estilo de Viagem</Label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={formData.travelStyle}
                          onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                        >
                          <option>Econômica</option>
                          <option>Conforto</option>
                          <option>Luxo</option>
                          <option>Aventura</option>
                          <option>Cultural</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="preferencias">Preferências Adicionais (Opcional)</Label>
                      <textarea 
                        id="preferencias"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Ex: Gosto de museus, prefiro evitar atividades muito físicas..."
                        value={formData.additionalPreferences}
                        onChange={(e) => handleInputChange('additionalPreferences', e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleCreateItinerary}
                      disabled={isGenerating || !formData.destination || !formData.departureDate || !formData.returnDate}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando Roteiro...
                        </>
                      ) : (
                        'Criar Roteiro Personalizado'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Inspirations Section */}
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

            {/* Saved Itineraries Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seus Roteiros Salvos</CardTitle>
                    <CardDescription>
                      Acesse e gerencie todos os roteiros que você salvou
                    </CardDescription>
                  </CardHeader>
                </Card>

                {isLoadingSaved ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p>Carregando roteiros salvos...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <SavedItinerariesList
                    itineraries={savedItineraries}
                    onDelete={handleDeleteItinerary}
                    onView={handleViewSavedItinerary}
                  />
                )}
              </div>
            )}

            {/* Itinerary Tab - keep existing static example */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {/* Static Itinerary Example */}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Viagens;
