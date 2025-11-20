import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAESODashboardSharing } from '@/hooks/useAESODashboardSharing';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Share2, Lock, Calendar, Eye, Globe } from 'lucide-react';

interface ShareDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
}

export function ShareDashboardDialog({ open, onOpenChange, dashboardId }: ShareDashboardDialogProps) {
  const { createShareLink } = useAESODashboardSharing();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState('7');
  const [maxViews, setMaxViews] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'view_and_export'>('view_only');

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      const expiresAt = hasExpiration
        ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const result = await createShareLink(dashboardId, {
        password: requirePassword ? password : undefined,
        accessLevel,
        maxViews: maxViews ? parseInt(maxViews) : undefined,
        expiresAt,
      });

      if (result) {
        const url = `${window.location.origin}/shared/${result.share_token}`;
        setShareUrl(url);
        toast({
          title: 'Share link created',
          description: 'Copy the link to share your dashboard',
        });
      }
    } catch (error) {
      console.error('Error creating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Share link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Dashboard
          </DialogTitle>
          <DialogDescription>
            Configure sharing settings and generate a secure link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="access-level">Access Level</Label>
                <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                  <SelectTrigger id="access-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view_only">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Only
                      </div>
                    </SelectItem>
                    <SelectItem value="view_and_export">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        View & Export
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <Label htmlFor="password-protection">Password Protection</Label>
                </div>
                <Switch
                  id="password-protection"
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                />
              </div>

              {requirePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Label htmlFor="expiration">Set Expiration</Label>
                </div>
                <Switch
                  id="expiration"
                  checked={hasExpiration}
                  onCheckedChange={setHasExpiration}
                />
              </div>

              {hasExpiration && (
                <div className="space-y-2">
                  <Label htmlFor="expiration-days">Expires in (days)</Label>
                  <Select value={expirationDays} onValueChange={setExpirationDays}>
                    <SelectTrigger id="expiration-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="max-views">Max Views (optional)</Label>
                <Input
                  id="max-views"
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>

              <Button
                onClick={handleCreateShareLink}
                disabled={loading || (requirePassword && !password)}
                className="w-full"
              >
                Generate Share Link
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShareUrl(null);
                  setPassword('');
                  setRequirePassword(false);
                  setHasExpiration(false);
                }}
                variant="outline"
                className="w-full"
              >
                Create Another Link
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
