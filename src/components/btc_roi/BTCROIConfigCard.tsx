
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, Home, ArrowRight } from 'lucide-react';

interface BTCROIConfigCardProps {
  mode: 'hosting' | 'self';
  onOpenConfig: () => void;
  hasConfiguration: boolean;
}

export const BTCROIConfigCard: React.FC<BTCROIConfigCardProps> = ({
  mode,
  onOpenConfig,
  hasConfiguration
}) => {
  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <span className="truncate">Configuration</span>
          {hasConfiguration && (
            <Badge variant="secondary" className="ml-auto">
              Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className={`p-2 rounded-lg ${
              mode === 'hosting' ? 'bg-primary' : 'bg-data-positive'
            }`}>
              {mode === 'hosting' ? (
                <Building2 className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Home className="w-4 h-4 text-data-positive-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {mode === 'hosting' ? 'Hosting Business' : 'Self-Mining'}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {mode === 'hosting' 
                  ? 'Configure facility parameters' 
                  : 'Set up mining hardware'
                }
              </p>
            </div>
          </div>

          <Button 
            onClick={onOpenConfig}
            className="w-full"
            variant={hasConfiguration ? "outline" : "default"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {hasConfiguration ? 'Edit Configuration' : 'Configure Parameters'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {!hasConfiguration && (
            <p className="text-xs text-center text-muted-foreground">
              Click to set up your {mode === 'hosting' ? 'hosting facility' : 'mining setup'} parameters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
