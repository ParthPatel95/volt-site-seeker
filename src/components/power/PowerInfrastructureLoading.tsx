
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function PowerInfrastructureLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="p-6 sm:p-8">
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Loading Power Infrastructure</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Analyzing grid connectivity and transmission data...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
