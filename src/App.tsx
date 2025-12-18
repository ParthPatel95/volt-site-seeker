import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { VoltMarket } from "./pages/VoltMarket";
import { VoltMarketAuthProvider } from "./contexts/VoltMarketAuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import VoltScout from "./pages/VoltScout";
import WattFund from "./pages/WattFund";
import Hosting from "./pages/Hosting";
import BitcoinEducation from "./pages/BitcoinEducation";
import DatacenterEducation from "./pages/DatacenterEducation";
import AESOEducation from "./pages/AESOEducation";
import HydroDatacenterEducation from "./pages/HydroDatacenterEducation";
import ElectricalInfrastructureEducation from "./pages/ElectricalInfrastructureEducation";
import NoiseManagementEducation from "./pages/NoiseManagementEducation";
import Academy from "./pages/Academy";


const AboutUs = lazy(() => import('./pages/AboutUs'));
import SharedAESOReport from './pages/SharedAESOReport';
import ComprehensiveTest from "./pages/ComprehensiveTest";
import ComprehensiveFeaturesTest from "./pages/ComprehensiveFeaturesTest";
import ViewDocument from "./pages/ViewDocument";
import ViewSharedDashboard from "./pages/ViewSharedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/wattfund" element={<WattFund />} />
                <Route path="/about" element={
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <AboutUs />
                  </Suspense>
                } />
                <Route path="/hosting" element={<Hosting />} />
                <Route path="/academy" element={<Academy />} />
                <Route path="/bitcoin" element={<BitcoinEducation />} />
                <Route path="/datacenters" element={<DatacenterEducation />} />
                <Route path="/aeso-101" element={<AESOEducation />} />
                <Route path="/hydro-datacenters" element={<HydroDatacenterEducation />} />
                <Route path="/electrical-infrastructure" element={<ElectricalInfrastructureEducation />} />
                <Route path="/noise-management" element={<NoiseManagementEducation />} />
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
                <Route path="/shared/aeso-report/:token" element={
                  <ErrorBoundary fallback={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center space-y-4 p-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 text-xl">!</span>
                        </div>
                        <h2 className="text-xl font-semibold">Unable to Load Report</h2>
                        <p className="text-muted-foreground">There was an error loading the shared report.</p>
                        <a href="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                          Return Home
                        </a>
                      </div>
                    </div>
                  }>
                    <SharedAESOReport />
                  </ErrorBoundary>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
