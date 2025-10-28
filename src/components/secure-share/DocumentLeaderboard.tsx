import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Eye, TrendingUp, Users, Clock } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface DocumentLeaderboardProps {
  dateRange?: DateRange;
}

export function DocumentLeaderboard({ dateRange }: DocumentLeaderboardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['document-leaderboard', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select(`
          *,
          document:secure_documents(file_name, id),
          link:secure_links(recipient_email)
        `);

      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;
      if (error) throw error;

      // Get all secure links to calculate share-to-view conversion
      const { data: allLinks } = await supabase
        .from('secure_links')
        .select('document_id');

      const linksByDoc: Record<string, number> = {};
      allLinks?.forEach(link => {
        if (link.document_id) {
          linksByDoc[link.document_id] = (linksByDoc[link.document_id] || 0) + 1;
        }
      });

      // Group by document
      const docStats: Record<string, any> = {};

      activity?.forEach(a => {
        const docId = a.document?.id;
        const docName = a.document?.file_name || 'Unknown';
        
        if (!docId) return;

        if (!docStats[docId]) {
          docStats[docId] = {
            name: docName,
            views: 0,
            uniqueViewers: new Set(),
            totalEngagement: 0,
            totalTime: 0,
            completions: 0,
            shares: linksByDoc[docId] || 0
          };
        }

        docStats[docId].views += 1;
        if (a.viewer_email) {
          docStats[docId].uniqueViewers.add(a.viewer_email);
        }
        docStats[docId].totalEngagement += a.engagement_score || 0;
        docStats[docId].totalTime += a.total_time_seconds || 0;
        
        // Consider completion if viewed more than 50% of estimated pages
        const pagesViewed = Array.isArray(a.pages_viewed) ? a.pages_viewed.length : 0;
        if (pagesViewed >= 5) {
          docStats[docId].completions += 1;
        }
      });

      // Convert to array and calculate metrics
      return Object.entries(docStats).map(([docId, stats]: [string, any]) => {
        const uniqueViewerCount = stats.uniqueViewers.size;
        const repeatRate = stats.views > 0 ? ((stats.views - uniqueViewerCount) / stats.views) * 100 : 0;
        const avgEngagement = stats.views > 0 ? stats.totalEngagement / stats.views : 0;
        const completionRate = stats.views > 0 ? (stats.completions / stats.views) * 100 : 0;
        const conversionRate = stats.shares > 0 ? (stats.views / stats.shares) * 100 : 0;
        const avgTimeMinutes = stats.views > 0 ? Math.round(stats.totalTime / stats.views / 60) : 0;

        return {
          docId,
          name: stats.name,
          views: stats.views,
          uniqueViewers: uniqueViewerCount,
          repeatRate,
          avgEngagement,
          completionRate,
          conversionRate,
          avgTimeMinutes,
          shares: stats.shares
        };
      }).sort((a, b) => b.avgEngagement - a.avgEngagement);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceBadge = (engagement: number) => {
    if (engagement >= 80) return <Badge variant="success">Excellent</Badge>;
    if (engagement >= 60) return <Badge>Good</Badge>;
    if (engagement >= 40) return <Badge variant="warning">Fair</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle>Document Performance Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No document data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" />
                      Views
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      Unique
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Engagement
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Completion</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      Avg. Time
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((doc, index) => (
                  <TableRow key={doc.docId}>
                    <TableCell className="font-medium">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {doc.name}
                    </TableCell>
                    <TableCell className="text-center">{doc.views}</TableCell>
                    <TableCell className="text-center">
                      {doc.uniqueViewers}
                      {doc.repeatRate > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{doc.repeatRate.toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold">{Math.round(doc.avgEngagement)}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.completionRate.toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.avgTimeMinutes}m
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(doc.avgEngagement)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
