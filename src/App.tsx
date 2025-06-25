
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import { Dashboard } from './components/Dashboard';
import { AccessRequestForm } from './components/AccessRequestForm';
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
          <Route path="/request-access" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
              <AccessRequestForm />
            </div>
          } />
          <Route path="/app/*" element={<AuthWrapper><Dashboard /></AuthWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
