import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardCollaboration } from '@/hooks/useDashboardCollaboration';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DashboardVersionHistoryProps {
  dashboardId: string;
  onRestoreVersion?: (versionId: string) => void;
}

export function DashboardVersionHistory({ dashboardId, onRestoreVersion }: DashboardVersionHistoryProps) {
  const { versions } = useDashboardCollaboration(dashboardId);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  const getVersionBadgeVariant = (index: number) => {
    if (index === 0) return 'default';
    return 'secondary';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Version History</CardTitle>
              <CardDescription>
                Track changes and restore previous versions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No version history yet</p>
                <p className="text-sm">Versions are created automatically on save</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {versions.map((version, index) => (
                  <Card key={version.id} className={index === 0 ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getVersionBadgeVariant(index)}>
                              Version {version.version_number}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium">
                              {version.change_description || 'Dashboard updated'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              By {version.user_email || 'Unknown user'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </p>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">
                              {(version.widgets_snapshot as any[])?.length || 0}
                            </span>
                            {' '}widgets
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedVersion(version)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {index > 0 && onRestoreVersion && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (confirm('Are you sure you want to restore this version?')) {
                                  onRestoreVersion(version.id);
                                }
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Version Preview Dialog */}
      {selectedVersion && (
        <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Version {selectedVersion.version_number} Preview</DialogTitle>
              <DialogDescription>
                Created {formatDistanceToNow(new Date(selectedVersion.created_at), { addSuffix: true })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Dashboard Name</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVersion.dashboard_snapshot.dashboard_name}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVersion.dashboard_snapshot.description || 'No description'}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Widgets ({(selectedVersion.widgets_snapshot as any[])?.length || 0})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {((selectedVersion.widgets_snapshot as any[]) || []).map((widget: any, index: number) => (
                    <Card key={index} className="p-3">
                      <p className="text-sm font-medium">{widget.widget_config?.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {widget.widget_type} • {widget.data_source}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
