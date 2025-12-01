
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { VoltMarket } from "./pages/VoltMarket";
import { VoltMarketAuthProvider } from "./contexts/VoltMarketAuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import VoltScout from "./pages/VoltScout";
import WattFund from "./pages/WattFund";
import ComprehensiveTest from "./pages/ComprehensiveTest";
import ComprehensiveFeaturesTest from "./pages/ComprehensiveFeaturesTest";
import ViewDocument from "./pages/ViewDocument";
import ViewSharedDashboard from "./pages/ViewSharedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wattfund" element={<WattFund />} />
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
            <Route path="/app/*" element={<VoltScout />} />
            <Route path="/voltmarket/*" element={
              <VoltMarketAuthProvider>
                <VoltMarket />
              </VoltMarketAuthProvider>
            } />
            <Route path="/comprehensive-test" element={<ComprehensiveTest />} />
            <Route path="/view/:token" element={<ViewDocument />} />
            <Route path="/share/dashboard/:token" element={<ViewSharedDashboard />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
