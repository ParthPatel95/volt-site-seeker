
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface EIAGenerationTabProps {
  generationData: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function EIAGenerationTab({ generationData, loading, onRefresh }: EIAGenerationTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Power Generation Data</h3>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Generation
        </Button>
      </div>
      
      {generationData.length > 0 ? (
        <div className="grid gap-4">
          {generationData.slice(0, 8).map((gen, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{gen.period}</h4>
                    <p className="text-sm text-muted-foreground">{gen.location} • {gen.fuel_type}</p>
                    <p className="text-xs text-muted-foreground">{gen.type_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{gen.generation_mwh.toLocaleString()} MWh</div>
                    <Badge variant="outline">{gen.fuel_type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Refresh Generation" to load EIA generation data.</p>
        </div>
      )}
    </div>
  );
}
