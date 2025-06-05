
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useTravelItinerary } from '@/hooks/useTravelItinerary';
import { useSavedItineraries } from '@/hooks/useSavedItineraries';
import GeneratedItinerary from '@/components/GeneratedItinerary';

import { TravelHeader } from '@/components/travel/TravelHeader';
import { TravelTabs } from '@/components/travel/TravelTabs';
import { TravelPlannerForm } from '@/components/travel/TravelPlannerForm';
import { TravelInspirations } from '@/components/travel/TravelInspirations';
import { ExampleItinerary } from '@/components/travel/ExampleItinerary';
import { SavedItinerariesTab } from '@/components/travel/SavedItinerariesTab';

const Viagens = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') || 'planner';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewingSavedItinerary, setViewingSavedItinerary] = useState(null);
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

  const resetFormAndNavigateToPlanner = () => {
    setFormData({
      destination: '',
      budget: '',
      departureDate: '',
      returnDate: '',
      travelersCount: '1',
      travelStyle: 'Econômica',
      additionalPreferences: ''
    });
    clearItinerary();
    setViewingSavedItinerary(null);
    navigate('/viagens?tab=planner', { replace: true });
  };

  // Listen for navigation from sidebar
  useEffect(() => {
    const handleTravelNavigation = () => {
      resetFormAndNavigateToPlanner();
    };

    // Custom event listener for sidebar navigation
    window.addEventListener('travel-navigation', handleTravelNavigation);
    return () => window.removeEventListener('travel-navigation', handleTravelNavigation);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <TravelHeader />

        {/* Mobile Tab Navigation - Fixed under header */}
        {!generatedItinerary && !viewingSavedItinerary && (
          <TravelTabs activeTab={activeTab} onTabChange={handleTabChange} />
        )}

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
                    <TravelPlannerForm 
                      formData={formData}
                      onInputChange={handleInputChange}
                      onCreateItinerary={handleCreateItinerary}
                      isGenerating={isGenerating}
                    />
                    <TravelInspirations />
                  </div>
                )}

                {/* Saved Itineraries Tab */}
                {activeTab === 'saved' && (
                  <SavedItinerariesTab 
                    isLoadingSaved={isLoadingSaved}
                    savedItineraries={savedItineraries}
                    onDelete={handleDeleteItinerary}
                    onView={handleViewSavedItinerary}
                  />
                )}

                {/* Example Itinerary Tab */}
                {activeTab === 'itinerary' && <ExampleItinerary />}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Viagens;
