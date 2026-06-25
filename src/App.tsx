import { lazy, Suspense, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { AcademyAuthProvider } from "./contexts/AcademyAuthContext";
import { VoltMarketAuthProvider } from "./contexts/VoltMarketAuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LazyErrorBoundary, SectionLoader } from "./components/LazyErrorBoundary";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { AcademyAuthGuard } from "./components/academy/AcademyAuthGuard";

// Index (landing) is the single eagerly-loaded page — it's the most-hit route
// and the first paint. EVERYTHING else is lazy so it drops out of the entry
// chunk. This is what keeps the bundle a public share viewer downloads small:
// before this change the entry chunk was ~5.7 MB because all ~30 pages were
// statically imported; a /view/:token visitor paid for the whole app just to
// see one PDF.
import Index from "./pages/Index";

// ── Lazily-loaded pages ──────────────────────────────────────────────────────
const AboutUs = lazy(() => import('./pages/AboutUs'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Advisory = lazy(() => import('./pages/Advisory'));
const WattFund = lazy(() => import('./pages/WattFund'));
const Hosting = lazy(() => import('./pages/Hosting'));
const EnergyRates = lazy(() => import('./pages/EnergyRates'));
const VoltScout = lazy(() => import('./pages/VoltScout'));
const VoltMarket = lazy(() => import('./pages/VoltMarket').then(m => ({ default: m.VoltMarket })));

// Academy + education (gated, rarely the share-viewer's path)
const Academy = lazy(() => import('./pages/Academy'));
const AcademyAuth = lazy(() => import('./pages/AcademyAuth'));
const AcademyAdmin = lazy(() => import('./pages/AcademyAdmin'));
const AcademyProgress = lazy(() => import('./pages/AcademyProgress'));
const MyCertificates = lazy(() => import('./pages/MyCertificates'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
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

// Test/diagnostic pages — never needed in a normal session.
const ComprehensiveTest = lazy(() => import('./pages/ComprehensiveTest'));

// ── Public secure-share viewers ──────────────────────────────────────────────
// Split into their own chunks AND isolated from the auth provider tree below,
// so an external viewer downloads only a tiny viewer chunk (plus the pdf
// vendor chunk for ViewDocument) instead of the whole authed app.
const ViewDocument = lazy(() => import("./pages/ViewDocument"));
const ViewSharedDashboard = lazy(() => import("./pages/ViewSharedDashboard"));
const SharedAESOReport = lazy(() => import('./pages/SharedAESOReport'));

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

// Full-page Suspense fallback for lazy routes.
const PageFallback = ({ message = 'Loading…' }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <SectionLoader message={message} />
  </div>
);

// Wrap a lazy route element in an error boundary + Suspense in one place.
function L({ name, children }: { name: string; children: ReactNode }) {
  return (
    <LazyErrorBoundary componentName={name}>
      <Suspense fallback={<PageFallback message={`Loading ${name}…`} />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Error fallback shown if a share viewer itself throws.
const ShareErrorFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4 p-8">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-xl">!</span>
      </div>
      <h2 className="text-xl font-semibold">Unable to load shared content</h2>
      <p className="text-muted-foreground">This link may have expired, been revoked, or the content failed to load.</p>
      <a href="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Return home
      </a>
    </div>
  </div>
);

// Public share viewer wrapper — its own error boundary + Suspense, NO auth
// providers. Keeps the viewer fast and resilient for anonymous visitors.
function ShareViewer({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={ShareErrorFallback}>
      <Suspense fallback={<PageFallback message="Loading shared content…" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Everything that needs the authenticated app shell (providers + main routes).
function AppRoutes() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wattfund" element={<L name="WattFund"><WattFund /></L>} />
          <Route path="/about" element={<L name="About Us"><AboutUs /></L>} />
          <Route path="/terms" element={<L name="Terms of Service"><TermsOfService /></L>} />
          <Route path="/privacy" element={<L name="Privacy Policy"><PrivacyPolicy /></L>} />
          <Route path="/hosting" element={<L name="Hosting"><Hosting /></L>} />
          <Route path="/energy-rates" element={<L name="Energy Rates"><EnergyRates /></L>} />
          <Route path="/advisory" element={<L name="Advisory"><Advisory /></L>} />

          <Route path="/academy" element={<AcademyAuthProvider><L name="Academy"><Academy /></L></AcademyAuthProvider>} />
          <Route path="/academy/progress" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Academy"><AcademyProgress /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/academy/auth" element={<AcademyAuthProvider><L name="Academy"><AcademyAuth /></L></AcademyAuthProvider>} />
          <Route path="/academy/admin" element={<AcademyAuthProvider><L name="Academy"><AcademyAdmin /></L></AcademyAuthProvider>} />
          <Route path="/academy/me" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Academy"><MyCertificates /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/verify/:certId" element={<L name="Certificate"><VerifyCertificate /></L>} />
          <Route path="/bitcoin" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><BitcoinEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/datacenters" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><DatacenterEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/aeso-101" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><AESOEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/hydro-datacenters" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><HydroDatacenterEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/electrical-infrastructure" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><ElectricalInfrastructureEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/noise-management" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><NoiseManagementEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/immersion-cooling" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><ImmersionCoolingEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/mining-economics" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><MiningEconomicsEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/operations" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><OperationsEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/strategic-operations" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><StrategicOperationsMasterclass /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/taxes-insurance" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><TaxesInsuranceEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/engineering-permitting" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><EngineeringPermittingEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />
          <Route path="/networking" element={<AcademyAuthProvider><AcademyAuthGuard><L name="Course"><NetworkingEducation /></L></AcademyAuthGuard></AcademyAuthProvider>} />

          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/app/*" element={<L name="VoltScout"><VoltScout /></L>} />
          <Route path="/voltmarket/*" element={
            <L name="VoltMarket">
              <VoltMarketAuthProvider>
                <VoltMarket />
              </VoltMarketAuthProvider>
            </L>
          } />
          <Route path="/comprehensive-test" element={<L name="Diagnostics"><ComprehensiveTest /></L>} />
        </Routes>
      </PermissionsProvider>
    </AuthProvider>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public secure-share viewers — provider-free, lazy, resilient. */}
            <Route path="/view/:token" element={<ShareViewer><ViewDocument /></ShareViewer>} />
            <Route path="/share/dashboard/:token" element={<ShareViewer><ViewSharedDashboard /></ShareViewer>} />
            <Route path="/shared/aeso-report/:token" element={<ShareViewer><SharedAESOReport /></ShareViewer>} />

            {/* Everything else runs inside the authenticated app shell. */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
          <InstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
