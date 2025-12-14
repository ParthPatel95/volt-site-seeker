import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Link as LinkIcon,
  Copy,
  Trash2,
  Eye,
  Download,
  Clock,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Search,
  Filter,
  FileText,
  Folder,
  Package,
  User,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { EditLinkDialog } from './EditLinkDialog';
import { LinkDetailsDialog } from './LinkDetailsDialog';
import { LinkStatsOverview } from './links/LinkStatsOverview';
import { EnhancedLinkCard } from './links/EnhancedLinkCard';

export function LinksManagement() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [linkToView, setLinkToView] = useState<any>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

  const { data: links, isLoading, refetch } = useQuery({
    queryKey: ['secure-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_links')
        .select(`
          *,
          secure_documents (
            file_name,
            category,
            file_type,
            file_size
          ),
          document_bundles (
            name
          ),
          secure_folders (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch folder file counts
  const { data: folderCounts } = useQuery({
    queryKey: ['folder-file-counts'],
    queryFn: async () => {
      const folderIds = links?.filter((l: any) => l.folder_id).map((l: any) => l.folder_id) || [];
      if (folderIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('secure_documents')
        .select('folder_id, file_name, file_type, file_size')
        .in('folder_id', folderIds);
      
      if (error) throw error;
      
      // Group by folder_id
      const counts: Record<string, { count: number; files: any[] }> = {};
      data?.forEach((doc: any) => {
        if (!counts[doc.folder_id]) {
          counts[doc.folder_id] = { count: 0, files: [] };
        }
        counts[doc.folder_id].count++;
        counts[doc.folder_id].files.push(doc);
      });
      return counts;
    },
    enabled: !!links && links.some((l: any) => l.folder_id),
  });

  // Fetch bundle file counts
  const { data: bundleCounts } = useQuery({
    queryKey: ['bundle-file-counts'],
    queryFn: async () => {
      const bundleIds = links?.filter((l: any) => l.bundle_id).map((l: any) => l.bundle_id) || [];
      if (bundleIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('bundle_documents')
        .select('bundle_id, secure_documents(file_name, file_type, file_size)')
        .in('bundle_id', bundleIds);
      
      if (error) throw error;
      
      // Group by bundle_id
      const counts: Record<string, { count: number; files: any[] }> = {};
      data?.forEach((bd: any) => {
        if (!counts[bd.bundle_id]) {
          counts[bd.bundle_id] = { count: 0, files: [] };
        }
        counts[bd.bundle_id].count++;
        if (bd.secure_documents) {
          counts[bd.bundle_id].files.push(bd.secure_documents);
        }
      });
      return counts;
    },
    enabled: !!links && links.some((l: any) => l.bundle_id),
  });

  // Fetch viewer activity for analytics preview
  const { data: viewerActivity } = useQuery({
    queryKey: ['all-viewer-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewer_activity')
        .select('*')
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Filter links based on search and filters
  const filteredLinks = useMemo(() => {
    if (!links) return [];
    
    return links.filter((link: any) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        link.link_name?.toLowerCase().includes(searchLower) ||
        link.recipient_email?.toLowerCase().includes(searchLower) ||
        link.recipient_name?.toLowerCase().includes(searchLower) ||
        link.secure_documents?.file_name?.toLowerCase().includes(searchLower) ||
        link.document_bundles?.name?.toLowerCase().includes(searchLower) ||
        link.secure_folders?.name?.toLowerCase().includes(searchLower);

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          matchesStatus = link.status === 'active' && 
            (!link.expires_at || !isPast(new Date(link.expires_at))) &&
            (!link.max_views || link.current_views < link.max_views);
        } else if (statusFilter === 'revoked') {
          matchesStatus = link.status === 'revoked';
        } else if (statusFilter === 'expired') {
          matchesStatus = link.expires_at && isPast(new Date(link.expires_at));
        }
      }

      // Type filter
      let matchesType = true;
      if (typeFilter !== 'all') {
        if (typeFilter === 'document') matchesType = !!link.document_id;
        if (typeFilter === 'folder') matchesType = !!link.folder_id;
        if (typeFilter === 'bundle') matchesType = !!link.bundle_id;
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [links, searchQuery, statusFilter, typeFilter]);

  const handleCopyLink = (token: string) => {
    const baseUrl = 'https://wattbyte.com';
    const shareUrl = `${baseUrl}/view/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
  };

  const handleRevokeLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secure_links')
        .update({ status: 'revoked' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Link revoked',
        description: 'The share link has been revoked',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secure_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Link deleted',
        description: 'The share link has been permanently deleted',
      });
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleExpanded = (linkId: string) => {
    const newExpanded = new Set(expandedLinks);
    if (newExpanded.has(linkId)) {
      newExpanded.delete(linkId);
    } else {
      newExpanded.add(linkId);
    }
    setExpandedLinks(newExpanded);
  };

  const getLinkType = (link: any) => {
    if (link.folder_id) return { icon: Folder, label: 'Folder', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (link.bundle_id) return { icon: Package, label: 'Bundle', color: 'text-purple-500', bg: 'bg-purple-500/10' };
    return { icon: FileText, label: 'Document', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  const getLinkName = (link: any) => {
    if (link.link_name) return link.link_name;
    if (link.secure_folders?.name) return link.secure_folders.name;
    if (link.document_bundles?.name) return link.document_bundles.name;
    if (link.secure_documents?.file_name) return link.secure_documents.file_name;
    return 'Untitled Link';
  };

  const getStatusBadge = (link: any) => {
    if (link.status === 'revoked') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Revoked
        </Badge>
      );
    }

    if (link.expires_at && isPast(new Date(link.expires_at))) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Expired
        </Badge>
      );
    }

    if (link.max_views && link.current_views >= link.max_views) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" />
          Max Views
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'download':
        return <Download className="w-3 h-3" />;
      case 'view_only':
      case 'no_download':
        return <Eye className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getLinkAnalytics = (linkId: string) => {
    const activity = viewerActivity?.filter((v: any) => v.link_id === linkId) || [];
    const totalViews = activity.length;
    const uniqueViewers = new Set(activity.map((v: any) => v.viewer_email || v.viewer_name)).size;
    const avgEngagement = activity.length
      ? Math.round(activity.reduce((sum: number, v: any) => sum + (v.engagement_score || 0), 0) / activity.length)
      : 0;
    return { totalViews, uniqueViewers, avgEngagement, recentActivity: activity.slice(0, 3) };
  };

  const getLinkFileInfo = (link: any) => {
    if (link.folder_id && folderCounts?.[link.folder_id]) {
      const info = folderCounts[link.folder_id];
      return { 
        count: info.count, 
        preview: info.files.slice(0, 3).map((f: any) => f.file_name).join(', ')
      };
    }
    if (link.bundle_id && bundleCounts?.[link.bundle_id]) {
      const info = bundleCounts[link.bundle_id];
      return { 
        count: info.count, 
        preview: info.files.slice(0, 3).map((f: any) => f.file_name).join(', ')
      };
    }
    if (link.document_id && link.secure_documents) {
      return { count: 1, preview: link.secure_documents.file_name };
    }
    return { count: 0, preview: '' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded w-full animate-pulse" />
          <div className="h-10 bg-muted rounded w-32 animate-pulse" />
          <div className="h-10 bg-muted rounded w-32 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse border-border/50">
            <div className="space-y-3">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 bg-gradient-to-br from-card to-muted/20">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-watt-primary to-watt-secondary rounded-full blur-xl opacity-20" />
            <div className="relative p-5 rounded-full bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
              <LinkIcon className="w-10 h-10 text-watt-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">No secure links yet</h3>
            <p className="text-muted-foreground">
              Create your first secure link to start sharing documents safely with tracking and analytics
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <LinkStatsOverview />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, recipient, or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="folder">Folders</SelectItem>
            <SelectItem value="bundle">Bundles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredLinks.length} of {links.length} links
      </p>

      {/* Links Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredLinks.map((link: any) => {
          const linkType = getLinkType(link);
          const LinkTypeIcon = linkType.icon;
          const analytics = getLinkAnalytics(link.id);
          const isExpanded = expandedLinks.has(link.id);

          return (
            <Card 
              key={link.id} 
              className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:border-watt-primary/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/0 to-watt-secondary/0 group-hover:from-watt-primary/5 group-hover:to-watt-secondary/5 transition-all duration-300" />
              
              <div className="relative p-5 sm:p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg ${linkType.bg} shrink-0`}>
                        <LinkTypeIcon className={`w-5 h-5 ${linkType.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 
                            className="font-semibold text-base sm:text-lg truncate cursor-pointer hover:text-watt-primary transition-colors"
                            onClick={() => {
                              setLinkToView(link);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            {getLinkName(link)}
                          </h3>
                          {getStatusBadge(link)}
                          <Badge variant="outline" className={`gap-1 text-xs ${linkType.color}`}>
                            {linkType.label}
                          </Badge>
                          {(() => {
                            const fileInfo = getLinkFileInfo(link);
                            return fileInfo.count > 0 && (link.folder_id || link.bundle_id) ? (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <FileText className="w-3 h-3" />
                                {fileInfo.count} {fileInfo.count === 1 ? 'file' : 'files'}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                        {(link.recipient_email || link.recipient_name) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {link.recipient_name && link.recipient_email 
                                ? `${link.recipient_name} (${link.recipient_email})`
                                : link.recipient_name || link.recipient_email
                              }
                            </span>
                          </p>
                        )}
                        {/* File preview for folders/bundles */}
                        {(() => {
                          const fileInfo = getLinkFileInfo(link);
                          if ((link.folder_id || link.bundle_id) && fileInfo.preview) {
                            return (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">
                                {fileInfo.preview}{fileInfo.count > 3 ? `, +${fileInfo.count - 3} more` : ''}
                              </p>
                            );
                          }
                          // Single document name when link has custom name
                          if (link.link_name && link.secure_documents?.file_name) {
                            return (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {link.secure_documents.file_name}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="gap-1.5 text-xs bg-card/50">
                      {getAccessIcon(link.access_level)}
                      <span className="capitalize">{link.access_level?.replace('_', ' ')}</span>
                    </Badge>
                    
                    {link.password_hash && (
                      <Badge variant="outline" className="gap-1.5 text-xs bg-card/50">
                        <Shield className="w-3 h-3" />
                        Password
                      </Badge>
                    )}

                    {link.require_otp && (
                      <Badge variant="outline" className="gap-1.5 text-xs bg-card/50">
                        <AlertCircle className="w-3 h-3" />
                        OTP
                      </Badge>
                    )}

                    {link.watermark_enabled && (
                      <Badge variant="outline" className="gap-1.5 text-xs bg-card/50">
                        <Shield className="w-3 h-3" />
                        Watermark
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-watt-primary/10">
                        <Eye className="w-3.5 h-3.5 text-watt-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-semibold text-sm">
                          {link.current_views || 0}
                          {link.max_views ? `/${link.max_views}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-green-500/10">
                        <User className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unique</p>
                        <p className="font-semibold text-sm">{analytics.uniqueViewers}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-muted">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-semibold text-xs">{format(new Date(link.created_at), 'MMM d')}</p>
                      </div>
                    </div>

                    {link.expires_at ? (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-amber-500/10">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expires</p>
                          <p className="font-semibold text-xs">{format(new Date(link.expires_at), 'MMM d')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-500/10">
                          <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <p className="font-semibold text-sm">{analytics.avgEngagement}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Analytics Preview */}
                  {analytics.recentActivity.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleExpanded(link.id)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Recent Activity ({analytics.totalViews} views)
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {analytics.recentActivity.map((activity: any) => (
                            <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-sm truncate">
                                  {activity.viewer_name || activity.viewer_email || 'Anonymous'}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(activity.opened_at), { addSuffix: true })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(link.link_token)}
                      disabled={link.status === 'revoked'}
                      className="gap-1.5 hover:bg-watt-primary/5 hover:border-watt-primary/30 hover:text-watt-primary transition-colors disabled:opacity-50"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLinkToView(link);
                        setDetailsDialogOpen(true);
                      }}
                      className="gap-1.5 hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-600 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Analytics
                    </Button>
                    
                    {link.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLinkToEdit(link);
                            setEditDialogOpen(true);
                          }}
                          className="gap-1.5 hover:bg-watt-secondary/5 hover:border-watt-secondary/30 hover:text-watt-secondary transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeLink(link.id)}
                          className="gap-1.5 hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-600 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Revoke
                        </Button>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLinkToDelete(link.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredLinks.length === 0 && links.length > 0 && (
        <Card className="p-8 text-center">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No links match your search criteria</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          >
            Clear filters
          </Button>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Secure Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the secure link
              and all associated analytics data. The link will immediately stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => linkToDelete && handleDeleteLink(linkToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditLinkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        link={linkToEdit}
        onSuccess={() => {
          refetch();
          setEditDialogOpen(false);
          setLinkToEdit(null);
        }}
      />

      <LinkDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        link={linkToView}
      />
    </div>
  );
}