
import React, { useState, useEffect } from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';

const VoltScout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64 sm:ml-72'
        }`}>
          <Dashboard />
        </div>
      </div>
    </AuthWrapper>
  );
};

export default VoltScout;
