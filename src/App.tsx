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
import { AcademyAuthProvider } from "./contexts/AcademyAuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LazyErrorBoundary, SectionLoader } from "./components/LazyErrorBoundary";
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
import ImmersionCoolingEducation from "./pages/ImmersionCoolingEducation";
import MiningEconomicsEducation from "./pages/MiningEconomicsEducation";
import OperationsEducation from "./pages/OperationsEducation";
import StrategicOperationsMasterclass from "./pages/StrategicOperationsMasterclass";
import TaxesInsuranceEducation from "./pages/TaxesInsuranceEducation";
import EngineeringPermittingEducation from "./pages/EngineeringPermittingEducation";
import Academy from "./pages/Academy";
import AcademyAuth from "./pages/AcademyAuth";
import AcademyAdmin from "./pages/AcademyAdmin";
import { AcademyAuthGuard } from "./components/academy/AcademyAuthGuard";

const AboutUs = lazy(() => import('./pages/AboutUs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
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
                  <LazyErrorBoundary componentName="About Us">
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center bg-background">
                        <SectionLoader message="Loading About Us..." />
                      </div>
                    }>
                      <AboutUs />
                    </Suspense>
                  </LazyErrorBoundary>
                } />
                <Route path="/terms" element={
                  <LazyErrorBoundary componentName="Terms of Service">
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><SectionLoader message="Loading..." /></div>}>
                      <TermsOfService />
                    </Suspense>
                  </LazyErrorBoundary>
                } />
                <Route path="/privacy" element={
                  <LazyErrorBoundary componentName="Privacy Policy">
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><SectionLoader message="Loading..." /></div>}>
                      <PrivacyPolicy />
                    </Suspense>
                  </LazyErrorBoundary>
                } />
                <Route path="/hosting" element={<Hosting />} />
                <Route path="/academy" element={<AcademyAuthProvider><Academy /></AcademyAuthProvider>} />
                <Route path="/academy/auth" element={<AcademyAuthProvider><AcademyAuth /></AcademyAuthProvider>} />
                <Route path="/academy/admin" element={<AcademyAuthProvider><AcademyAdmin /></AcademyAuthProvider>} />
                <Route path="/bitcoin" element={<AcademyAuthProvider><AcademyAuthGuard><BitcoinEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/datacenters" element={<AcademyAuthProvider><AcademyAuthGuard><DatacenterEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/aeso-101" element={<AcademyAuthProvider><AcademyAuthGuard><AESOEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/hydro-datacenters" element={<AcademyAuthProvider><AcademyAuthGuard><HydroDatacenterEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/electrical-infrastructure" element={<AcademyAuthProvider><AcademyAuthGuard><ElectricalInfrastructureEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/noise-management" element={<AcademyAuthProvider><AcademyAuthGuard><NoiseManagementEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/immersion-cooling" element={<AcademyAuthProvider><AcademyAuthGuard><ImmersionCoolingEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/mining-economics" element={<AcademyAuthProvider><AcademyAuthGuard><MiningEconomicsEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/operations" element={<AcademyAuthProvider><AcademyAuthGuard><OperationsEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/strategic-operations" element={<AcademyAuthProvider><AcademyAuthGuard><StrategicOperationsMasterclass /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/taxes-insurance" element={<AcademyAuthProvider><AcademyAuthGuard><TaxesInsuranceEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
                <Route path="/engineering-permitting" element={<AcademyAuthProvider><AcademyAuthGuard><EngineeringPermittingEducation /></AcademyAuthGuard></AcademyAuthProvider>} />
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
