
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from "./components/theme-provider"

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
              <Route path="/direito-consumidor" element={
                <ProtectedRoute>
                  <ConsumerLaw />
                </ProtectedRoute>
              } />
              <Route path="/recomendacoes-salvas" element={
                <ProtectedRoute>
                  <SavedRecommendations />
                </ProtectedRoute>
              } />
              <Route path="/financas" element={
                <ProtectedRoute>
                  <Finances />
                </ProtectedRoute>
              } />
              <Route path="/viagens" element={
                <ProtectedRoute>
                  <Travel />
                </ProtectedRoute>
              } />
               <Route path="/assistentes" element={
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
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
