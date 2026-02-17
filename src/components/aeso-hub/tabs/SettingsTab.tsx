import { TelegramAlertSettings } from '@/components/aeso/TelegramAlertSettings';

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure alerts and notification preferences</p>
      </div>
      <div className="max-w-2xl">
        <TelegramAlertSettings />
      </div>
    </div>
  );
}
