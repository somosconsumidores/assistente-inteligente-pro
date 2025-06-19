import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { ThemeProvider } from "./components/ThemeProvider"
import ProtectedAssistantRoute from './components/ProtectedAssistantRoute';

import Home from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ConsumerLaw from './pages/DireitoConsumidor';
import SavedRecommendations from './pages/SavedRecommendations';
import Finances from './pages/Financas';
import Travel from './pages/Viagens';
import Assistants from './pages/SelectAssistant';
import SavedPetitions from './pages/SavedPetitions';
import Produtos from './pages/Produtos';
import Supermercado from './pages/Supermercado';
import ChatInteligente from './pages/ChatInteligente';

const queryClient = new QueryClient();

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/chat-inteligente" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="chat-inteligente" assistantName="Chat Inteligente Premium">
                    <ChatInteligente />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/direito-consumidor" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="direito" assistantName="Mestre do Direito do Consumidor">
                    <ConsumerLaw />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/produtos" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="produtos" assistantName="Mestre dos Produtos">
                    <Produtos />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/supermercado" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="supermercado" assistantName="Mestre do Supermercado">
                    <Supermercado />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/recomendacoes-salvas" element={
                <ProtectedRoute>
                  <SavedRecommendations />
                </ProtectedRoute>
              } />
              <Route path="/financas" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="financas" assistantName="Mestre das Finanças">
                    <Finances />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/viagens" element={
                <ProtectedRoute>
                  <ProtectedAssistantRoute assistantId="viagens" assistantName="Mestre das Viagens">
                    <Travel />
                  </ProtectedAssistantRoute>
                </ProtectedRoute>
              } />
              <Route path="/assistentes" element={
                <ProtectedRoute>
                  <Assistants />
                </ProtectedRoute>
              } />
              <Route path="/select-assistant" element={
                <ProtectedRoute>
                  <Assistants />
                </ProtectedRoute>
              } />
              <Route path="/peticoes-salvas" element={
                <ProtectedRoute>
                  <SavedPetitions />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
            <ShadcnToaster />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
