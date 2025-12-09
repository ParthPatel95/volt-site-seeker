import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Ban, 
  Trash2, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Eye,
  Loader2,
  FileText
} from 'lucide-react';
import { useSharedAESOReports, ReportView } from '@/hooks/useSharedAESOReports';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SharedAESOReportsTab() {
  const { 
    reports, 
    loading, 
    viewsLoading,
    fetchSharedReports, 
    getReportViews, 
    revokeReport, 
    deleteReport,
    getShareUrl 
  } = useSharedAESOReports();
  
  const { toast } = useToast();
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reportViews, setReportViews] = useState<Record<string, ReportView[]>>({});

  useEffect(() => {
    fetchSharedReports();
  }, [fetchSharedReports]);

  const handleCopyLink = (shareToken: string) => {
    navigator.clipboard.writeText(getShareUrl(shareToken));
    toast({
      title: 'Link Copied',
      description: 'Share URL copied to clipboard'
    });
  };

  const handleToggleViews = async (reportId: string) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
      return;
    }
    
    setExpandedReport(reportId);
    if (!reportViews[reportId]) {
      const views = await getReportViews(reportId);
      setReportViews(prev => ({ ...prev, [reportId]: views }));
    }
  };

  const getStatusBadge = (report: typeof reports[0]) => {
    if (report.status === 'revoked') {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    if (report.max_views && report.current_views >= report.max_views) {
      return <Badge variant="secondary">Max Views Reached</Badge>;
    }
    return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Link2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shared Reports</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You haven't created any shareable reports yet. Use the "Share Report" button in the Uptime Analytics tab to create a shareable link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Shared Reports</h3>
        <Badge variant="outline">{reports.length} reports</Badge>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {report.password_hash ? (
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Unlock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {getStatusBadge(report)}
                      <Badge variant="outline" className="text-xs">
                        {report.report_type === 'comprehensive' ? 'Comprehensive' : 'Single Scenario'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(report.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {report.current_views} view{report.current_views !== 1 ? 's' : ''}
                    {report.max_views && ` / ${report.max_views} max`}
                  </span>
                </div>
                {report.expires_at && (
                  <div className="flex items-center gap-1">
                    <span>Expires: {format(new Date(report.expires_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Share URL */}
              <div className="bg-muted/50 rounded-md px-3 py-2 mb-3 flex items-center gap-2">
                <code className="text-xs text-muted-foreground truncate flex-1">
                  {getShareUrl(report.share_token)}
                </code>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(report.share_token)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getShareUrl(report.share_token), '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleViews(report.id)}
                  disabled={viewsLoading === report.id}
                >
                  {viewsLoading === report.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : expandedReport === report.id ? (
                    <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Analytics
                </Button>
                
                {report.status !== 'revoked' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700">
                        <Ban className="w-3.5 h-3.5 mr-1.5" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Share Link?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will disable the share link. Anyone with the link will no longer be able to view the report.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => revokeReport(report.id)}>
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Shared Report?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the shared report and all view analytics. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteReport(report.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Expanded Analytics */}
              {expandedReport === report.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Viewer Analytics ({reportViews[report.id]?.length || 0} views)
                    </span>
                  </div>
                  
                  {reportViews[report.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {reportViews[report.id].map((view) => (
                        <div 
                          key={view.id}
                          className="bg-muted/30 rounded-md px-3 py-2 text-sm flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium">
                              {view.viewer_name || 'Anonymous'}
                            </span>
                            {view.viewer_email && (
                              <span className="text-muted-foreground ml-2">
                                ({view.viewer_email})
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {format(new Date(view.viewed_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No views recorded yet
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
