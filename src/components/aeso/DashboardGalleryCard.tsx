import { Dashboard } from '@/hooks/useAESODashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Edit, Share2, Copy, Trash2, Star, Eye, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardGalleryCardProps {
  dashboard: Dashboard;
  onView: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleStar: (e: React.MouseEvent) => void;
}

export function DashboardGalleryCard({
  dashboard,
  onView,
  onEdit,
  onShare,
  onDuplicate,
  onDelete,
  onToggleStar,
}: DashboardGalleryCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden"
      onClick={onView}
    >
      {/* Thumbnail Area */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <LayoutDashboard className="w-12 h-12 text-primary/30" />
        </div>
        
        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onShare(); }}>
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>

        {/* Star Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 hover:bg-background/80"
          onClick={onToggleStar}
        >
          <Star className={`w-4 h-4 ${dashboard.is_starred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{dashboard.dashboard_name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {dashboard.description || 'No description'}
            </CardDescription>
          </div>
        </div>

        {/* Tags */}
        {dashboard.tags && dashboard.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dashboard.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {dashboard.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{dashboard.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {dashboard.widget_count || 0} widgets
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {dashboard.view_count || 0} views
            </span>
          </div>
          <span>
            {formatDistanceToNow(new Date(dashboard.updated_at), { addSuffix: true })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onShare(); }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onDuplicate}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
