
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sucesso!",
        description: "Logout realizado com sucesso"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">BI</span>
          </div>
          <span className="font-bold text-xl text-white">Biblioteca AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#assistentes" className="text-slate-300 hover:text-white transition-colors">
            Assistentes
          </a>
          <a href="#funcionalidades" className="text-slate-300 hover:text-white transition-colors">
            Funcionalidades
          </a>
          <a href="#precos" className="text-slate-300 hover:text-white transition-colors">
            Preços
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <Button variant="outline" className="hidden sm:flex items-center space-x-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300 hidden sm:block">
                Olá, {profile?.name || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-400 border-red-600 hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
                <Link to="/login" className="flex items-center space-x-1">
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Link to="/register" className="flex items-center space-x-1">
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Conta</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
