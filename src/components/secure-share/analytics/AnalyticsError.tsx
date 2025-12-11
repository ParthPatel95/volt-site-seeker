import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorProps {
  error: Error;
  onRetry: () => void;
}

export function AnalyticsError({ error, onRetry }: AnalyticsErrorProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              {error.message || 'An error occurred while fetching analytics data.'}
            </p>
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
