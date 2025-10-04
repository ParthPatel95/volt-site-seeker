import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Configure branding, security, and sharing preferences
        </p>
      </div>

      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <SettingsIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Settings coming soon</h3>
            <p className="text-muted-foreground max-w-md">
              Configuration options for branding, watermarks, and security settings will be available here
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
