import React from 'react';
import { VoltMarketFeatureTest } from '@/components/voltmarket/VoltMarketFeatureTest';

export default function VoltMarketTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VoltMarket Feature Testing</h1>
          <p className="text-gray-600">Comprehensive testing suite for all VoltMarket features</p>
        </div>
        
        <VoltMarketFeatureTest />
      </div>
    </div>
  );
}