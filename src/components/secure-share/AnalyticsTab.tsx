import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics & Engagement</h2>
        <p className="text-muted-foreground">
          Track document views, engagement, and viewer activity
        </p>
      </div>

      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <BarChart3 className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground max-w-md">
              Analytics will appear here once you share documents and viewers start engaging with them
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
