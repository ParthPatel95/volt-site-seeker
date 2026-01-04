
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Satellite } from 'lucide-react';

interface IndustryIntelMapProps {
  opportunities: any[];
  watchlist: any[];
}

export function IndustryIntelMap({ opportunities, watchlist }: IndustryIntelMapProps) {
  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Intelligence Map
          <span className="text-sm text-muted-foreground ml-auto">
            {opportunities.length} opportunities plotted
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Satellite className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Interactive Intelligence Map</h3>
            <p className="text-muted-foreground">Real-time plotting of distressed facilities and idle properties</p>
            <p className="text-sm text-muted-foreground mt-2">
              🔴 Distressed • 🟡 Idle • 🟢 High-potential
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
