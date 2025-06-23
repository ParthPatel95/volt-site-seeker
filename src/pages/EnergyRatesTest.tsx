
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { EnergyRateEstimatorTest } from '@/components/energy/EnergyRateEstimatorTest';

export default function EnergyRatesTest() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : isCollapsed 
            ? 'ml-16' 
            : 'ml-72'
      }`}>
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Energy Rate Estimator - Test Suite</h1>
            <div className="w-9" /> {/* Spacer for alignment */}
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Energy Rate Estimator - Test Suite
                </h1>
                <p className="text-lg text-gray-600">
                  Run automated tests to verify the Energy Rate Estimator functionality
                </p>
              </div>
              
              <EnergyRateEstimatorTest />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
