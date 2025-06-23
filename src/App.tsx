
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import EnergyRates from "./pages/EnergyRates";
import EnergyRatesTest from "./pages/EnergyRatesTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route
            path="/app/*"
            element={
              <AuthWrapper>
                <Index />
              </AuthWrapper>
            }
          />
          <Route
            path="/energy-rates"
            element={
              <AuthWrapper>
                <EnergyRates />
              </AuthWrapper>
            }
          />
          <Route
            path="/energy-rates-test"
            element={
              <AuthWrapper>
                <EnergyRatesTest />
              </AuthWrapper>
            }
          />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
