import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, TrendingUp, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExampleFlow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeAssistant, setActiveAssistant] = useState("travel");

  const slidesData = {
    travel: [
      {
        image: "/lovable-uploads/6268ed3b-65e9-4f2a-a59a-9da8ba0c6970.png",
        title: "Escolha o Assistente Mestre das Viagens",
        description: "Acesse todas as funcionalidades de planejamento de viagens"
      },
      {
        image: "/lovable-uploads/fd9ed4bb-731c-416b-b51c-346833c0ce2b.png",
        title: "Escolha um destino e defina seu orçamento",
        description: "Informe para onde quer viajar, suas datas e orçamento disponível"
      },
      {
        image: "/lovable-uploads/8e38893d-32f9-4426-8ae7-a8bb2973d37d.png",
        title: "Pronto, receba o preço da passagem, estimativa de hospedagem e roteiro completo", 
        description: "Em segundos você tem um planejamento completo com preços reais"
      },
      {
        image: "/lovable-uploads/015618bc-508c-4ce2-8da7-59545a1d365b.png",
        title: "Ou se estiver sem ideias, use o Destinos Surpresa",
        description: "Basta inserir o orçamento que nossa IA analisa e sugere destinos perfeitos"
      },
      {
        image: "/lovable-uploads/3753c324-b8e8-4479-a392-d5f8b7709fad.png",
        title: "E pronto! Recomendamos um destino com base em seu orçamento disponível :)",
        description: "Receba sugestões personalizadas dentro do seu budget"
      }
    ],
    financial: [
      {
        image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=600&fit=crop",
        title: "Escolha o Consultor Financeiro",
        description: "Acesse análises e planejamento financeiro personalizado"
      },
      {
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=600&fit=crop",
        title: "Informe sua situação financeira atual",
        description: "Insira sua renda, gastos fixos, variáveis e objetivos financeiros"
      },
      {
        image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=600&fit=crop",
        title: "Receba análise completa da sua situação",
        description: "Dashboard com métricas, alertas e insights personalizados"
      },
      {
        image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=400&h=600&fit=crop",
        title: "Visualize relatórios e projeções",
        description: "Gráficos detalhados sobre seu orçamento e metas de economia"
      },
      {
        image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=600&fit=crop",
        title: "Receba recomendações personalizadas",
        description: "Estratégias específicas para otimizar suas finanças e atingir objetivos"
      }
    ],
    products: [
      {
        image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=600&fit=crop",
        title: "Escolha o Mestre dos Produtos",
        description: "Acesse comparações inteligentes e análises de produtos"
      },
      {
        image: "https://images.unsplash.com/photo-1518877593221-1f28583780b4?w=400&h=600&fit=crop",
        title: "Descreva o produto que você procura",
        description: "Conte detalhes do que precisa, orçamento e preferências"
      },
      {
        image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=400&h=600&fit=crop",
        title: "Compare preços em tempo real",
        description: "Veja preços atualizados de Amazon, Mercado Livre e outras lojas"
      },
      {
        image: "https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=400&h=600&fit=crop",
        title: "Analise características e benefícios",
        description: "Receba comparações detalhadas entre diferentes opções"
      },
      {
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=600&fit=crop",
        title: "Escolha a melhor opção para você",
        description: "Recomendação final baseada em custo-benefício e suas necessidades"
      }
    ]
  };

  const slides = slidesData[activeAssistant as keyof typeof slidesData];

  const handleTabChange = (value: string) => {
    setActiveAssistant(value);
    setCurrentSlide(0); // Reset to first slide when changing tabs
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="mobile-padding py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Veja um exemplo de como funciona{" "}
            <span className="text-gradient-neon">na prática</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Acompanhe o passo a passo de como nossos assistentes te ajudam no dia a dia
          </p>

          {/* Assistant Toggle */}
          <Tabs value={activeAssistant} onValueChange={handleTabChange} className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
              <TabsTrigger 
                value="travel" 
                className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Consultor de Viagens</span>
                <span className="sm:hidden">Viagens</span>
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Consultor Financeiro</span>
                <span className="sm:hidden">Financeiro</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Mestre dos Produtos</span>
                <span className="sm:hidden">Produtos</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Slider */}
        <div className="relative">
          <div className="card-futuristic p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Image */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative">
                  <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title}
                    className="w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl neon-glow-subtle"
                  />
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white neon-glow">
                    {currentSlide + 1}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6">
                  {slides[currentSlide].description}
                </p>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <button 
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  
                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide 
                            ? 'bg-purple-500' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Ir para slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            Pronto para começar? É rápido, fácil e gratuito.
          </p>
          <button className="btn-neon text-lg px-8 py-4 font-semibold">
            Testar Agora Gratuitamente
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExampleFlow;