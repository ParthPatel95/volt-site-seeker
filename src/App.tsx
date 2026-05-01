import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { VoltMarketAuthProvider } from "./contexts/VoltMarketAuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { AcademyAuthProvider } from "./contexts/AcademyAuthContext";
import { CurrencyProvider } from "./hooks/useCurrency";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SectionLoader } from "./components/LazyErrorBoundary";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { ReloadPrompt } from "./components/pwa/ReloadPrompt";
import { AcademyAuthGuard } from "./components/academy/AcademyAuthGuard";

// `Index` and the static-content top-level pages stay eagerly imported so
// the very first paint on `/` (the most common entry) doesn't pay an extra
// network round-trip.
import Index from "./pages/Index";

// Everything else is lazy. Previously 30+ pages were imported statically
// here, dragging an entire ~5 MB main bundle onto every visitor regardless
// of which route they hit. With a single top-level <Suspense> boundary the
// router fetches only the chunk for the route the user actually requested.
const VoltMarket = lazy(() => import('./pages/VoltMarket').then(m => ({ default: m.VoltMarket })));
const VoltScout = lazy(() => import('./pages/VoltScout'));
const WattFund = lazy(() => import('./pages/WattFund'));
const Hosting = lazy(() => import('./pages/Hosting'));

const Academy = lazy(() => import('./pages/Academy'));
const AcademyAuth = lazy(() => import('./pages/AcademyAuth'));
const AcademyAdmin = lazy(() => import('./pages/AcademyAdmin'));
const AcademyProgress = lazy(() => import('./pages/AcademyProgress'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const MyCertificates = lazy(() => import('./pages/MyCertificates'));

const BitcoinEducation = lazy(() => import('./pages/BitcoinEducation'));
const DatacenterEducation = lazy(() => import('./pages/DatacenterEducation'));
const AESOEducation = lazy(() => import('./pages/AESOEducation'));
const HydroDatacenterEducation = lazy(() => import('./pages/HydroDatacenterEducation'));
const ElectricalInfrastructureEducation = lazy(() => import('./pages/ElectricalInfrastructureEducation'));
const NoiseManagementEducation = lazy(() => import('./pages/NoiseManagementEducation'));
const ImmersionCoolingEducation = lazy(() => import('./pages/ImmersionCoolingEducation'));
const MiningEconomicsEducation = lazy(() => import('./pages/MiningEconomicsEducation'));
const OperationsEducation = lazy(() => import('./pages/OperationsEducation'));
const StrategicOperationsMasterclass = lazy(() => import('./pages/StrategicOperationsMasterclass'));
const TaxesInsuranceEducation = lazy(() => import('./pages/TaxesInsuranceEducation'));
const EngineeringPermittingEducation = lazy(() => import('./pages/EngineeringPermittingEducation'));
const NetworkingEducation = lazy(() => import('./pages/NetworkingEducation'));

const AboutUs = lazy(() => import('./pages/AboutUs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const SharedAESOReport = lazy(() => import('./pages/SharedAESOReport'));
const ComprehensiveTest = lazy(() => import('./pages/ComprehensiveTest'));
const ViewDocument = lazy(() => import('./pages/ViewDocument'));
const ViewSharedDashboard = lazy(() => import('./pages/ViewSharedDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <SectionLoader message="Loading…" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <CurrencyProvider initialCurrency="USD">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                {/* Single top-level Suspense boundary for all lazy routes.
                    Pages opt out by being eagerly imported above (only Index
                    today). The ErrorBoundary at the top of the tree catches
                    chunk-load failures (e.g. user offline mid-navigation). */}
                <Suspense fallback={RouteFallback}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/wattfund" element={<WattFund />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/hosting" element={<Hosting />} />

                    <Route path="/academy" element={<AcademyAuthProvider><Academy /></AcademyAuthProvider>} />
                    <Route path="/academy/progress" element={<AcademyAuthProvider><AcademyAuthGuard><AcademyProgress /></AcademyAuthGuard></AcademyAuthProvider>} />
                    <Route path="/academy/auth" element={<AcademyAuthProvider><AcademyAuth /></AcademyAuthProvider>} />
                    <Route path="/academy/admin" element={<AcademyAuthProvider><AcademyAdmin /></AcademyAuthProvider>} />
                    <Route path="/academy/me" element={<AcademyAuthProvider><AcademyAuthGuard><MyCertificates /></AcademyAuthGuard></AcademyAuthProvider>} />
                    <Route path="/verify/:certId" element={<VerifyCertificate />} />

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
                    <Route path="/networking" element={<AcademyAuthProvider><AcademyAuthGuard><NetworkingEducation /></AcademyAuthGuard></AcademyAuthProvider>} />

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
                </Suspense>
                <InstallPrompt />
                <ReloadPrompt />
              </BrowserRouter>
            </TooltipProvider>
          </CurrencyProvider>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
