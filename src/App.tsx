
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DireitoConsumidor from '@/pages/DireitoConsumidor';
import Financas from '@/pages/Financas';
import Produtos from '@/pages/Produtos';
import Supermercado from '@/pages/Supermercado';
import Viagens from '@/pages/Viagens';
import ChatInteligente from '@/pages/ChatInteligente';
import SelectAssistant from '@/pages/SelectAssistant';
import MeusAssistentes from '@/pages/MeusAssistentes';
import SavedRecommendations from '@/pages/SavedRecommendations';
import SavedPetitions from '@/pages/SavedPetitions';
import LoginLogs from '@/pages/LoginLogs';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedAssistantRoute from '@/components/ProtectedAssistantRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="biblioteca-ai-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meus-assistentes"
                  element={
                    <ProtectedRoute>
                      <MeusAssistentes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/select-assistant"
                  element={
                    <ProtectedRoute>
                      <SelectAssistant />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/direito-consumidor"
                  element={
                    <ProtectedRoute>
                      <ProtectedAssistantRoute assistantId="direito-consumidor" assistantName="Direito do Consumidor">
                        <DireitoConsumidor />
                      </ProtectedAssistantRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financas"
                  element={
                    <ProtectedRoute>
                      <ProtectedAssistantRoute assistantId="financas" assistantName="Finanças">
                        <Financas />
                      </ProtectedAssistantRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/produtos"
                  element={
                    <ProtectedRoute>
                      <ProtectedAssistantRoute assistantId="produtos" assistantName="Mestre dos Produtos">
                        <Produtos />
                      </ProtectedAssistantRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/supermercado"
                  element={
                    <ProtectedRoute>
                      <ProtectedAssistantRoute assistantId="supermercado" assistantName="Supermercado">
                        <Supermercado />
                      </ProtectedAssistantRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/viagens"
                  element={
                    <ProtectedRoute>
                      <ProtectedAssistantRoute assistantId="viagens" assistantName="Viagens">
                        <Viagens />
                      </ProtectedAssistantRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat-inteligente"
                  element={
                    <ProtectedRoute>
                      <ChatInteligente />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-recommendations"
                  element={
                    <ProtectedRoute>
                      <SavedRecommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-petitions"
                  element={
                    <ProtectedRoute>
                      <SavedPetitions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login-logs"
                  element={
                    <ProtectedRoute>
                      <LoginLogs />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
