
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative mobile-padding py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-blue-300">
              Assistentes IA Especializados
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Sua Biblioteca de{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Assistentes IA
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              5 especialistas digitais para resolver seus problemas do dia a dia.
              <span className="block mt-2 text-sm sm:text-base md:text-lg text-gray-400">
                Direito, Finanças, Produtos, Viagens e muito mais.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
            {user ? (
              <Button 
                asChild 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-target"
              >
                <Link to="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Acessar meu Painel
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  asChild 
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-target"
                >
                  <Link to="/register" className="flex items-center">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-target"
                >
                  <Link to="/login">
                    Já tenho conta
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">5</div>
              <div className="text-sm sm:text-base text-gray-400">Assistentes Especializados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm sm:text-base text-gray-400">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm sm:text-base text-gray-400">Gratuito para começar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
