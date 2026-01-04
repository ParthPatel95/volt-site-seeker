
import React from 'react';
import { EnergyRateEstimatorTest } from '@/components/energy/EnergyRateEstimatorTest';

export default function EnergyRatesTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Energy Rate Estimator - Test Suite
          </h1>
          <p className="text-lg text-muted-foreground">
            Run automated tests to verify the Energy Rate Estimator functionality
          </p>
        </div>
        
        <EnergyRateEstimatorTest />
      </div>
    </div>
  );
}
