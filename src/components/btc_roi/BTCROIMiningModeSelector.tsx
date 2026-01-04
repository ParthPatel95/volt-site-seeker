
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Home, Users, Zap } from 'lucide-react';

interface BTCROIMiningSelectorProps {
  mode: 'hosting' | 'self';
  onModeChange: (mode: 'hosting' | 'self') => void;
}

export const BTCROIMiningModeSelector: React.FC<BTCROIMiningSelectorProps> = ({ 
  mode, 
  onModeChange 
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Choose Your Mining Strategy
        </h3>
        <p className="text-sm text-muted-foreground">
          Select your business model
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Hosting Business Option */}
        <div 
          className={`relative rounded-lg border-2 transition-all cursor-pointer ${
            mode === 'hosting' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
          }`}
          onClick={() => onModeChange('hosting')}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-lg ${
                  mode === 'hosting' ? 'bg-primary' : 'bg-muted-foreground'
                }`}>
                  <Building className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base text-foreground">
                    Hosting Business
                  </h4>
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Calculate profits from hosting miners for clients
                </p>
              </div>
              {mode === 'hosting' && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Self-Mining Option */}
        <div 
          className={`relative rounded-lg border-2 transition-all cursor-pointer ${
            mode === 'self' 
              ? 'border-data-positive bg-data-positive/5' 
              : 'border-border bg-card hover:border-data-positive/50 hover:bg-data-positive/5'
          }`}
          onClick={() => onModeChange('self')}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-lg ${
                  mode === 'self' ? 'bg-data-positive' : 'bg-muted-foreground'
                }`}>
                  <Home className="w-5 h-5 text-data-positive-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base text-foreground">
                    Self-Mining
                  </h4>
                  <Zap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Calculate ROI for your own mining operation
                </p>
              </div>
              {mode === 'self' && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-data-positive flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-data-positive-foreground"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mode Description */}
      <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
        {mode === 'hosting' ? (
          <div>
            <h4 className="font-medium text-primary mb-2">
              Hosting Business Mode
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Perfect for facilities that host miners for clients. Calculate your revenue from hosting fees 
              minus your electricity costs and operational expenses.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-data-positive mb-2">
              Self-Mining Mode
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ideal for individual miners or businesses mining for themselves. Calculate your mining 
              revenue minus hardware costs, electricity, and operational expenses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
