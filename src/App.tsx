
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import EnergyRates from "./pages/EnergyRates";
import EnergyRatesTest from "./pages/EnergyRatesTest";
import { Dashboard } from "@/components/Dashboard";
import { AESOMarket } from "@/components/AESOMarket";
import { ERCOTMarket } from "@/components/ERCOTMarket";
import { PowerInfrastructure } from "@/components/PowerInfrastructure";
import { CorporateIntelligence } from "@/components/CorporateIntelligence";
import { MultiSourceScraper } from "@/components/MultiSourceScraper";
import { AuthWrapper } from "@/components/AuthWrapper";
import { EnhancedGridLineTracer } from "@/components/energy/EnhancedGridLineTracer";
import { IndustryIntelligence } from "@/components/industry_intel/IndustryIntelligence";
import { BTCROIMainPage } from "@/components/btc_roi/BTCROIMainPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AuthWrapper><Index /></AuthWrapper>} />
            <Route path="/app/dashboard" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
            <Route path="/app/aeso-market" element={<AuthWrapper><AESOMarket /></AuthWrapper>} />
            <Route path="/app/ercot-market" element={<AuthWrapper><ERCOTMarket /></AuthWrapper>} />
            <Route path="/app/power-infrastructure" element={<AuthWrapper><PowerInfrastructure /></AuthWrapper>} />
            <Route path="/app/corporate-intelligence" element={<AuthWrapper><CorporateIntelligence /></AuthWrapper>} />
            <Route path="/app/multi-source-scraper" element={<AuthWrapper><MultiSourceScraper /></AuthWrapper>} />
            <Route path="/app/enhanced-grid-tracer" element={<AuthWrapper><EnhancedGridLineTracer /></AuthWrapper>} />
            <Route path="/app/industry-intelligence" element={<AuthWrapper><IndustryIntelligence /></AuthWrapper>} />
            <Route path="/app/btc-roi" element={<AuthWrapper><BTCROIMainPage /></AuthWrapper>} />
            <Route path="/app/settings" element={<AuthWrapper><Settings /></AuthWrapper>} />
            <Route path="/app/energy-rates" element={<AuthWrapper><EnergyRates /></AuthWrapper>} />
            <Route path="/app/energy-rates-test" element={<AuthWrapper><EnergyRatesTest /></AuthWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
