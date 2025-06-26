
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Home } from 'lucide-react';

interface BTCROIMiningSelectorProps {
  mode: 'hosting' | 'self';
  onModeChange: (mode: 'hosting' | 'self') => void;
}

export const BTCROIMiningModeSelector: React.FC<BTCROIMiningSelectorProps> = ({ 
  mode, 
  onModeChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mining Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={mode === 'hosting' ? 'default' : 'outline'}
            onClick={() => onModeChange('hosting')}
            className="h-20 flex flex-col gap-2"
          >
            <Building className="w-8 h-8" />
            <div>
              <div className="font-semibold">Hosting Mode</div>
              <div className="text-xs opacity-75">Third-party hosting</div>
            </div>
          </Button>
          
          <Button
            variant={mode === 'self' ? 'default' : 'outline'}
            onClick={() => onModeChange('self')}
            className="h-20 flex flex-col gap-2"
          >
            <Home className="w-8 h-8" />
            <div>
              <div className="font-semibold">Self-Mining</div>
              <div className="text-xs opacity-75">Own facility</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
