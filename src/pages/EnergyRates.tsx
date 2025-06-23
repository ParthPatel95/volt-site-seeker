
import React from 'react';
import { EnergyRateEstimator } from '@/components/energy/EnergyRateEstimator';

export default function EnergyRates() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Energy Rate Estimator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate fully-burdened electricity costs with real market data, transmission & distribution charges, 
            riders, surcharges, and applicable taxes for Industrial and Commercial customers.
          </p>
        </div>
        
        <EnergyRateEstimator />
      </div>
    </div>
  );
}
