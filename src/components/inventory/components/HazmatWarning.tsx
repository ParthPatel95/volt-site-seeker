import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Skull,
  Thermometer,
  Droplets,
  Wind,
  Info
} from 'lucide-react';
import { HazmatFlags } from '../types/demolition.types';
import { cn } from '@/lib/utils';

interface HazmatWarningProps {
  hazmatFlags: HazmatFlags;
  className?: string;
}

interface HazardItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const HAZARD_CONFIG: Record<string, Omit<HazardItem, 'id'>> = {
  asbestos: {
    label: 'Asbestos',
    icon: Wind,
    color: 'bg-red-500/10 text-red-600 border-red-200',
    description: 'Requires certified asbestos removal specialist',
  },
  leadPaint: {
    label: 'Lead Paint',
    icon: Droplets,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200',
    description: 'Lead abatement procedures required',
  },
  pcbs: {
    label: 'PCBs',
    icon: Skull,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    description: 'EPA-regulated disposal required for PCB-containing equipment',
  },
  refrigerants: {
    label: 'Refrigerants',
    icon: Thermometer,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    description: 'Requires certified HVAC technician for refrigerant recovery',
  },
};

export function HazmatWarning({ hazmatFlags, className }: HazmatWarningProps) {
  const activeHazards: HazardItem[] = [];
  
  if (hazmatFlags.hasAsbestos) {
    activeHazards.push({ id: 'asbestos', ...HAZARD_CONFIG.asbestos });
  }
  if (hazmatFlags.hasLeadPaint) {
    activeHazards.push({ id: 'leadPaint', ...HAZARD_CONFIG.leadPaint });
  }
  if (hazmatFlags.hasPCBs) {
    activeHazards.push({ id: 'pcbs', ...HAZARD_CONFIG.pcbs });
  }
  if (hazmatFlags.hasRefrigerants) {
    activeHazards.push({ id: 'refrigerants', ...HAZARD_CONFIG.refrigerants });
  }
  
  // Add other hazards
  hazmatFlags.otherHazards?.forEach((hazard, index) => {
    activeHazards.push({
      id: `other-${index}`,
      label: hazard,
      icon: AlertTriangle,
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      description: 'Special handling may be required',
    });
  });

  if (activeHazards.length === 0) {
    return null;
  }

  return (
    <Alert 
      variant="destructive" 
      className={cn(
        "border-red-300 bg-red-50 dark:bg-red-950/30",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-red-700 dark:text-red-400 font-semibold">
        ⚠️ Hazardous Materials Detected
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-3">
        <div className="text-sm text-red-700 dark:text-red-300">
          This item may contain the following hazardous materials:
        </div>
        
        <div className="space-y-2">
          {activeHazards.map((hazard) => {
            const Icon = hazard.icon;
            return (
              <div 
                key={hazard.id}
                className="flex items-start gap-2 p-2 rounded-md bg-white/50 dark:bg-black/20"
              >
                <Badge variant="outline" className={cn("shrink-0 gap-1", hazard.color)}>
                  <Icon className="w-3 h-3" />
                  {hazard.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {hazard.description}
                </span>
              </div>
            );
          })}
        </div>

        {hazmatFlags.disposalNotes && (
          <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {hazmatFlags.disposalNotes}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
          EPA regulations may apply. Consult with licensed disposal contractors.
        </div>
      </AlertDescription>
    </Alert>
  );
}
