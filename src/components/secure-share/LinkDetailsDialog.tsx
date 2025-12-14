import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Copy,
  Eye,
  Clock,
  Mail,
  User,
  Monitor,
  Smartphone,
  Globe,
  FileText,
  Folder,
  Package,
  TrendingUp,
  Calendar,
  Download,
  Shield,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface LinkDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: any;
}

export function LinkDetailsDialog({
  open,
  onOpenChange,
  link,
}: LinkDetailsDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch viewer activity for this link
  const { data: viewerActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['link-viewer-activity', link?.id],
    queryFn: async () => {
      if (!link?.id) return [];
      
      const { data, error } = await supabase
        .from('viewer_activity')
        .select('*')
        .eq('link_id', link.id)
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open && !!link?.id,
  });

  // Fetch folder documents if folder link
  const { data: folderDocuments } = useQuery({
    queryKey: ['folder-documents', link?.folder_id],
    queryFn: async () => {
      if (!link?.folder_id) return [];
      const { data, error } = await supabase
        .from('secure_documents')
        .select('id, file_name, file_type, file_size')
        .eq('folder_id', link.folder_id)
        .order('file_name');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!link?.folder_id,
  });

  // Fetch bundle documents if bundle link
  const { data: bundleDocuments } = useQuery({
    queryKey: ['bundle-documents', link?.bundle_id],
    queryFn: async () => {
      if (!link?.bundle_id) return [];
      const { data, error } = await supabase
        .from('bundle_documents')
        .select('document_id, display_order, secure_documents(id, file_name, file_type, file_size)')
        .eq('bundle_id', link.bundle_id)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!link?.bundle_id,
  });

  const handleCopyLink = () => {
    const baseUrl = 'https://wattbyte.com';
    const shareUrl = `${baseUrl}/view/${link.link_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!link) return null;

  // Calculate analytics
  const totalViews = viewerActivity?.length || 0;
  const uniqueViewers = new Set(viewerActivity?.map((v: any) => v.viewer_email || v.viewer_name)).size;
  const avgEngagement = viewerActivity?.length
    ? Math.round(viewerActivity.reduce((sum: number, v: any) => sum + (v.engagement_score || 0), 0) / viewerActivity.length)
    : 0;
  const avgTimeSpent = viewerActivity?.length
    ? Math.round(viewerActivity.reduce((sum: number, v: any) => sum + (v.total_time_seconds || 0), 0) / viewerActivity.length / 60)
    : 0;

  // Calculate contents for display
  const getContentsInfo = () => {
    if (link.folder_id && folderDocuments) {
      return { count: folderDocuments.length, items: folderDocuments };
    }
    if (link.bundle_id && bundleDocuments) {
      const items = bundleDocuments.map((bd: any) => bd.secure_documents).filter(Boolean);
      return { count: items.length, items };
    }
    if (link.document_id && link.secure_documents) {
      return { count: 1, items: [link.secure_documents] };
    }
    return { count: 0, items: [] };
  };
  const contentsInfo = getContentsInfo();

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.startsWith('video/')) return '🎬';
    if (fileType?.startsWith('audio/')) return '🎵';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊';
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📽️';
    return '📎';
  };

  // Device breakdown
  const devices = viewerActivity?.reduce((acc: any, v: any) => {
    const device = v.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {}) || {};

  const getLinkType = () => {
    if (link.folder_id) return { icon: Folder, label: 'Folder', color: 'text-amber-500' };
    if (link.bundle_id) return { icon: Package, label: 'Bundle', color: 'text-purple-500' };
    return { icon: FileText, label: 'Document', color: 'text-blue-500' };
  };

  const linkType = getLinkType();
  const LinkTypeIcon = linkType.icon;

  const getStatusInfo = () => {
    if (link.status === 'revoked') {
      return { label: 'Revoked', variant: 'destructive' as const, icon: XCircle };
    }
    if (link.expires_at && isPast(new Date(link.expires_at))) {
      return { label: 'Expired', variant: 'secondary' as const, icon: Clock };
    }
    if (link.max_views && link.current_views >= link.max_views) {
      return { label: 'Max Views Reached', variant: 'secondary' as const, icon: Eye };
    }
    return { label: 'Active', variant: 'default' as const, icon: CheckCircle2 };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`p-2.5 rounded-lg bg-muted ${linkType.color}`}>
                <LinkTypeIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl truncate">
                  {link.link_name || link.document_bundles?.name || link.secure_documents?.file_name || link.secure_folders?.name || 'Untitled Link'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View analytics and settings for this shared link
                </DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusInfo.variant} className="gap-1">
                    <statusInfo.icon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shrink-0">
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">
              Activity
              {totalViews > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                  {totalViews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 min-h-0 max-h-[calc(85vh-180px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <TabsContent value="overview" className="mt-0 space-y-6 pb-6">
              {/* Analytics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalViews}</p>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <User className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{uniqueViewers}</p>
                      <p className="text-xs text-muted-foreground">Unique Viewers</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{avgEngagement}%</p>
                      <p className="text-xs text-muted-foreground">Avg Engagement</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{avgTimeSpent}m</p>
                      <p className="text-xs text-muted-foreground">Avg Time Spent</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Device Breakdown */}
              {Object.keys(devices).length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Device Breakdown
                  </h4>
                  <div className="flex gap-4">
                    {Object.entries(devices).map(([device, count]: [string, any]) => (
                      <div key={device} className="flex items-center gap-2">
                        {device.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{device}</span>
                        <Badge variant="secondary" className="h-5 px-1.5">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Contents Section */}
              {contentsInfo.count > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {link.folder_id ? <Folder className="w-4 h-4 text-amber-500" /> : 
                     link.bundle_id ? <Package className="w-4 h-4 text-purple-500" /> :
                     <FileText className="w-4 h-4 text-blue-500" />}
                    Contents
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {contentsInfo.count} {contentsInfo.count === 1 ? 'file' : 'files'}
                    </Badge>
                  </h4>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {contentsInfo.items.map((item: any, index: number) => (
                        <div 
                          key={item?.id || index} 
                          className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{getFileIcon(item?.file_type)}</span>
                            <span className="text-sm truncate">{item?.file_name || 'Unknown file'}</span>
                          </div>
                          {item?.file_size && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatFileSize(item.file_size)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}

              {/* Recent Viewers */}
              {viewerActivity && viewerActivity.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recent Viewers
                  </h4>
                  <div className="space-y-3">
                    {viewerActivity.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {activity.viewer_name || activity.viewer_email || 'Anonymous'}
                            </p>
                            {activity.viewer_email && activity.viewer_name && (
                              <p className="text-xs text-muted-foreground truncate">{activity.viewer_email}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.opened_at), { addSuffix: true })}
                          </p>
                          {activity.engagement_score && (
                            <Badge variant="outline" className="text-xs">{activity.engagement_score}% engaged</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {totalViews === 0 && (
                <Card className="p-8 text-center">
                  <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No views yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Share this link to start tracking engagement</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0 pb-6">
              {loadingActivity ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </Card>
                  ))}
                </div>
              ) : viewerActivity && viewerActivity.length > 0 ? (
                <div className="space-y-3">
                  {viewerActivity.map((activity: any) => (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {activity.viewer_name || 'Anonymous Viewer'}
                            </p>
                            {activity.viewer_email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {activity.viewer_email}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {activity.device_type && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  {activity.device_type.toLowerCase().includes('mobile') ? (
                                    <Smartphone className="w-3 h-3" />
                                  ) : (
                                    <Monitor className="w-3 h-3" />
                                  )}
                                  {activity.device_type}
                                </Badge>
                              )}
                              {activity.browser && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Globe className="w-3 h-3" />
                                  {activity.browser}
                                </Badge>
                              )}
                              {activity.pages_viewed && Array.isArray(activity.pages_viewed) && activity.pages_viewed.length > 0 && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <FileText className="w-3 h-3" />
                                  {activity.pages_viewed.length} pages
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">
                            {activity.total_time_seconds ? `${Math.round(activity.total_time_seconds / 60)}m` : '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.opened_at), 'MMM d, h:mm a')}
                          </p>
                          {activity.engagement_score && (
                            <Badge variant="secondary" className="mt-1">{activity.engagement_score}%</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No activity recorded</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4 pb-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Link Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium flex items-center gap-1.5">
                      <LinkTypeIcon className={`w-4 h-4 ${linkType.color}`} />
                      {linkType.label}
                    </span>
                  </div>
                  {link.recipient_email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="font-medium">{link.recipient_name || link.recipient_email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access Level</span>
                    <Badge variant="outline" className="capitalize">
                      {link.access_level?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">
                      {link.current_views || 0}{link.max_views ? ` / ${link.max_views}` : ''}
                    </span>
                  </div>
                  {link.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{format(new Date(link.expires_at), 'PPP')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{format(new Date(link.created_at), 'PPP')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Security Settings</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Password Protection</span>
                    <Badge variant={link.password_hash ? 'default' : 'secondary'}>
                      {link.password_hash ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">OTP Verification</span>
                    <Badge variant={link.require_otp ? 'default' : 'secondary'}>
                      {link.require_otp ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Watermark</span>
                    <Badge variant={link.watermark_enabled ? 'default' : 'secondary'}>
                      {link.watermark_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">NDA Required</span>
                    <Badge variant={link.nda_required ? 'default' : 'secondary'}>
                      {link.nda_required ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}