
import React from 'react';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BI</span>
              </div>
              <span className="font-bold text-xl">Biblioteca AI</span>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md">
              Transforme sua rotina com 5 assistentes de IA especializados. 
              Tome decisões mais inteligentes em direito, finanças, produtos, viagens e compras.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Disponível no WhatsApp</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Assistentes</h4>
            <ul className="space-y-2 text-gray-300">
              <li>👨‍⚖️ Direito do Consumidor</li>
              <li>💰 Finanças Pessoais</li>
              <li>🛍️ Produtos e Compras</li>
              <li>✈️ Planejamento de Viagens</li>
              <li>🛒 Supermercado</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 Biblioteca AI. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">🇧🇷 Feito no Brasil</span>
            <span className="text-gray-400 text-sm">🤖 Powered by OpenAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
