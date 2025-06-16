
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp } from 'lucide-react';

interface EIATransmissionTabProps {
  transmissionData: any;
  loading: boolean;
  onRefresh: () => void;
}

export function EIATransmissionTab({ transmissionData, loading, onRefresh }: EIATransmissionTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transmission Infrastructure</h3>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <Zap className="w-4 h-4 mr-2" />
          Refresh Transmission
        </Button>
      </div>
      
      {transmissionData ? (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Lines Analyzed</p>
                <p className="text-2xl font-bold">{transmissionData.analysis?.total_lines_analyzed || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Rating</p>
                <p className="text-2xl font-bold">{transmissionData.analysis?.efficiency_rating || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grid Reliability</p>
                <p className="text-2xl font-bold">{transmissionData.analysis?.grid_reliability || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Source</p>
                <Badge variant="outline">EIA Official</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Refresh Transmission" to load EIA transmission data.</p>
        </div>
      )}
    </div>
  );
}
