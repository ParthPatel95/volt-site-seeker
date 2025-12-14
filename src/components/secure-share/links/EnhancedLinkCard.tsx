import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, Trash2, Edit, Eye, ExternalLink, MoreVertical,
  FileText, Folder, Package, User, Clock, Shield, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, isPast } from 'date-fns';
import { LinkHeatIndicator } from './LinkHeatIndicator';
import { LinkEngagementSparkline } from './LinkEngagementSparkline';
import { ViewerTimeline } from './ViewerTimeline';
import { useViewerTracking } from '@/contexts/ViewerTrackingContext';
import { subDays } from 'date-fns';

interface EnhancedLinkCardProps {
  link: any;
  analytics: {
    totalViews: number;
    uniqueViewers: number;
    avgEngagement: number;
    recentActivity: any[];
  };
  fileInfo?: {
    count: number;
    preview: string;
  };
  onEdit: () => void;
  onRevoke: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

export function EnhancedLinkCard({
  link,
  analytics,
  fileInfo,
  onEdit,
  onRevoke,
  onDelete,
  onViewDetails
}: EnhancedLinkCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const { hasActiveViewers } = useViewerTracking();

  const handleCopyLink = () => {
    const baseUrl = 'https://wattbyte.com';
    const shareUrl = `${baseUrl}/view/${link.link_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard',
    });
  };

  const getLinkType = () => {
    if (link.folder_id) return { icon: Folder, label: 'Folder', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (link.bundle_id) return { icon: Package, label: 'Bundle', color: 'text-purple-500', bg: 'bg-purple-500/10' };
    return { icon: FileText, label: 'Document', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  const linkType = getLinkType();
  const LinkTypeIcon = linkType.icon;

  const getLinkName = () => {
    if (link.link_name) return link.link_name;
    if (link.secure_folders?.name) return link.secure_folders.name;
    if (link.document_bundles?.name) return link.document_bundles.name;
    if (link.secure_documents?.file_name) return link.secure_documents.file_name;
    return 'Untitled Link';
  };

  const getStatus = () => {
    if (link.status === 'revoked') {
      return { label: 'Revoked', variant: 'destructive' as const, icon: XCircle };
    }
    if (link.expires_at && isPast(new Date(link.expires_at))) {
      return { label: 'Expired', variant: 'secondary' as const, icon: Clock };
    }
    if (link.max_views && link.current_views >= link.max_views) {
      return { label: 'Max Views', variant: 'secondary' as const, icon: Eye };
    }
    return { label: 'Active', variant: 'default' as const, icon: CheckCircle2, isActive: true };
  };

  const status = getStatus();

  // Calculate recent views (last 24 hours)
  const recentViews = analytics.recentActivity.filter(a => {
    const activityDate = new Date(a.opened_at);
    return activityDate >= subDays(new Date(), 1);
  }).length;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-2.5 rounded-lg ${linkType.bg} shrink-0`}>
              <LinkTypeIcon className={`w-5 h-5 ${linkType.color}`} />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 
                  className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={onViewDetails}
                >
                  {getLinkName()}
                </h3>
                <Badge variant={status.variant} className="gap-1 shrink-0">
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Created {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}</span>
                {fileInfo && fileInfo.count > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {fileInfo.count} files
                  </Badge>
                )}
                {link.require_password && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Shield className="w-3 h-3" />
                    Protected
                  </Badge>
                )}
              </div>
              
              {/* File preview */}
              {fileInfo && fileInfo.preview && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {fileInfo.preview}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 hidden sm:flex"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink} className="sm:hidden">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDetails}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/view/${link.link_token}`, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {status.isActive && (
                  <DropdownMenuItem onClick={onRevoke} className="text-amber-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Revoke Link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <LinkHeatIndicator
              totalViews={analytics.totalViews}
              recentViews={recentViews}
              avgEngagement={analytics.avgEngagement}
              isActive={hasActiveViewers(link.id)}
            />
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{analytics.totalViews}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">{analytics.uniqueViewers}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LinkEngagementSparkline activities={analytics.recentActivity} />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Timeline */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            <ViewerTimeline activities={analytics.recentActivity} compact />
          </div>
        )}
      </div>
    </Card>
  );
}
