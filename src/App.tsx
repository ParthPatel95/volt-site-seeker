
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import { PropertyList } from "@/components/PropertyList";
import { MultiSourceScraper } from "@/components/MultiSourceScraper";
import { CorporateIntelligence } from "@/components/CorporateIntelligence";
import { PowerInfrastructure } from "@/components/PowerInfrastructure";
import { AlertsSystem } from "@/components/AlertsSystem";
import { DataManagement } from "@/components/DataManagement";
import NotFound from "@/pages/NotFound";
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/scraper" element={<MultiSourceScraper />} />
          <Route path="/energy-rates" element={<EnergyRateIntelligence />} />
          <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
          <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
          <Route path="/alerts" element={<AlertsSystem />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
