import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isPast } from 'date-fns';

export function LinksManagement() {
  const { toast } = useToast();

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCopyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/view/${token}`;
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
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-24 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <LinkIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No secure links yet</h3>
            <p className="text-muted-foreground">
              Create secure links from your documents to start sharing
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {links.map((link: any) => (
          <Card key={link.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {link.secure_documents?.file_name || 'Unknown Document'}
                    </h3>
                    {getStatusBadge(link)}
                  </div>
                  {link.recipient_email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {link.recipient_name || link.recipient_email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getAccessIcon(link.access_level)}
                  <span className="capitalize">{link.access_level.replace('_', ' ')}</span>
                </div>
                
                {link.password_hash && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Password</span>
                  </div>
                )}

                {link.require_otp && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>OTP</span>
                  </div>
                )}

                {link.watermark_enabled && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Watermark</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>
                    {link.current_views || 0}
                    {link.max_views ? ` / ${link.max_views}` : ''} views
                  </span>
                </div>

                {link.expires_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Expires {format(new Date(link.expires_at), 'MMM d, yyyy')}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {format(new Date(link.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(link.link_token)}
                  disabled={link.status === 'revoked'}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Link
                </Button>
                
                {link.status === 'active' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeLink(link.id)}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
