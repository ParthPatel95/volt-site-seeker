
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { IdleIndustryScanner } from '@/components/power/IdleIndustryScanner';

export function IdleIndustryScannerWrapper() {
  return (
    <AppLayout>
      <IdleIndustryScanner />
    </AppLayout>
  );
}
