import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, Smartphone, Tablet, Monitor } from 'lucide-react';

interface DashboardLayoutEditorProps {
  dashboard: any;
  widgets: any[];
  onLayoutUpdate: (layoutConfig: any) => void;
}

export function DashboardLayoutEditor({ dashboard, widgets, onLayoutUpdate }: DashboardLayoutEditorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>
              Arrange widgets and customize responsive breakpoints
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button variant="ghost" size="sm">
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button variant="ghost" size="sm">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            <div className="text-center space-y-3">
              <Grid className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">Visual Layout Editor</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop widgets to arrange your dashboard layout
                </p>
              </div>
              <Badge variant="secondary">Coming in full implementation</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grid Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Columns:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Row Height:</span>
                  <span className="font-medium">100px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Widgets:</span>
                  <span className="font-medium">{widgets.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Responsive Breakpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desktop:</span>
                  <span className="font-medium">≥1200px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tablet:</span>
                  <span className="font-medium">768px - 1199px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="font-medium">&lt;768px</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
