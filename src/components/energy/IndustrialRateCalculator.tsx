
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, Zap, TrendingDown, TrendingUp } from 'lucide-react';

interface IndustrialRateCalculatorProps {
  customerClass: string;
  powerRequirement: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface RateStructure {
  energyCharge: number; // ¢/kWh
  demandCharge: number; // $/kW/month
  transmissionCharge: number; // ¢/kWh
  distributionCharge: number; // ¢/kWh
  riders: number; // ¢/kWh
  currency: 'CAD' | 'USD';
  market: 'AESO' | 'ERCOT';
}

interface CostCalculation {
  energyCost: number;
  demandCost: number;
  transmissionCost: number;
  distributionCost: number;
  ridersCost: number;
  subtotal: number;
  tax: number;
  total: number;
  monthlyMWh: number;
  averageRate: number; // ¢/kWh all-in
}

export function IndustrialRateCalculator({ customerClass, powerRequirement, location }: IndustrialRateCalculatorProps) {
  const [rateStructure, setRateStructure] = useState<RateStructure | null>(null);
  const [costCalculation, setCostCalculation] = useState<CostCalculation | null>(null);
  const [loadFactor, setLoadFactor] = useState(0.80);

  useEffect(() => {
    if (location) {
      const rates = getRateStructure(customerClass, location);
      setRateStructure(rates);
      
      if (rates) {
        const costs = calculateCosts(rates, powerRequirement, loadFactor);
        setCostCalculation(costs);
      }
    }
  }, [customerClass, powerRequirement, location, loadFactor]);

  const getRateStructure = (customerClass: string, location: { latitude: number; longitude: number }): RateStructure => {
    // Determine market based on location
    const isAlberta = location.latitude >= 49.0 && location.latitude <= 60.0 && 
                      location.longitude >= -120.0 && location.longitude <= -110.0;
    const isTexas = location.latitude >= 25.8 && location.latitude <= 36.5 && 
                    location.longitude >= -106.6 && location.longitude <= -93.5;

    if (isAlberta) {
      // Real Alberta rates based on customer class
      switch (customerClass) {
        case 'Rate65': // Transmission Connected Industrial (>50MW)
          return {
            energyCharge: 3.2, // Hedged block price
            demandCharge: 7.11, // Rate 65 demand charge
            transmissionCharge: 0.15,
            distributionCharge: 0.26, // Rate 65 volumetric delivery
            riders: 0.30,
            currency: 'CAD',
            market: 'AESO'
          };
        case 'Rate31': // Large General Service
          return {
            energyCharge: 3.5,
            demandCharge: 8.25,
            transmissionCharge: 0.18,
            distributionCharge: 0.35,
            riders: 0.32,
            currency: 'CAD',
            market: 'AESO'
          };
        default:
          return {
            energyCharge: 4.0,
            demandCharge: 10.0,
            transmissionCharge: 0.20,
            distributionCharge: 0.40,
            riders: 0.35,
            currency: 'CAD',
            market: 'AESO'
          };
      }
    } else if (isTexas) {
      // Real Texas ERCOT rates
      return {
        energyCharge: 2.8, // Competitive market pricing
        demandCharge: 4.50, // Lower demand charges in competitive market
        transmissionCharge: 0.22,
        distributionCharge: 0.28,
        riders: 0.15,
        currency: 'USD',
        market: 'ERCOT'
      };
    } else {
      // Default to Alberta rates
      return {
        energyCharge: 3.2,
        demandCharge: 7.11,
        transmissionCharge: 0.15,
        distributionCharge: 0.26,
        riders: 0.30,
        currency: 'CAD',
        market: 'AESO'
      };
    }
  };

  const calculateCosts = (rates: RateStructure, powerMW: number, loadFactor: number): CostCalculation => {
    const hoursPerMonth = 730;
    const monthlyMWh = powerMW * hoursPerMonth * loadFactor;
    const monthlyKWh = monthlyMWh * 1000;
    const demandKW = powerMW * 1000;

    // Calculate each cost component
    const energyCost = (rates.energyCharge * monthlyKWh) / 100; // Convert cents to dollars
    const demandCost = rates.demandCharge * demandKW;
    const transmissionCost = (rates.transmissionCharge * monthlyKWh) / 100;
    const distributionCost = (rates.distributionCharge * monthlyKWh) / 100;
    const ridersCost = (rates.riders * monthlyKWh) / 100;

    const subtotal = energyCost + demandCost + transmissionCost + distributionCost + ridersCost;
    
    // Tax calculation (GST for Canada, varies for US)
    const taxRate = rates.currency === 'CAD' ? 0.05 : 0.0625;
    const tax = subtotal * taxRate;
    
    const total = subtotal + tax;
    const averageRate = (total * 100) / monthlyKWh; // ¢/kWh all-in

    return {
      energyCost,
      demandCost,
      transmissionCost,
      distributionCost,
      ridersCost,
      subtotal,
      tax,
      total,
      monthlyMWh,
      averageRate
    };
  };

  const formatCurrency = (amount: number, currency: 'CAD' | 'USD' = 'CAD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(2)}¢/kWh`;
  };

  if (!rateStructure || !costCalculation) {
    return null;
  }

  const costBreakdown = [
    { label: 'Energy Charge', amount: costCalculation.energyCost, rate: rateStructure.energyCharge, color: 'text-blue-600' },
    { label: 'Demand Charge', amount: costCalculation.demandCost, rate: `$${rateStructure.demandCharge}/kW/mo`, color: 'text-green-600' },
    { label: 'Transmission', amount: costCalculation.transmissionCost, rate: rateStructure.transmissionCharge, color: 'text-purple-600' },
    { label: 'Distribution', amount: costCalculation.distributionCost, rate: rateStructure.distributionCharge, color: 'text-orange-600' },
    { label: 'Riders & Fees', amount: costCalculation.ridersCost, rate: rateStructure.riders, color: 'text-gray-600' }
  ];

  return (
    <Card className="border-green-200 bg-gradient-to-r from-emerald-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          Industrial Rate Calculator - {customerClass}
          <Badge variant="secondary" className="ml-2">
            <Zap className="h-3 w-3 mr-1" />
            {rateStructure.market}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real utility rate calculation for {powerRequirement}MW demand at {(loadFactor * 100).toFixed(0)}% load factor
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Monthly Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(costCalculation.total, rateStructure.currency)}
              </div>
              <div className="text-sm text-gray-600">Total Monthly Cost</div>
              <div className="text-xs text-gray-500">{costCalculation.monthlyMWh.toFixed(0)} MWh</div>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">
                {formatRate(costCalculation.averageRate)}
              </div>
              <div className="text-sm text-gray-600">All-In Rate</div>
              <div className="text-xs text-gray-500">Including all charges & tax</div>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(costCalculation.total * 12, rateStructure.currency)}
              </div>
              <div className="text-sm text-gray-600">Annual Cost</div>
              <div className="text-xs text-gray-500">Estimated yearly total</div>
            </div>
          </div>

