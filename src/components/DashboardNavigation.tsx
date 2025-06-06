
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardNavigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center">
      <Button
        onClick={() => navigate('/dashboard')}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        <LayoutDashboard className="w-5 h-5 mr-2" />
        Acessar Meu Painel
      </Button>
    </div>
  );
};

export default DashboardNavigation;
