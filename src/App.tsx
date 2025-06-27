
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import { AccessRequestForm } from './components/AccessRequestForm';
import { VoltScoutAccessPage } from './components/VoltScoutAccessPage';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Index from './pages/Index';

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
          <Route path="/voltscout" element={<VoltScoutAccessPage />} />
          <Route path="/app/*" element={<AuthWrapper><Index /></AuthWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
