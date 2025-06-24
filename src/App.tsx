
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Dashboard } from "@/components/Dashboard";
import { AESOMarket } from "@/components/AESOMarket";
import { AESOMarketIntelligence } from "@/components/AESOMarketIntelligence";
import { AESOIntelligence } from "@/components/AESOIntelligence";
import { CorporateIntelligence } from "@/components/CorporateIntelligence";
import { PowerInfrastructure } from "@/components/PowerInfrastructure";
import { DataManagement } from "@/components/DataManagement";
import { SecureAuth } from "@/components/SecureAuth";
import { IdleIndustryScannerWrapper } from "@/components/IdleIndustryScannerWrapper";
import Index from "./pages/Index";
import EnergyRates from "./pages/EnergyRates";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<SecureAuth />} />
          <Route
            path="/app"
            element={
              <AuthWrapper>
                <Dashboard />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/aeso-market"
            element={
              <AuthWrapper>
                <AESOMarket />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/aeso-intelligence"
            element={
              <AuthWrapper>
                <AESOMarketIntelligence />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/aeso-intelligence-tools"
            element={
              <AuthWrapper>
                <AESOIntelligence />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/energy-rates"
            element={
              <AuthWrapper>
                <EnergyRates />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/corporate-intelligence"
            element={
              <AuthWrapper>
                <CorporateIntelligence />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/idle-industry-scanner"
            element={
              <AuthWrapper>
                <IdleIndustryScannerWrapper />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/power-infrastructure"
            element={
              <AuthWrapper>
                <PowerInfrastructure />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/data-management"
            element={
              <AuthWrapper>
                <DataManagement />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/settings"
            element={
              <AuthWrapper>
                <Settings />
              </AuthWrapper>
            }
          />
          <Route
            path="/app/help"
            element={
              <AuthWrapper>
                <Help />
              </AuthWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
