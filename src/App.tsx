
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AuthWrapper } from './components/AuthWrapper';
import { AccessRequestForm } from './components/AccessRequestForm';
import { VoltScoutAccessPage } from './components/VoltScoutAccessPage';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Index from './pages/Index';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