          {/* Rate Structure Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {customerClass} Rate Structure ({rateStructure.market})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {typeof item.rate === 'number' && (
                      <Badge variant="outline" className="text-xs">
                        {formatRate(item.rate)}
                      </Badge>
                    )}
                    {typeof item.rate === 'string' && (
                      <Badge variant="outline" className="text-xs">
                        {item.rate}
                      </Badge>
                    )}
                  </div>
                  <span className={`font-bold ${item.color}`}>
                    {formatCurrency(item.amount, rateStructure.currency)}
                  </span>
                </div>
              ))}
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tax ({rateStructure.currency === 'CAD' ? 'GST 5%' : 'Tax ~6.25%'})</span>
                <span className="font-bold text-gray-600">
                  {formatCurrency(costCalculation.tax, rateStructure.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Load Factor Optimization */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Load Factor Impact Analysis
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-center p-3 bg-white rounded border">
                <div className="font-bold text-red-600">{formatCurrency(calculateCosts(rateStructure, powerRequirement, 0.60).total, rateStructure.currency)}</div>
                <div className="text-gray-600">60% Load Factor</div>
                <div className="text-xs text-gray-500">{formatRate(calculateCosts(rateStructure, powerRequirement, 0.60).averageRate)}</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded border-2 border-green-300">
                <div className="font-bold text-green-600">{formatCurrency(costCalculation.total, rateStructure.currency)}</div>
                <div className="text-gray-600">{(loadFactor * 100).toFixed(0)}% Load Factor (Current)</div>
                <div className="text-xs text-gray-500">{formatRate(costCalculation.averageRate)}</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="font-bold text-blue-600">{formatCurrency(calculateCosts(rateStructure, powerRequirement, 0.95).total, rateStructure.currency)}</div>
                <div className="text-gray-600">95% Load Factor</div>
                <div className="text-xs text-gray-500">{formatRate(calculateCosts(rateStructure, powerRequirement, 0.95).averageRate)}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-700">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Higher load factors result in lower all-in rates due to demand charge spreading
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-800 mb-2">Rate Structure Insights</h5>
            <div className="text-sm text-green-700 space-y-1">
              <div>• {customerClass} rates in {rateStructure.market} market with {rateStructure.currency} pricing</div>
              <div>• Energy component: {((costCalculation.energyCost / costCalculation.total) * 100).toFixed(0)}% of total bill</div>
              <div>• Demand component: {((costCalculation.demandCost / costCalculation.total) * 100).toFixed(0)}% of total bill</div>
              <div>• All-in rate: {formatRate(costCalculation.averageRate)} - {costCalculation.averageRate < 5 ? 'competitive' : costCalculation.averageRate < 7 ? 'moderate' : 'high'} for industrial customers</div>
              {rateStructure.market === 'AESO' && <div>• Alberta rates include regulated transmission and distribution charges</div>}
              {rateStructure.market === 'ERCOT' && <div>• Texas competitive market with separate TDU charges</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
