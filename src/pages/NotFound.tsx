
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-600 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Página não encontrada</h2>
          <p className="text-gray-400 mb-8">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
          
          <div className="text-gray-500">
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à página anterior
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
