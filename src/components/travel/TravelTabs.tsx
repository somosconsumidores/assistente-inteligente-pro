
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Calendar } from 'lucide-react';

interface TravelTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TravelTabs: React.FC<TravelTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mobile-padding pb-4">
      <div className="flex bg-gray-800 rounded-lg p-1">
        <Button
          variant={activeTab === 'planner' ? 'default' : 'ghost'}
          onClick={() => onTabChange('planner')}
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
          onClick={() => onTabChange('saved')}
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
          onClick={() => onTabChange('itinerary')}
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
  );
};
