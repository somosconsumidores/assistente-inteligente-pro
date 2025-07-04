import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const Hero = () => {
  const {
    user
  } = useAuth();
  return <section className="relative mobile-padding py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-purple-900/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
      
      {/* Animated particles/dots background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse neon-glow"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse neon-glow-blue" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-purple-300 rounded-full animate-pulse neon-glow" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute top-60 right-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse neon-glow-blue" style={{
        animationDelay: '3s'
      }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8 -mt-8">
          {/* Mobile Image - moved to top */}
          <div className="lg:hidden flex justify-center items-center">
            <div className="relative">
              <img src="/lovable-uploads/34bb5e1e-d7aa-4050-be50-2baeacf13021.png" alt="Aplicativo Biblioteca IA em dispositivos móveis e desktop" className="max-w-full h-auto rounded-lg shadow-2xl" />
            </div>
          </div>

          {/* Badge - moved below image on mobile */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-neon neon-glow-subtle">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-neon mr-2 icon-glow" />
            <span className="text-xs sm:text-sm font-medium text-gradient-neon">
              Biblioteca de Assistentes Inteligentes
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-neon">
              
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-soft-white max-w-4xl mx-auto leading-relaxed">
              6 assistentes inteligentes para te ajudar, em um único lugar.
              <span className="block mt-2 text-sm sm:text-base text-light-gray md:text-base font-extralight">Direito, finanças, produtos, compras, viagens… Tudo em um só lugar. E tudo pronto para responder com precisão, em segundos.</span>
            </p>
            
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
            {user ? <Button asChild size="lg" className="w-full sm:w-auto btn-neon">
                <Link to="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 w-4 h-4 sm:w-5 sm:h-5 icon-glow" />
                  Acessar meu Painel
                </Link>
              </Button> : <>
                <Button asChild size="lg" className="w-full sm:w-auto btn-neon">
                  <Link to="/register" className="flex items-center">
                    Acessar gratuitamente agora
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 icon-glow" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto border-neon-blue bg-background/20 backdrop-blur-sm text-soft-white hover:bg-primary/10 hover:text-neon font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-target neon-glow-blue">
                  <Link to="/login">
                    Já tenho conta
                  </Link>
                </Button>
              </>}
          </div>

          {/* Additional Text */}
          <div className="pt-4">
            <p className="text-lg sm:text-xl text-gray-300 font-medium">Tenha especialistas de bolso.  Sem complicação.</p>
          </div>

          {/* Stats - moved to bottom center */}
          
          </div>
          
          {/* Right Column - Image */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <img src="/lovable-uploads/34bb5e1e-d7aa-4050-be50-2baeacf13021.png" alt="Aplicativo Biblioteca IA em dispositivos móveis e desktop" className="max-w-full h-auto rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="flex justify-center items-center pt-8 sm:pt-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            {/* 6 Especialistas */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-bold text-neon">6</span>
              <span className="text-sm sm:text-base text-soft-white">especialistas</span>
            </div>
            
            {/* 24 Horas */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-bold text-neon-blue">24h</span>
              <span className="text-sm sm:text-base text-soft-white">disponíveis</span>
            </div>
            
            {/* 100% Gratuito */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-bold text-green-400">100%</span>
              <span className="text-sm sm:text-base text-soft-white">gratuito</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;