
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

export function UltimateFinderHeader() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          Ultimate Power Infrastructure Finder
          <Badge variant="outline" className="bg-white/50">
            All Region Coverage + Rate Analysis
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Advanced AI-powered substation discovery with real-time industrial energy rate estimations for large-scale power requirements (50 MW)
        </p>
      </CardHeader>
    </Card>
  );
}
