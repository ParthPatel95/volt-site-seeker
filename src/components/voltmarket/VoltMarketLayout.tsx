
import React from 'react';
import { VoltMarketHeader } from './VoltMarketHeader';
import { VoltMarketFooter } from './VoltMarketFooter';

interface VoltMarketLayoutProps {
  children: React.ReactNode;
}

export const VoltMarketLayout: React.FC<VoltMarketLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <VoltMarketHeader />
      <main className="flex-1">
        {children}
      </main>
      <VoltMarketFooter />
    </div>
  );
};
