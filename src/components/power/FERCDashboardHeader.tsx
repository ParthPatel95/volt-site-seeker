
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FERCDashboardHeaderProps {
  loading: boolean;
  refetch: () => void;
}

export function FERCDashboardHeader({ loading, refetch }: FERCDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">FERC Data Dashboard</h2>
        <p className="text-muted-foreground">Federal Energy Regulatory Commission data and analytics</p>
      </div>
      <Button 
        onClick={refetch}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full sm:w-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>
    </div>
  );
}
