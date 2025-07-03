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
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-neon neon-glow-subtle">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-neon mr-2 icon-glow" />
            <span className="text-xs sm:text-sm font-medium text-gradient-neon">
              Assistentes IA Especializados
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-neon">
              <span className="text-soft-white">
                Biblioteca de Assistentes Inteligentes
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-soft-white max-w-4xl mx-auto leading-relaxed">
              Resolva problemas do dia a dia com 6 especialistas digitais que funcionam 24h por dia.
              <span className="block mt-2 text-sm sm:text-base md:text-lg text-light-gray">Direito, finanças, produtos, compras, viagens… Tudo em um só lugar. E tudo pronto para responder com precisão, em segundos.</span>
            </p>
            
            {/* Impact Bullet Points */}
            <div className="mt-6 sm:mt-8 space-y-3 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <span className="text-green-400 font-semibold">🔐</span>
                <span>Consultas ilimitadas com IA treinada para te dar respostas reais</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <span className="text-green-400 font-semibold">💸</span>
                <span>Economize US$ 20 por mês utilizando o Chat Inteligente</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <span className="text-green-400 font-semibold">⚖️</span>
                <span>Dúvidas jurídicas? Compras? Planejamento financeiro? Temos um especialista pra isso.</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <span className="text-green-400 font-semibold">📲</span>
                <span>Acesse do celular, quando quiser, onde estiver</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <span className="text-green-400 font-semibold">💬</span>
                <span>5.000+ consultas já realizadas com 98% de satisfação</span>
              </div>
            </div>
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

          {/* Stats */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">6</div>
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
    </section>;
};
export default Hero;