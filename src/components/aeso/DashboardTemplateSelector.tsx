import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Shield, Zap, BarChart3, Sparkles } from 'lucide-react';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '@/utils/dashboardTemplates';

interface DashboardTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: DashboardTemplate) => void;
}

const CATEGORY_ICONS = {
  trading: TrendingUp,
  risk: Shield,
  operations: Zap,
  analytics: BarChart3,
};

const CATEGORY_LABELS = {
  trading: 'Trading',
  risk: 'Risk Management',
  operations: 'Grid Operations',
  analytics: 'Analytics',
};

export function DashboardTemplateSelector({ 
  open, 
  onOpenChange, 
  onSelectTemplate 
}: DashboardTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('trading');

  const filteredTemplates = DASHBOARD_TEMPLATES.filter(
    t => t.category === selectedCategory
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose a Dashboard Template
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built template tailored to your role and customize it
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = CATEGORY_ICONS[template.category];
                  return (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                      onClick={() => {
                        onSelectTemplate(template);
                        onOpenChange(false);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {template.category}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Widgets:</span>
                            <Badge variant="outline">{template.widgets.length}</Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground mb-2">Includes:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.widgets.slice(0, 4).map((widget, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {widget.title}
                                </Badge>
                              ))}
                              {template.widgets.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.widgets.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button variant="outline" className="w-full mt-3" size="sm">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
