import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Clock, FileText, MapPin, Monitor } from 'lucide-react';

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
  pages_viewed?: Array<{ page: number; time_spent: number; viewed_at: string }>;
  scroll_depth?: Record<string, number>;
}

interface ViewerActivityTableProps {
  activities: Activity[];
}

export function ViewerActivityTable({ activities }: ViewerActivityTableProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const getEngagementBadge = (score: number) => {
    if (score >= 75) return <Badge variant="default">High</Badge>;
    if (score >= 50) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <>
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="text-lg">Recent Viewer Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-semibold">Document</TableHead>
              <TableHead className="font-semibold">Viewer</TableHead>
              <TableHead className="font-semibold">Device</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Pages</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Engagement</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow 
                key={activity.id}
                className="cursor-pointer hover:bg-watt-primary/5 transition-colors border-border/50"
                onClick={() => setSelectedActivity(activity)}
              >
                <TableCell className="font-medium max-w-xs truncate">
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
                <TableCell className="text-sm">
                  {activity.viewer_location || 'Unknown'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{activity.pages_viewed?.length || 0} pages</span>
                    {activity.pages_viewed && activity.pages_viewed.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {activity.pages_viewed.map(p => `P${p.page}: ${Math.round(p.time_spent)}s`).join(', ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatTimeSpent(activity.total_time_seconds)}
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

    {/* Analytics Details Dialog */}
    <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Viewer Activity Details
          </DialogTitle>
          <DialogDescription>
            Detailed analytics for this viewing session
          </DialogDescription>
        </DialogHeader>

        {selectedActivity && (
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{selectedActivity.document?.file_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Opened: {format(new Date(selectedActivity.opened_at), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </CardContent>
            </Card>

            {/* Viewer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Viewer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedActivity.viewer_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedActivity.viewer_email || selectedActivity.link?.recipient_email || 'No email'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      Device
                    </p>
                    <p className="font-medium">{selectedActivity.device_type || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{selectedActivity.browser}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location
                    </p>
                    <p className="font-medium">{selectedActivity.viewer_location || 'Unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-bold">{formatTimeSpent(selectedActivity.total_time_seconds)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pages Viewed</p>
                    <p className="text-2xl font-bold">{selectedActivity.pages_viewed?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <div className="mt-1">
                      {getEngagementBadge(selectedActivity.engagement_score)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {selectedActivity.engagement_score}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Page-by-Page Breakdown */}
                {selectedActivity.pages_viewed && selectedActivity.pages_viewed.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Page-by-Page Breakdown</h4>
                    <div className="space-y-2">
                      {selectedActivity.pages_viewed.map((page) => {
                        const scrollDepthKey = `page_${page.page}`;
                        const scrollDepth = selectedActivity.scroll_depth?.[scrollDepthKey] || 0;
                        
                        return (
                          <div key={page.page} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {page.page}
                              </div>
                              <div>
                                <p className="font-medium">Page {page.page}</p>
                                <p className="text-xs text-muted-foreground">
                                  Viewed at {format(new Date(page.viewed_at), 'HH:mm:ss')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatTimeSpent(page.time_spent)}</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(scrollDepth)}% scrolled
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
