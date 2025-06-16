
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

interface EIAEnergyPricesTabProps {
  energyPrices: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function EIAEnergyPricesTab({ energyPrices, loading, onRefresh }: EIAEnergyPricesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Energy Pricing Data</h3>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <DollarSign className="w-4 h-4 mr-2" />
          Refresh Prices
        </Button>
      </div>
      
      {energyPrices.length > 0 ? (
        <div className="grid gap-4">
          {energyPrices.slice(0, 6).map((price, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Period: {price.period}</h4>
                    <p className="text-sm text-muted-foreground">{price.state} • {price.sector}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{price.price_cents_per_kwh.toFixed(2)}¢/kWh</div>
                    <p className="text-sm text-muted-foreground">
                      ${price.revenue_thousand_dollars.toLocaleString()}k revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Refresh Prices" to load EIA pricing data.</p>
        </div>
      )}
    </div>
  );
}
