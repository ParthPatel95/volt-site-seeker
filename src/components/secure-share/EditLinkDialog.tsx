import { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: any;
  onSuccess: () => void;
}

export function EditLinkDialog({
  open,
  onOpenChange,
  link,
  onSuccess,
}: EditLinkDialogProps) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'download' | 'no_download'>('view_only');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [maxViews, setMaxViews] = useState<number>();
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [ndaRequired, setNdaRequired] = useState(false);

  // Initialize form with link data
  useEffect(() => {
    if (link) {
      setRecipientEmail(link.recipient_email || '');
      setRecipientName(link.recipient_name || '');
      setAccessLevel(link.access_level || 'view_only');
      setRequirePassword(!!link.password_hash);
      setPassword(''); // Don't show existing password
      setExpiresAt(link.expires_at ? new Date(link.expires_at) : undefined);
      setMaxViews(link.max_views || undefined);
      setWatermarkEnabled(link.watermark_enabled ?? true);
      setNdaRequired(link.nda_required ?? false);
    }
  }, [link]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Hash password if provided and changed
      let passwordHash = link.password_hash; // Keep existing hash
      if (requirePassword && password) {
        passwordHash = btoa(password); // Simple encoding for demo
      } else if (!requirePassword) {
        passwordHash = null;
      }

      const updateData: any = {
        recipient_email: recipientEmail || null,
        recipient_name: recipientName || null,
        access_level: accessLevel,
        password_hash: passwordHash,
        expires_at: expiresAt?.toISOString() || null,
        max_views: maxViews || null,
        watermark_enabled: watermarkEnabled,
        nda_required: ndaRequired,
      };

      const { error } = await supabase
        .from('secure_links')
        .update(updateData)
        .eq('id', link.id);

      if (error) throw error;

      toast({
        title: 'Link updated',
        description: 'Secure link has been updated successfully',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to update link',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Secure Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Recipient Email (Optional)</Label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="investor@example.com"
            />
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
              <Label>New Password (leave empty to keep current)</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          )}

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
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updating}>
            {updating ? 'Updating...' : 'Update Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
