
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SelectAssistant from "./pages/SelectAssistant";
import DireitoConsumidor from "./pages/DireitoConsumidor";
import Financas from "./pages/Financas";
import Produtos from "./pages/Produtos";
import Viagens from "./pages/Viagens";
import Supermercado from "./pages/Supermercado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/select-assistant" element={<SelectAssistant />} />
          <Route path="/direito-consumidor" element={<DireitoConsumidor />} />
          <Route path="/financas" element={<Financas />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/viagens" element={<Viagens />} />
          <Route path="/supermercado" element={<Supermercado />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
