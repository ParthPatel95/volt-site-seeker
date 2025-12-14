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
import { Link as LinkIcon, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isPast } from 'date-fns';
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
      <div className="grid gap-4">
        {filteredLinks.map((link: any) => {
          const analytics = getLinkAnalytics(link.id);
          const fileInfo = getLinkFileInfo(link);

          return (
            <EnhancedLinkCard
              key={link.id}
              link={link}
              analytics={analytics}
              fileInfo={fileInfo}
              onEdit={() => {
                setLinkToEdit(link);
                setEditDialogOpen(true);
              }}
              onRevoke={() => handleRevokeLink(link.id)}
              onDelete={() => {
                setLinkToDelete(link.id);
                setDeleteDialogOpen(true);
              }}
              onViewDetails={() => {
                setLinkToView(link);
                setDetailsDialogOpen(true);
              }}
            />
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