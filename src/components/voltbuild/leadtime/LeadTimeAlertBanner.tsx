import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { MilestoneWithRisk } from '../types/voltbuild-advanced.types';
import { parseISO, differenceInDays, addDays } from 'date-fns';

interface LeadTimeAlertBannerProps {
  milestones: MilestoneWithRisk[];
  targetRfsDate: string | null;
  startDate: Date;
}

export function LeadTimeAlertBanner({
  milestones,
  targetRfsDate,
  startDate,
}: LeadTimeAlertBannerProps) {
  if (!targetRfsDate || milestones.length === 0) {
    return null;
  }

  // Calculate latest completion date
  const maxEndDay = Math.max(...milestones.map((m) => m.endDay));
  const projectedEndDate = addDays(startDate, maxEndDay);
  const targetDate = parseISO(targetRfsDate);
  const daysOverTarget = differenceInDays(projectedEndDate, targetDate);

  const hasHighRisk = milestones.some((m) => m.riskLevel === 'high');

  if (daysOverTarget <= 0 && !hasHighRisk) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Clock className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Schedule On Track</AlertTitle>
        <AlertDescription className="text-green-600">
          Projected completion is within target RFS date with{' '}
          {Math.abs(daysOverTarget)} days buffer.
        </AlertDescription>
      </Alert>
    );
  }

  if (daysOverTarget > 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Schedule Risk: Target RFS at Risk</AlertTitle>
        <AlertDescription>
          Projected completion exceeds target RFS by{' '}
          <strong>{daysOverTarget} days</strong>. Consider accelerating critical
          path milestones or adjusting the target date.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasHighRisk) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">High Risk Milestones Detected</AlertTitle>
        <AlertDescription className="text-amber-600">
          One or more milestones have been flagged as high risk. Review the risk
          panel for details and recommended mitigations.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
