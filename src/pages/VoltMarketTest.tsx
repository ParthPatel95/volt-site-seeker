import React from 'react';
import { VoltMarketFeatureTest } from '@/components/voltmarket/VoltMarketFeatureTest';

export default function VoltMarketTest() {
  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">VoltMarket Feature Testing</h1>
          <p className="text-muted-foreground">Comprehensive testing suite for all VoltMarket features</p>
        </div>
        
        <VoltMarketFeatureTest />
      </div>
    </div>
  );
}