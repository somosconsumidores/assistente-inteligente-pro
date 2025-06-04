
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import SelectAssistant from "./pages/SelectAssistant";
import Dashboard from "./pages/Dashboard";
import DireitoConsumidor from "./pages/DireitoConsumidor";
import Financas from "./pages/Financas";
import Produtos from "./pages/Produtos";
import Viagens from "./pages/Viagens";
import Supermercado from "./pages/Supermercado";
import SavedRecommendations from "./pages/SavedRecommendations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="biblioteca-ai-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/select-assistant" element={
                <ProtectedRoute>
                  <SelectAssistant />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/direito-consumidor" element={
                <ProtectedRoute>
                  <DireitoConsumidor />
                </ProtectedRoute>
              } />
              <Route path="/financas" element={
                <ProtectedRoute>
                  <Financas />
                </ProtectedRoute>
              } />
              <Route path="/produtos" element={
                <ProtectedRoute>
                  <Produtos />
                </ProtectedRoute>
              } />
              <Route path="/recomendacoes-salvas" element={
                <ProtectedRoute>
                  <SavedRecommendations />
                </ProtectedRoute>
              } />
              <Route path="/viagens" element={
                <ProtectedRoute>
                  <Viagens />
                </ProtectedRoute>
              } />
              <Route path="/supermercado" element={
                <ProtectedRoute>
                  <Supermercado />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
