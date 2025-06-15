
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertConfigurationPanel } from './AlertConfigurationPanel';
import { DistressAlertsPanel } from './DistressAlertsPanel';
import { IndustryIntelligencePanel } from './IndustryIntelligencePanel';
import { DistressAlert } from '@/types/corporateIntelligence';

interface SettingsTabProps {
  distressAlerts: DistressAlert[];
  onInvestigateAlert: (alert: DistressAlert) => void;
}

export function SettingsTab({ distressAlerts, onInvestigateAlert }: SettingsTabProps) {
  return (
    <Tabs defaultValue="alerts" className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 min-w-max sm:min-w-0">
          <TabsTrigger value="alerts" className="text-xs sm:text-sm">Alert Configuration</TabsTrigger>
          <TabsTrigger value="distress" className="text-xs sm:text-sm">Distress Alerts</TabsTrigger>
          <TabsTrigger value="industry" className="text-xs sm:text-sm">Industry Intel</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="alerts">
        <AlertConfigurationPanel />
      </TabsContent>
      <TabsContent value="distress">
        <DistressAlertsPanel 
          alerts={distressAlerts} 
          onInvestigate={onInvestigateAlert}
        />
      </TabsContent>
      <TabsContent value="industry">
        <IndustryIntelligencePanel />
      </TabsContent>
    </Tabs>
  );
}
