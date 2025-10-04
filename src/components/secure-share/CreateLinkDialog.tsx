import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
  onSuccess: () => void;
}

export function CreateLinkDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
  onSuccess,
}: CreateLinkDialogProps) {
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Basic settings
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'download' | 'no_download'>('view_only');

  // Security settings
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [maxViews, setMaxViews] = useState<number>();
  const [allowedDomains, setAllowedDomains] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [ndaRequired, setNdaRequired] = useState(false);

  const generateSecureToken = () => {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const linkToken = generateSecureToken();
      
      // Hash password if provided
      let passwordHash = null;
      if (requirePassword && password) {
        // In production, use proper password hashing
        passwordHash = btoa(password); // Simple encoding for demo
      }

      const linkData: any = {
        document_id: documentId,
        link_token: linkToken,
        recipient_email: recipientEmail || null,
        recipient_name: recipientName || null,
        access_level: accessLevel,
        password_hash: passwordHash,
        require_otp: requireOtp,
        expires_at: expiresAt?.toISOString() || null,
        max_views: maxViews || null,
        allowed_domains: allowedDomains ? allowedDomains.split(',').map(d => d.trim()) : null,
        watermark_enabled: watermarkEnabled,
        nda_required: ndaRequired,
      };

      const { data, error } = await supabase
        .from('secure_links')
        .insert([linkData])
        .select()
        .single();

      if (error) throw error;

      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/view/${linkToken}`;
      setGeneratedLink(shareUrl);

      toast({
        title: 'Link created',
        description: 'Secure link has been generated successfully',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to create link',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setRecipientEmail('');
    setRecipientName('');
    setPassword('');
    setExpiresAt(undefined);
    setMaxViews(undefined);
    setAllowedDomains('');
    setRequirePassword(false);
    setRequireOtp(false);
    onOpenChange(false);
  };

  if (generatedLink) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Secure Link Created</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Share this link:</p>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Link Settings Summary:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Access Level: {accessLevel.replace('_', ' ')}</li>
                {recipientEmail && <li>• Recipient: {recipientEmail}</li>}
                {expiresAt && <li>• Expires: {format(expiresAt, 'PPP')}</li>}
                {maxViews && <li>• Max Views: {maxViews}</li>}
                {requirePassword && <li>• Password protected</li>}
                {requireOtp && <li>• OTP verification required</li>}
                {watermarkEnabled && <li>• Watermarked</li>}
                {ndaRequired && <li>• NDA signature required</li>}
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Secure Link</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sharing: {documentName}
          </p>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label>Recipient Email (Optional)</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="investor@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If provided, analytics will track this recipient
              </p>
            </div>

            <div>
              <Label>Recipient Name (Optional)</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Investor"
              />
            </div>

            <div>
              <Label>Access Level</Label>
              <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view_only">View Only</SelectItem>
                  <SelectItem value="download">Allow Download</SelectItem>
                  <SelectItem value="no_download">View Only (No Download)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expiration Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expiresAt && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, 'PPP') : 'No expiration'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Maximum Views (Optional)</Label>
              <Input
                type="number"
                value={maxViews || ''}
                onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                min="1"
              />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Protection</Label>
                <p className="text-xs text-muted-foreground">
                  Require a password to access this document
                </p>
              </div>
              <Switch
                checked={requirePassword}
                onCheckedChange={setRequirePassword}
              />
            </div>

            {requirePassword && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>OTP Verification</Label>
                <p className="text-xs text-muted-foreground">
                  Send one-time password to recipient email
                </p>
              </div>
              <Switch
                checked={requireOtp}
                onCheckedChange={setRequireOtp}
                disabled={!recipientEmail}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Watermark</Label>
                <p className="text-xs text-muted-foreground">
                  Add viewer information watermark to pages
                </p>
              </div>
              <Switch
                checked={watermarkEnabled}
                onCheckedChange={setWatermarkEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>NDA Requirement</Label>
                <p className="text-xs text-muted-foreground">
                  Require NDA signature before viewing
                </p>
              </div>
              <Switch
                checked={ndaRequired}
                onCheckedChange={setNdaRequired}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div>
              <Label>Allowed Email Domains (Optional)</Label>
              <Input
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                placeholder="example.com, company.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of allowed domains
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Coming Soon</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• IP Whitelisting</li>
                <li>• Geographic Restrictions</li>
                <li>• Custom Branding</li>
                <li>• Auto-redaction</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateLink} disabled={creating}>
            {creating ? 'Creating...' : 'Create Secure Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
