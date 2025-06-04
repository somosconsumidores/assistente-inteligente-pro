
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Shield, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">BI</span>
              </div>
              <span className="font-bold text-xl text-white">Biblioteca AI</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Seus copilotos inteligentes para resolver problemas do dia a dia com tecnologia de IA avançada.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Assistentes */}
          <div>
            <h3 className="font-semibold text-white mb-4">Assistentes</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/direito-consumidor" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Direito do Consumidor
                </Link>
              </li>
              <li>
                <Link to="/financas" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Consultor Financeiro
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Mestre dos Produtos
                </Link>
              </li>
              <li>
                <Link to="/viagens" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Consultor de Viagens
                </Link>
              </li>
              <li>
                <Link to="/supermercado" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Assistente de Compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold text-white mb-4">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Painel de Controle
                </Link>
              </li>
              <li>
                <Link to="/recomendacoes-salvas" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Recomendações Salvas
                </Link>
              </li>
              <li>
                <Link to="/peticoes-salvas" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Petições Salvas
                </Link>
              </li>
              <li>
                <a href="#precos" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Planos e Preços
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-white mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2024 Biblioteca AI. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Política de Privacidade
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Termos de Serviço
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
