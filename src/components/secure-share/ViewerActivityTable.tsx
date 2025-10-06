import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Activity {
  id: string;
  viewer_name: string | null;
  viewer_email: string | null;
  viewer_ip: string | null;
  viewer_location: string | null;
  device_type: string | null;
  browser: string | null;
  total_time_seconds: number;
  engagement_score: number;
  opened_at: string;
  document?: { file_name: string };
  link?: { recipient_email: string };
}

interface ViewerActivityTableProps {
  activities: Activity[];
}

export function ViewerActivityTable({ activities }: ViewerActivityTableProps) {
  const getEngagementBadge = (score: number) => {
    if (score >= 75) return <Badge variant="default">High</Badge>;
    if (score >= 50) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Viewer Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Viewer</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Opened At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {activity.document?.file_name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {activity.viewer_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {activity.viewer_email || activity.link?.recipient_email || 'No email'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{activity.device_type || 'Unknown'}</span>
                    <span className="text-muted-foreground text-xs">{activity.browser}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {Math.round(activity.total_time_seconds / 60)}m {activity.total_time_seconds % 60}s
                </TableCell>
                <TableCell>
                  {getEngagementBadge(activity.engagement_score)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(activity.opened_at), 'MMM dd, yyyy HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
