import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TableWidgetProps {
  config: WidgetConfig;
}

export function TableWidget({ config }: TableWidgetProps) {
  const { data, loading, error } = useAESODashboardData(config);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load table data</p>
        </CardContent>
      </Card>
    );
  }

  const tableData = data?.chartData || data?.hourlyData || [];
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="capitalize">
                    {col.replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row: any, idx: number) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
