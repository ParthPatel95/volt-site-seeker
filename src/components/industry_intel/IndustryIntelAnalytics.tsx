
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BarChart } from 'lucide-react';

interface IndustryIntelAnalyticsProps {
  opportunities: any[];
}

export function IndustryIntelAnalytics({ opportunities }: IndustryIntelAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI-Powered Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-500">AI insights and predictive analytics based on scanned data</p>
        </div>
      </CardContent>
    </Card>
  );
}
