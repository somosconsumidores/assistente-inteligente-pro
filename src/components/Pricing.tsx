
import React from 'react';
import { Check, Clock } from 'lucide-react';
import SubscriptionButton from './SubscriptionButton';

const Pricing = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Escolha Seu Plano
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Comece gratuitamente ou desbloqueie todo o potencial com nosso plano premium
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plano Gratuito */}
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Selo de tempo limitado */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
              <Clock className="w-3 h-3" />
              Acesso gratuito por tempo limitado
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Plano Gratuito</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">R$ 0</span>
              <span className="text-gray-600">/mês</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">1 assistente de sua escolha</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Histórico básico</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Suporte por email</span>
              </li>
            </ul>
            <SubscriptionButton 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              variant="outline"
            />
          </div>
        </div>

        {/* Plano Premium */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform">
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Plano Premium</h3>
              <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                Mais Popular
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">R$ 29,90</span>
              <span className="text-purple-100">/mês</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-white">Todos os assistentes disponíveis</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-white">Histórico completo salvos</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-white">Suporte prioritário</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-white">Recursos exclusivos</span>
              </li>
            </ul>
            <SubscriptionButton 
              className="w-full bg-white text-purple-600 hover:bg-gray-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
