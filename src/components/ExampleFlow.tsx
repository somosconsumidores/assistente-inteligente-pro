import React from 'react';
import exemplo1 from '@/assets/exemplo-1.png';
import exemplo2 from '@/assets/exemplo-2.png';
import exemplo3 from '@/assets/exemplo-3.png';
import exemplo4 from '@/assets/exemplo-4.png';
import exemplo5 from '@/assets/exemplo-5.png';

const ExampleFlow = () => {
  const steps = [
    {
      image: exemplo1,
      title: "Escolha um destino e defina seu orçamento",
      description: "Informe para onde quer viajar, suas datas e orçamento disponível"
    },
    {
      image: exemplo2,
      title: "Pronto, receba o preço da passagem, estimativa de hospedagem e roteiro completo", 
      description: "Em segundos você tem um planejamento completo com preços reais"
    },
    {
      image: exemplo3,
      title: "Ou se estiver sem ideias, use o Destinos Surpresa. Basta inserir o orçamento",
      description: "Nossa IA analisa seu orçamento e sugere destinos perfeitos"
    },
    {
      image: exemplo4,
      title: "E pronto! Recomendamos um destino com base em seu orçamento disponível :)",
      description: "Receba sugestões personalizadas dentro do seu budget"
    },
    {
      image: exemplo5,
      title: "Escolha o Assistente Mestre das Viagens",
      description: "Acesse todas as funcionalidades de planejamento de viagens"
    }
  ];

  return (
    <section className="mobile-padding py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Veja um exemplo de como funciona{" "}
            <span className="text-gradient-neon">na prática</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Acompanhe o passo a passo de como nossos assistentes te ajudam no dia a dia
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 sm:space-y-20">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-8 sm:gap-12 lg:gap-16`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl neon-glow-subtle"
                  />
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white neon-glow">
                    {index + 1}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 sm:mt-20">
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