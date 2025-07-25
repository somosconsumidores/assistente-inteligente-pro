import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sucesso!",
        description: "Logout realizado com sucesso"
      });
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "5521971467532";
    const message = "Olá! Gostaria de saber mais sobre a Biblioteca IA.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 safe-area-top neon-glow-subtle">
        <div className="mobile-padding py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo 
              linkClassName="touch-target" 
              className="text-sm text-center"
              size="md"
            />
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#assistentes" className="text-gray-300 hover:text-blue-400 transition-colors touch-target">
                Assistentes
              </a>
              <a href="#funcionalidades" className="text-gray-300 hover:text-blue-400 transition-colors touch-target">
                Funcionalidades
              </a>
              <a href="#precos" className="text-gray-300 hover:text-blue-400 transition-colors touch-target">Preços</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              <ThemeToggle />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleWhatsAppClick}
                className="hidden md:flex items-center space-x-2 border-gray-700 hover:bg-gray-800"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
              
              {user ? (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <span className="text-sm text-gray-300 hidden lg:block max-w-24 truncate">
                    {profile?.name || user.email?.split('@')[0]}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="flex items-center space-x-1 text-red-400 border-red-800 hover:bg-red-900/20 touch-target"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild className="border-gray-700 hover:bg-gray-800 text-white">
                    <Link to="/login" className="flex items-center space-x-1 touch-target text-white">
                      <LogIn className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline text-white">Entrar</span>
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="btn-neon-secondary text-sm">
                    <Link to="/register" className="flex items-center space-x-1 touch-target text-white">
                      <UserPlus className="w-4 h-4 text-white icon-glow" />
                      <span className="hidden sm:inline text-white">Criar Conta</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="sm:hidden touch-target text-white" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden" onClick={closeMobileMenu}>
          <div className="absolute top-16 right-0 left-0 bg-gray-900 border-b border-gray-800 shadow-xl animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
            <nav className="mobile-padding py-6 space-y-4">
              <a href="#assistentes" className="block py-3 text-lg text-gray-300 hover:text-blue-400 transition-colors touch-target" onClick={closeMobileMenu}>
                Assistentes
              </a>
              <a href="#funcionalidades" className="block py-3 text-lg text-gray-300 hover:text-blue-400 transition-colors touch-target" onClick={closeMobileMenu}>
                Funcionalidades
              </a>
              <a href="#precos" className="block py-3 text-lg text-gray-300 hover:text-blue-400 transition-colors touch-target" onClick={closeMobileMenu}>
                Preços
              </a>
              
              <div className="pt-4 border-t border-gray-700 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleWhatsAppClick}
                  className="w-full justify-center border-gray-700 hover:bg-gray-800 touch-target"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                
                {user ? (
                  <>
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-300">
                        Olá, {profile?.name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-center text-red-400 border-red-800 hover:bg-red-900/20 touch-target" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button variant="outline" asChild className="w-full justify-center border-gray-700 hover:bg-gray-800 touch-target text-white">
                      <Link to="/login" onClick={closeMobileMenu} className="text-white">
                        <LogIn className="w-4 h-4 mr-2 text-white" />
                        <span className="text-white">Entrar</span>
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target">
                      <Link to="/register" onClick={closeMobileMenu} className="text-white">
                        <UserPlus className="w-4 h-4 mr-2 text-white" />
                        <span className="text-white">Criar Conta</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
