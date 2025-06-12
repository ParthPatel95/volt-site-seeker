
import { DataCollection } from './DataCollection';
import { AlertsSystem } from './AlertsSystem';

export function DataManagement() {
  return (
    <div className="h-screen overflow-y-auto bg-background p-6 space-y-8">
      <DataCollection />
      <AlertsSystem />
    </div>
  );
}
