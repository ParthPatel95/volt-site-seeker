import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Eye, TrendingUp, Users, Clock } from 'lucide-react';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { TableSkeleton } from './analytics/AnalyticsSkeleton';

export const DocumentLeaderboard = memo(function DocumentLeaderboard() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  if (isLoading) {
    return <TableSkeleton />;
  }

  const getPerformanceBadge = (engagement: number) => {
    if (engagement >= 80) return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    if (engagement >= 60) return <Badge variant="default">Good</Badge>;
    if (engagement >= 40) return <Badge variant="secondary">Fair</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  const documents = analytics?.topDocuments || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle>Document Performance Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
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
                {documents.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={doc.fullName}>
                      {doc.name}
                    </TableCell>
                    <TableCell className="text-center">{doc.views}</TableCell>
                    <TableCell className="text-center">{doc.uniqueViewers}</TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold">{doc.avgEngagement}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.completionRate}%
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
});
