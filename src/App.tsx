
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import DireitoConsumidor from '@/pages/DireitoConsumidor';
import Financas from '@/pages/Financas';
import Produtos from '@/pages/Produtos';
import Supermercado from '@/pages/Supermercado';
import Viagens from '@/pages/Viagens';
import SelectAssistant from '@/pages/SelectAssistant';
import SavedPetitions from '@/pages/SavedPetitions';
import SavedRecommendations from '@/pages/SavedRecommendations';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes with DashboardLayout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/direito-consumidor" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DireitoConsumidor />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/financas" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Financas />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/produtos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Produtos />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/supermercado" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Supermercado />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/viagens" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Viagens />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/select-assistant" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SelectAssistant />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/saved-petitions" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SavedPetitions />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/saved-recommendations" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SavedRecommendations />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
