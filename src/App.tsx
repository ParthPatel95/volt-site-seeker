import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { NotFound } from './components/NotFound';
import { EnergyRates } from './components/EnergyRates';
import { EnergyRatesTest } from './components/EnergyRatesTest';
import { AESOMarket } from './components/AESOMarket';
import { AESOMarketIntelligence } from '@/components/AESOMarketIntelligence';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
          <Route path="/app/aeso-market" element={<AuthWrapper><AESOMarket /></AuthWrapper>} />
          <Route path="/app/aeso-intelligence" element={<AuthWrapper><AESOMarketIntelligence /></AuthWrapper>} />
          <Route path="/app/energy-rates" element={<AuthWrapper><EnergyRates /></AuthWrapper>} />
          <Route path="/app/energy-rates-test" element={<AuthWrapper><EnergyRatesTest /></AuthWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
