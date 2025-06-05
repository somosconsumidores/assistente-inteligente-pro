import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Plane, Loader2, BookOpen, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTravelItinerary } from '@/hooks/useTravelItinerary';
import { useSavedItineraries } from '@/hooks/useSavedItineraries';
import GeneratedItinerary from '@/components/GeneratedItinerary';
import SavedItinerariesList from '@/components/SavedItinerariesList';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const Viagens = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') || 'planner';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewingSavedItinerary, setViewingSavedItinerary] = useState(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    destination: '',
    budget: '',
    departureDate: '',
    returnDate: '',
    travelersCount: '1',
    travelStyle: 'Econômica',
    additionalPreferences: ''
  });

  // Update active tab when URL changes and reset states when navigating to planner
  useEffect(() => {
    const tab = searchParams.get('tab') || 'planner';
    setActiveTab(tab);
    
    // If navigating to planner tab, reset all states
    if (tab === 'planner') {
      setViewingSavedItinerary(null);
      clearItinerary();
    }
  }, [searchParams]);
  
  const {
    generateItinerary,
    isGenerating,
    generatedItinerary,
    clearItinerary
  } = useTravelItinerary();
  
  const {
    savedItineraries,
    isLoading: isLoadingSaved,
    saveItinerary,
    deleteItinerary
  } = useSavedItineraries();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      const result = await saveItinerary(generatedItinerary, formData);
      
      if (result) {
        toast({
          title: "Roteiro Salvo com Sucesso!",
          description: "Seu roteiro foi salvo e pode ser acessado na aba 'Salvos'",
          variant: "default",
        });
      }
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
    navigate('/viagens?tab=planner', { replace: true });
  };

  const handleViewSavedItinerary = (itinerary: any) => {
    console.log('Visualizando roteiro salvo:', itinerary);
    setViewingSavedItinerary(itinerary);
    setActiveTab('viewing');
  };

  const handleDeleteItinerary = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este roteiro?')) {
      await deleteItinerary(id);
    }
  };

  const handleTabChange = (tab: string) => {
    navigate(`/viagens?tab=${tab}`, { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Mobile-optimized Header - Fixed */}
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

          {/* Mobile Tab Navigation - Fixed under header */}
          {!generatedItinerary && !viewingSavedItinerary && (
            <div className="mobile-padding pb-4">
              <div className="flex bg-gray-800 rounded-lg p-1">
                <Button
                  variant={activeTab === 'planner' ? 'default' : 'ghost'}
                  onClick={() => handleTabChange('planner')}
                  className={`flex-1 h-10 text-xs sm:text-sm ${
                    activeTab === 'planner' 
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Planejar
                </Button>
                <Button
                  variant={activeTab === 'saved' ? 'default' : 'ghost'}
                  onClick={() => handleTabChange('saved')}
                  className={`flex-1 h-10 text-xs sm:text-sm ${
                    activeTab === 'saved' 
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Salvos
                </Button>
                <Button
                  variant={activeTab === 'itinerary' ? 'default' : 'ghost'}
                  onClick={() => handleTabChange('itinerary')}
                  className={`flex-1 h-10 text-xs sm:text-sm ${
                    activeTab === 'itinerary' 
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Exemplo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="mobile-padding py-4 sm:py-6 space-y-6">
            {/* Show generated itinerary */}
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
                {/* Planner Tab */}
                {activeTab === 'planner' && (
                  <div className="space-y-6">
                    <Card className="border-gray-700 bg-gray-800/50">
                      <CardHeader>
                        <CardTitle className="text-slate-50">Planeje sua Viagem Perfeita</CardTitle>
                        <CardDescription className="text-slate-400">
                          Conte-me seus detalhes e criarei um roteiro personalizado
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Mobile-optimized form grid */}
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="destino" className="text-slate-300">Destino</Label>
                            <Input 
                              id="destino" 
                              placeholder="Ex: Paris, França" 
                              value={formData.destination} 
                              onChange={e => handleInputChange('destination', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="data-ida" className="text-slate-300">Data de Ida</Label>
                              <Input 
                                id="data-ida" 
                                type="date" 
                                value={formData.departureDate} 
                                onChange={e => handleInputChange('departureDate', e.target.value)}
                                className="bg-gray-700 border-gray-600 text-slate-50 h-12 touch-target"
                              />
                            </div>
                            <div>
                              <Label htmlFor="data-volta" className="text-slate-300">Data de Volta</Label>
                              <Input 
                                id="data-volta" 
                                type="date" 
                                value={formData.returnDate} 
                                onChange={e => handleInputChange('returnDate', e.target.value)}
                                className="bg-gray-700 border-gray-600 text-slate-50 h-12 touch-target"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="orcamento" className="text-slate-300">Orçamento (R$)</Label>
                              <Input 
                                id="orcamento" 
                                placeholder="0,00" 
                                type="number" 
                                value={formData.budget} 
                                onChange={e => handleInputChange('budget', e.target.value)}
                                className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
                              />
                            </div>
                            <div>
                              <Label htmlFor="pessoas" className="text-slate-300">Pessoas</Label>
                              <Input 
                                id="pessoas" 
                                type="number" 
                                min="1" 
                                placeholder="1" 
                                value={formData.travelersCount} 
                                onChange={e => handleInputChange('travelersCount', e.target.value)}
                                className="bg-gray-700 border-gray-600 text-slate-50 placeholder-gray-400 h-12 touch-target"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="estilo" className="text-slate-300">Estilo de Viagem</Label>
                            <select 
                              className="w-full p-3 h-12 bg-gray-700 border border-gray-600 rounded-md text-slate-50 touch-target"
                              value={formData.travelStyle} 
                              onChange={e => handleInputChange('travelStyle', e.target.value)}
                            >
                              <option>Econômica</option>
                              <option>Conforto</option>
                              <option>Luxo</option>
                              <option>Aventura</option>
                              <option>Cultural</option>
                            </select>
                          </div>
                          
                          <div>
                            <Label htmlFor="preferencias" className="text-slate-300">Preferências Adicionais (Opcional)</Label>
                            <textarea 
                              id="preferencias" 
                              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-slate-50 placeholder-gray-400 min-h-[80px] touch-target" 
                              rows={3} 
                              placeholder="Ex: Gosto de museus, prefiro evitar atividades muito físicas..." 
                              value={formData.additionalPreferences} 
                              onChange={e => handleInputChange('additionalPreferences', e.target.value)} 
                            />
                          </div>
                          
                          <Button 
                            className="w-full h-12 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium touch-target" 
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
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inspirations Section - Mobile optimized */}
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
                  </div>
                )}

                {/* Saved Itineraries Tab */}
                {activeTab === 'saved' && (
                  <div className="space-y-6">
                    <Card className="border-gray-700 bg-gray-800/50">
                      <CardHeader>
                        <CardTitle className="text-slate-50">Seus Roteiros Salvos</CardTitle>
                        <CardDescription className="text-slate-400">
                          Acesse e gerencie todos os roteiros que você salvou
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {isLoadingSaved ? (
                      <Card className="border-gray-700 bg-gray-800/50">
                        <CardContent className="p-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-sky-500" />
                          <p className="text-slate-400">Carregando roteiros salvos...</p>
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

                {/* Example Itinerary Tab */}
                {activeTab === 'itinerary' && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Viagens;
