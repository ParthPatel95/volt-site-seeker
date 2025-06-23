
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import { Dashboard } from './components/Dashboard';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import EnergyRates from './pages/EnergyRates';
import EnergyRatesTest from './pages/EnergyRatesTest';
import { AESOMarket } from './components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app/*" element={<AuthWrapper><AppRoutes /></AuthWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/aeso-market" element={<AESOMarket />} />
      <Route path="/aeso-intelligence" element={<AESOMarketIntelligence />} />
      <Route path="/energy-rates" element={<EnergyRates />} />
      <Route path="/energy-rates-test" element={<EnergyRatesTest />} />
    </Routes>
  );
}

export default App;
