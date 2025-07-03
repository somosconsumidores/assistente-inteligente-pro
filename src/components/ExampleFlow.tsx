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
        image: "/lovable-uploads/a3a23be3-6eb5-488e-a373-82c81d62732d.png",
        title: "Responda as perguntas do nosso Consultor Financeiro",
        description: "Conte sobre sua situação financeira atual para receber análises personalizadas"
      },
      {
        image: "/lovable-uploads/e225a78a-d0f1-4b49-a936-b1eaccba425c.png",
        title: "Defina as suas metas e objetivos",
        description: "Economizar, quitar dívidas, comprar um carro, etc - estabeleça seus objetivos financeiros"
      },
      {
        image: "/lovable-uploads/1b3f4d52-8cbf-4024-91f6-64573a72624a.png",
        title: "Receba uma visão da sua situação financeira atual",
        description: "Dashboard completo com análise detalhada das suas finanças e indicadores importantes"
      },
      {
        image: "/lovable-uploads/101a25f0-4390-4e94-8eda-695deb64f85c.png",
        title: "Solicite um plano de ação personalizado para a sua meta",
        description: "Estratégias específicas e passos práticos para alcançar seus objetivos financeiros"
      },
      {
        image: "/lovable-uploads/2a51cf62-545d-46c5-9e59-d43df60a6747.png",
        title: "Converse livremente com nosso consultor financeiro",
        description: "Tire todas as suas dúvidas e receba orientações personalizadas em tempo real"
      }
    ],
    products: [
      {
        image: "/lovable-uploads/64c12fd9-5bf2-4263-b76c-4e0776fc4c82.png",
        title: "Diga o produto que você deseja comprar e seu orçamento disponível",
        description: "Informe detalhes do que precisa e quanto quer investir na compra"
      },
      {
        image: "/lovable-uploads/924ac83a-43fc-4d31-83dd-25b2928a2f6f.png",
        title: "Receba nossa indicação com a classificação do Score Mestre",
        description: "Veja as ofertas disponíveis com análise completa de custo-benefício"
      },
      {
        image: "/lovable-uploads/93f3ee1e-a93d-496e-ae28-72be754d5fac.png",
        title: "Salve as recomendações em seu painel de controle",
        description: "Monitore os preços para compra e receba alertas quando houver promoções"
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
            Veja como nossos assistentes trabalham{" "}
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