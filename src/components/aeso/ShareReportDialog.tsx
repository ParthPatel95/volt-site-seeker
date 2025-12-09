import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Copy, Check, Loader2, Link, Lock, Eye, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: any;
  reportConfig: any;
  reportHtml?: string;
  reportType: 'single' | 'comprehensive';
}

export function ShareReportDialog({
  open,
  onOpenChange,
  reportData,
  reportConfig,
  reportHtml,
  reportType
}: ShareReportDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState(
    reportType === 'comprehensive' 
      ? 'AESO Comprehensive Uptime Analysis' 
      : 'AESO Uptime Optimization Analysis'
  );
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [useExpiration, setUseExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [useMaxViews, setUseMaxViews] = useState(false);
  const [maxViews, setMaxViews] = useState('10');

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      // Step 1: Generate the HTML report first (if not already provided)
      let generatedHtml = reportHtml;
      
      if (!generatedHtml) {
        console.log('[ShareReportDialog] No reportHtml provided, generating from edge function...');
        console.log('[ShareReportDialog] Report type:', reportType);
        console.log('[ShareReportDialog] Report data:', JSON.stringify(reportData).substring(0, 500));
        
        // For comprehensive reports, reportData is an array of scenarios
        // For single reports, reportData is a single analysis object
        const isComprehensive = reportType === 'comprehensive';
        const scenariosArray = isComprehensive && Array.isArray(reportData) ? reportData : undefined;
        const singleAnalysisData = isComprehensive 
          ? (Array.isArray(reportData) && reportData.length > 0 ? reportData[0]?.analysis : {})
          : reportData;
        
        console.log('[ShareReportDialog] Is comprehensive:', isComprehensive);
        console.log('[ShareReportDialog] Scenarios count:', scenariosArray?.length || 0);
        
        // Call the export function to generate HTML
        const { data: exportData, error: exportError } = await supabase.functions.invoke('aeso-analysis-export', {
          body: {
            analysisData: singleAnalysisData,
            config: {
              ...reportConfig,
              exportType: reportType,
              scenarios: scenariosArray
            }
          }
        });

        if (exportError) {
          console.error('[ShareReportDialog] Export error:', exportError);
          throw new Error('Failed to generate report HTML');
        }

        if (exportData?.htmlContent) {
          // Decode the base64 HTML content
          generatedHtml = decodeURIComponent(escape(atob(exportData.htmlContent)));
          console.log('[ShareReportDialog] Generated HTML content, length:', generatedHtml.length);
        }
      }

      if (!generatedHtml) {
        throw new Error('Could not generate report HTML');
      }

      // Step 2: Create the shareable link with the HTML
      const { data, error } = await supabase.functions.invoke('aeso-share-report', {
        body: {
          reportData,
          reportConfig: {
            ...reportConfig,
            exportType: reportType
          },
          reportHtml: generatedHtml,
          title,
          password: usePassword ? password : undefined,
          expiresAt: useExpiration && expirationDate ? expirationDate.toISOString() : undefined,
          maxViews: useMaxViews ? parseInt(maxViews) : undefined
        }
      });

      if (error) throw error;

      if (data?.success && data?.shareUrl) {
        setShareUrl(data.shareUrl);
        toast({
          title: "Shareable Link Created",
          description: "Your analysis report link is ready to share.",
        });
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Failed to Create Link",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Create Shareable Link
          </DialogTitle>
          <DialogDescription>
            Create a secure link to share this {reportType === 'comprehensive' ? 'comprehensive' : ''} analysis report.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>

            {/* Password Protection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="password-toggle">Password Protection</Label>
              </div>
              <Switch
                id="password-toggle"
                checked={usePassword}
                onCheckedChange={setUsePassword}
              />
            </div>
            {usePassword && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            )}

            {/* Expiration Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="expiration-toggle">Expiration Date</Label>
              </div>
              <Switch
                id="expiration-toggle"
                checked={useExpiration}
                onCheckedChange={setUseExpiration}
              />
            </div>
            {useExpiration && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate ? format(expirationDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Max Views */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="maxviews-toggle">Limit Views</Label>
              </div>
              <Switch
                id="maxviews-toggle"
                checked={useMaxViews}
                onCheckedChange={setUseMaxViews}
              />
            </div>
            {useMaxViews && (
              <Input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Maximum views"
                min="1"
              />
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                Link created successfully!
              </span>
            </div>

            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {usePassword && (
                <p className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password protected
                </p>
              )}
              {useExpiration && expirationDate && (
                <p className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> Expires {format(expirationDate, "PPP")}
                </p>
              )}
              {useMaxViews && (
                <p className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Limited to {maxViews} views
                </p>
              )}
              <p className="flex items-center gap-1 text-amber-600">
                ⚠️ Viewers must provide their name and email to access
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateLink} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Create Link
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
