import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, DollarSign, HelpCircle, Zap, Shield } from 'lucide-react';
import { CreditSettings } from '@/hooks/useEnergyCredits';

interface Props {
  settings: CreditSettings;
  onSettingsChange: (settings: CreditSettings) => void;
}

export function CreditSettingsPanel({ settings, onSettingsChange }: Props) {
  const [isOpen, setIsOpen] = React.useState(settings.enabled);

  const handleToggle = (enabled: boolean) => {
    onSettingsChange({ ...settings, enabled });
    if (enabled) setIsOpen(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Credit Adjustments
                  {settings.enabled && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Apply 12CP and Operating Reserve credits to pricing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="credits-enabled" className="text-sm">Enable</Label>
                <Switch
                  id="credits-enabled"
                  checked={settings.enabled}
                  onCheckedChange={handleToggle}
                />
              </div>
              <CollapsibleTrigger asChild>
                <button className="p-1 hover:bg-muted rounded">
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* 12CP Avoidance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <Label className="text-sm font-medium">12CP Avoidance Rate</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          <strong>12 Coincident Peak (12CP):</strong> AESO charges transmission based on your demand during the 12 monthly system peaks. 
                          By reducing load during these peaks, you can avoid ~$11.73/MWh in transmission charges.
                        </p>
                        <p className="text-xs mt-1">
                          100% = fully curtail during all peak hours<br/>
                          50% = partial curtailment strategy
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="outline" className="font-mono">
                  {settings.twelveCPAvoidanceRate}%
                </Badge>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[settings.twelveCPAvoidanceRate]}
                onValueChange={([value]) => onSettingsChange({ ...settings, twelveCPAvoidanceRate: value })}
                disabled={!settings.enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No avoidance</span>
                <span>Full avoidance</span>
              </div>
              {settings.enabled && settings.twelveCPAvoidanceRate > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-md">
                  💰 Estimated credit: ${(11.73 * (settings.twelveCPAvoidanceRate / 100)).toFixed(2)}/MWh transmission savings
                </p>
              )}
            </div>

            {/* Operating Reserve Participation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <Label className="text-sm font-medium">Operating Reserve Participation</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          <strong>Operating Reserves:</strong> Revenue earned by being available to curtail load on demand for grid stability. 
                          Typical earnings range $3-8/MWh depending on market conditions.
                        </p>
                        <p className="text-xs mt-1">
                          100% = full participation in OR market<br/>
                          0% = no OR participation
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="outline" className="font-mono">
                  {settings.operatingReserveParticipation}%
                </Badge>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[settings.operatingReserveParticipation]}
                onValueChange={([value]) => onSettingsChange({ ...settings, operatingReserveParticipation: value })}
                disabled={!settings.enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No participation</span>
                <span>Full participation</span>
              </div>
              {settings.enabled && settings.operatingReserveParticipation > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-md">
                  💰 Estimated credit: ${(5.0 * (settings.operatingReserveParticipation / 100)).toFixed(2)}/MWh from OR market participation
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
