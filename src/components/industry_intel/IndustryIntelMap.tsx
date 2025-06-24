
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
          <MapPin className="w-5 h-5 text-blue-600" />
          Intelligence Map
          <span className="text-sm text-gray-500 ml-auto">
            {opportunities.length} opportunities plotted
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Interactive Intelligence Map</h3>
            <p className="text-gray-500">Real-time plotting of distressed facilities and idle properties</p>
            <p className="text-sm text-gray-400 mt-2">
              🔴 Distressed • 🟡 Idle • 🟢 High-potential
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
