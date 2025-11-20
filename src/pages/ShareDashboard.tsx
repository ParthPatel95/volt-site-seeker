import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { useAESODashboardSharing, ShareOptions } from '@/hooks/useAESODashboardSharing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Eye, EyeOff, Trash2, Share2, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ShareDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDashboardById } = useAESODashboards();
  const { createShareLink, getShareLinks, revokeShareLink, deleteShareLink, shareLinks, loading } = useAESODashboardSharing();
  const { toast } = useToast();
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [password, setPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'view_and_export'>('view_only');
  const [maxViews, setMaxViews] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    if (!id) return;
    const data = await getDashboardById(id);
    if (data) {
      setDashboard(data);
      await getShareLinks(id);
    }
  };

  const handleCreateShare = async () => {
    if (!id) return;

    const options: ShareOptions = {
      accessLevel,
      recipientEmail: recipientEmail || undefined,
      recipientName: recipientName || undefined,
    };

    if (requirePassword && password) {
      options.password = password;
    }

    if (maxViews) {
      options.maxViews = parseInt(maxViews);
    }

    if (expiresAt) {
      options.expiresAt = new Date(expiresAt).toISOString();
    }

    const result = await createShareLink(id, options);
    
    if (result) {
      setPassword('');
      setRequirePassword(false);
      setRecipientEmail('');
      setRecipientName('');
      setMaxViews('');
      setExpiresAt('');
      await getShareLinks(id);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/share/dashboard/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
  };

  const handleRevoke = async (shareId: string) => {
    await revokeShareLink(shareId);
    if (id) await getShareLinks(id);
  };

  const handleDelete = async (shareId: string) => {
    if (confirm('Are you sure you want to delete this share link?')) {
      await deleteShareLink(shareId);
      if (id) await getShareLinks(id);
    }
  };

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/app/aeso-dashboard-builder/${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Share Dashboard</h1>
            <p className="text-muted-foreground">{dashboard.dashboard_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Share Link</CardTitle>
              <CardDescription>
                Generate a secure link to share this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient (Optional)</Label>
                <Input
                  placeholder="Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="password-protection">Password Protection</Label>
                <Switch
                  id="password-protection"
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                />
              </div>

              {requirePassword && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Access Level</Label>
                <div className="flex gap-2">
                  <Button
                    variant={accessLevel === 'view_only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAccessLevel('view_only')}
                  >
                    View Only
                  </Button>
                  <Button
                    variant={accessLevel === 'view_and_export' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAccessLevel('view_and_export')}
                  >
                    View & Export
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Views (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Expires At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <Button onClick={handleCreateShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Share Links</CardTitle>
              <CardDescription>
                Manage existing share links for this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : shareLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No share links created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <Card key={link.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {link.recipient_name && (
                              <p className="font-medium truncate">{link.recipient_name}</p>
                            )}
                            {link.recipient_email && (
                              <p className="text-sm text-muted-foreground truncate">
                                {link.recipient_email}
                              </p>
                            )}
                          </div>
                          <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                            {link.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {link.password_hash && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Password
                            </div>
                          )}
                          {link.expires_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires {format(new Date(link.expires_at), 'MMM d, yyyy')}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {link.current_views}/{link.max_views || '∞'} views
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => copyShareLink(link.share_token)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
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
                            variant="outline"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
