import React from 'react';
import { TelegramAlertSettings } from './TelegramAlertSettings';

/**
 * Unified Notifications Panel - wraps existing Telegram Alert system
 * into the Analytics tab for easy access alongside other analytics.
 */
export function NotificationsPanel() {
  return (
    <div className="space-y-4">
      <TelegramAlertSettings />
    </div>
  );
}
