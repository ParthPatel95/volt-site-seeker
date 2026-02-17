import { AESOAlertsPanel } from '@/components/intelligence/AESOAlertsPanel';
import { AESOOutagesPanel } from '@/components/intelligence/AESOOutagesPanel';

interface OutagesAlertsTabProps {
  alerts: any;
  assetOutages: any;
  loading: boolean;
  onDismissAlert: (id: string) => void;
  onClearAll: () => void;
}

export function OutagesAlertsTab({ alerts, assetOutages, loading, onDismissAlert, onClearAll }: OutagesAlertsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <AESOAlertsPanel
          alerts={alerts}
          onDismissAlert={onDismissAlert}
          onClearAll={onClearAll}
        />
      </div>
      <div>
        <AESOOutagesPanel
          assetOutages={assetOutages}
          loading={loading}
        />
      </div>
    </div>
  );
}
