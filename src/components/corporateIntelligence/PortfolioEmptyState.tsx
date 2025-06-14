
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export function PortfolioEmptyState() {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium text-muted-foreground mb-2">
          No Portfolio Recommendations
        </h3>
        <p className="text-muted-foreground">
          Generate portfolio recommendations to see optimized allocations
        </p>
      </CardContent>
    </Card>
  );
}
