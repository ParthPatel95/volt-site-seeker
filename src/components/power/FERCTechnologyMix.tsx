
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface FERCTechnologyMixProps {
  interconnectionQueue: any;
}

export function FERCTechnologyMix({ interconnectionQueue }: FERCTechnologyMixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Technology Mix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Solar Capacity</span>
            <div className="text-right">
              <div className="font-semibold">{(interconnectionQueue.summary.solar_capacity_mw / 1000).toFixed(1)} GW</div>
              <div className="text-xs text-muted-foreground">
                {((interconnectionQueue.summary.solar_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Wind Capacity</span>
            <div className="text-right">
              <div className="font-semibold">{(interconnectionQueue.summary.wind_capacity_mw / 1000).toFixed(1)} GW</div>
              <div className="text-xs text-muted-foreground">
                {((interconnectionQueue.summary.wind_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Storage Capacity</span>
            <div className="text-right">
              <div className="font-semibold">{(interconnectionQueue.summary.storage_capacity_mw / 1000).toFixed(1)} GW</div>
              <div className="text-xs text-muted-foreground">
                {((interconnectionQueue.summary.storage_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Other Technologies</span>
            <div className="text-right">
              <div className="font-semibold">{(interconnectionQueue.summary.other_capacity_mw / 1000).toFixed(1)} GW</div>
              <div className="text-xs text-muted-foreground">
                {((interconnectionQueue.summary.other_capacity_mw / interconnectionQueue.summary.total_capacity_mw) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
