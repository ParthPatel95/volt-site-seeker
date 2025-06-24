
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { IdleIndustryScanner as IdleIndustryScannerComponent } from '@/components/power/IdleIndustryScanner';

export default function IdleIndustryScanner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
      />
      
      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-72'
      }`}>
        {isMobile && (
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}
        
        <div className="p-6">
          <IdleIndustryScannerComponent />
        </div>
      </div>
    </div>
  );
}
