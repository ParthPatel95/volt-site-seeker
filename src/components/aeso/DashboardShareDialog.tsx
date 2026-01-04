import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAESODashboardSharing } from '@/hooks/useAESODashboardSharing';
import { Copy, Check, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  dashboardName: string;
}

export function DashboardShareDialog({
  open,
  onOpenChange,
  dashboardId,
  dashboardName,
}: DashboardShareDialogProps) {
  const { toast } = useToast();
  const { shareLinks, createShareLink, revokeShareLink, deleteShareLink, getShareLinks } = useAESODashboardSharing();
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('7');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'view_and_export'>('view_only');
  const [maxViews, setMaxViews] = useState<number | undefined>();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Load existing shares when dialog opens
  useEffect(() => {
    if (open && dashboardId) {
      getShareLinks(dashboardId);
    }
  }, [open, dashboardId]);

  const handleCreateShare = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

      const link = await createShareLink(dashboardId, {
        recipientEmail,
        recipientName: recipientName || undefined,
        password: requirePassword ? password : undefined,
        expiresAt: expiresAt.toISOString(),
        accessLevel,
        maxViews,
      });

      if (link) {
        toast({
          title: 'Share link created',
          description: `Dashboard shared with ${recipientEmail}`,
        });
        
        // Reset form
        setRecipientEmail('');
        setRecipientName('');
        setPassword('');
        setRequirePassword(false);
        setMaxViews(undefined);
        
        // Refresh the list
        await getShareLinks(dashboardId);
      }
    } catch (error) {
      console.error('Error creating share:', error);
    } finally {
      setCreating(false);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/shared/dashboard/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
  };

  const handleRevoke = async (shareId: string) => {
    await revokeShareLink(shareId);
    await getShareLinks(dashboardId);
    toast({
      title: 'Share revoked',
      description: 'The share link has been revoked',
    });
  };

  const handleDelete = async (shareId: string) => {
    await deleteShareLink(shareId);
    await getShareLinks(dashboardId);
    toast({
      title: 'Share deleted',
      description: 'The share link has been deleted',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Dashboard: {dashboardName}</DialogTitle>
          <DialogDescription>
            Create a secure link to share this dashboard with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Share */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Create New Share Link</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires">Expires In</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access">Access Level</Label>
                <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view_only">View Only</SelectItem>
                    <SelectItem value="view_and_export">View & Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-toggle">Require Password</Label>
                <Switch
                  id="password-toggle"
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                />
              </div>
              
              {requirePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxViews">Max Views (optional)</Label>
              <Input
                id="maxViews"
                type="number"
                placeholder="Unlimited"
                value={maxViews || ''}
                onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <Button onClick={handleCreateShare} disabled={creating} className="w-full">
              Create Share Link
            </Button>
          </div>

          {/* Existing Shares */}
          {shareLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Active Share Links</h3>
              
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.recipient_email}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            link.status === 'active' ? 'bg-data-positive/10 text-data-positive' : 'bg-muted text-muted-foreground'
                          }`}>
                            {link.status}
                          </span>
                        </div>
                        {link.recipient_name && (
                          <p className="text-sm text-muted-foreground">{link.recipient_name}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Access: {link.access_level}</span>
                          {link.expires_at && (
                            <span>Expires: {format(new Date(link.expires_at), 'MMM d, yyyy')}</span>
                          )}
                          {link.max_views && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {link.current_views || 0}/{link.max_views}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareLink(link.share_token)}
                        >
                          {copiedToken === link.share_token ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {link.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevoke(link.id)}
                          >
                            Revoke
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
                }
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
