
import React, { useState } from 'react';
import { EnergyRateEstimator } from '@/components/energy/EnergyRateEstimator';
import { SavedCalculationsDashboard } from '@/components/energy/SavedCalculationsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">New Calculation</TabsTrigger>
            <TabsTrigger value="dashboard">Saved Calculations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-6">
            <EnergyRateEstimator />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <SavedCalculationsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
