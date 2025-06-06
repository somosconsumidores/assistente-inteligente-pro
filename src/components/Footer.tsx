
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    const phoneNumber = "5521971467532";
    const message = "Olá! Gostaria de saber mais sobre a Biblioteca IA.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-gray-950 border-t border-gray-800 safe-area-bottom">
      <div className="mobile-padding py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Logo and Description */}
            <div className="lg:col-span-1 space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BI</span>
                </div>
                <span className="font-bold text-lg text-white">Biblioteca AI</span>
              </Link>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Sua biblioteca pessoal de assistentes IA especializados para resolver problemas do dia a dia.
              </p>
            </div>

            {/* Assistentes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg text-white">Assistentes</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/direito-consumidor" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Direito do Consumidor
                  </Link>
                </li>
                <li>
                  <Link to="/financas" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Consultor Financeiro
                  </Link>
                </li>
                <li>
                  <Link to="/produtos" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Mestre dos Produtos
                  </Link>
                </li>
                <li>
                  <Link to="/viagens" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Consultor de Viagens
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Úteis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg text-white">Links Úteis</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link to="/login" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Fazer Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <a href="#precos" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#funcionalidades" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Funcionalidades
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg text-white">Contato</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <button 
                    onClick={handleWhatsAppClick}
                    className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    WhatsApp
                  </button>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-400">contato@bibliotecaai.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-400">(21) 97146-7532</span>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-400">Rio de Janeiro, RJ</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 sm:pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                © {currentYear} Biblioteca AI. Todos os direitos reservados.
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6">
                <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-400 transition-colors">
                  Privacidade
                </a>
                <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-400 transition-colors">
                  Termos
                </a>
                <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-400 transition-colors">
                  Suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
