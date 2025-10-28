import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ComparisonMetrics } from './ComparisonMetrics';

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  previousValue?: number;
  currentValue?: number;
  formatter?: (value: number) => string;
}

export function EnhancedKPICard({
  title,
  value,
  icon: Icon,
  previousValue,
  currentValue,
  formatter
}: EnhancedKPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {previousValue !== undefined && currentValue !== undefined && (
          <div className="mt-2">
            <ComparisonMetrics
              currentValue={currentValue}
              previousValue={previousValue}
              formatter={formatter}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
