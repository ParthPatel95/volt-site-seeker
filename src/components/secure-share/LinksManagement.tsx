import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isPast } from 'date-fns';
import { EditLinkDialog } from './EditLinkDialog';

export function LinksManagement() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<any>(null);

  const { data: links, isLoading, refetch } = useQuery({
    queryKey: ['secure-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_links')
        .select(`
          *,
          secure_documents (
            file_name,
            category
          ),
          document_bundles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
          Max Views Reached
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

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6">
        {links.map((link: any) => (
          <Card key={link.id} className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:border-watt-primary/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/0 to-watt-secondary/0 group-hover:from-watt-primary/5 group-hover:to-watt-secondary/5 transition-all duration-300" />
            
            <div className="relative p-5 sm:p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {link.link_name || link.document_bundles?.name || link.secure_documents?.file_name || 'Unknown Document'}
                      </h3>
                      {getStatusBadge(link)}
                    </div>
                    {link.recipient_email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{link.recipient_name || link.recipient_email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Features */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Badge variant="outline" className="gap-1.5 text-xs bg-card/50">
                    {getAccessIcon(link.access_level)}
                    <span className="capitalize">{link.access_level.replace('_', ' ')}</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
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
                    <div className="p-1.5 rounded-md bg-muted">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-semibold text-xs">{format(new Date(link.created_at), 'MMM d')}</p>
                    </div>
                  </div>

                  {link.expires_at && (
                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                      <div className="p-1.5 rounded-md bg-muted">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="font-semibold text-xs">{format(new Date(link.expires_at), 'MMM d')}</p>
                      </div>
                    </div>
                  )}
                </div>

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
        ))}
      </div>

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
    </div>
  );
}
