import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, AlertCircle, AlertTriangle, CircleSlash, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DataFreshnessTone = 'live' | 'stale' | 'outdated' | 'estimated' | 'unavailable';

export interface DataFreshnessBadgeProps {
  /** ISO timestamp / Date / null when the underlying data was last fetched live. */
  updatedAt?: string | number | Date | null;
  /**
   * Optional source label. If it ends with `_estimated` (e.g. `aeso_estimated`,
   * `spp_estimated`) the badge switches to "Estimated" regardless of freshness.
   */
  source?: string | null;
  /** Override the auto-detected tone. */
  tone?: DataFreshnessTone;
  /** Threshold in seconds for the green "Live" tone. Default 120 (2 minutes). */
  liveThresholdSec?: number;
  /** Threshold in seconds for the yellow "Stale" tone. Default 900 (15 minutes). */
  staleThresholdSec?: number;
  /** Compact (icon + age only) or default (icon + label + age). */
  size?: 'compact' | 'default';
  /** Optional human label override e.g. "Pool price" used in the tooltip. */
  label?: string;
  className?: string;
}

const TONE_STYLES: Record<DataFreshnessTone, { dot: string; text: string; bg: string; border: string }> = {
  live: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  stale: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  outdated: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  estimated: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  unavailable: {
    dot: 'bg-muted-foreground/40',
    text: 'text-muted-foreground',
    bg: 'bg-muted/40',
    border: 'border-border',
  },
};

const TONE_ICONS: Record<DataFreshnessTone, React.ComponentType<{ className?: string }>> = {
  live: Activity,
  stale: AlertCircle,
  outdated: AlertTriangle,
  estimated: FlaskConical,
  unavailable: CircleSlash,
};

const TONE_LABEL: Record<DataFreshnessTone, string> = {
  live: 'Live',
  stale: 'Stale',
  outdated: 'Outdated',
  estimated: 'Estimated',
  unavailable: 'No data',
};

function isEstimatedSource(source?: string | null): boolean {
  if (!source) return false;
  const s = source.toLowerCase();
  return s.endsWith('_estimated') || s === 'estimated' || s === 'synthetic' || s === 'mock';
}

function toMillis(updatedAt?: DataFreshnessBadgeProps['updatedAt']): number | null {
  if (updatedAt == null) return null;
  if (updatedAt instanceof Date) {
    const t = updatedAt.getTime();
    return Number.isFinite(t) ? t : null;
  }
  const t = typeof updatedAt === 'number' ? updatedAt : Date.parse(String(updatedAt));
  return Number.isFinite(t) ? t : null;
}

function formatAge(ageMs: number): string {
  if (ageMs < 0) return 'just now';
  const sec = Math.round(ageMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  return `${days}d ago`;
}

export function resolveTone(
  updatedAt: DataFreshnessBadgeProps['updatedAt'],
  source: string | null | undefined,
  liveThresholdSec: number,
  staleThresholdSec: number
): DataFreshnessTone {
  if (isEstimatedSource(source)) return 'estimated';
  const ts = toMillis(updatedAt);
  if (ts == null) return 'unavailable';
  const ageSec = (Date.now() - ts) / 1000;
  if (ageSec <= liveThresholdSec) return 'live';
  if (ageSec <= staleThresholdSec) return 'stale';
  return 'outdated';
}

export function DataFreshnessBadge({
  updatedAt,
  source,
  tone: toneOverride,
  liveThresholdSec = 120,
  staleThresholdSec = 900,
  size = 'default',
  label,
  className,
}: DataFreshnessBadgeProps) {
  const tone = toneOverride ?? resolveTone(updatedAt, source, liveThresholdSec, staleThresholdSec);
  const styles = TONE_STYLES[tone];
  const Icon = TONE_ICONS[tone];
  const ts = toMillis(updatedAt);
  const ageMs = ts == null ? null : Date.now() - ts;
  const ageLabel = ageMs != null ? formatAge(ageMs) : null;

  const tooltipLines: string[] = [];
  if (label) tooltipLines.push(label);
  tooltipLines.push(`Status: ${TONE_LABEL[tone]}`);
  if (ts != null) tooltipLines.push(`Last fetched: ${new Date(ts).toLocaleString()}`);
  if (source) tooltipLines.push(`Source: ${source}`);
  if (tone === 'estimated') {
    tooltipLines.push('Value is a fallback estimate, not a live measurement.');
  } else if (tone === 'unavailable') {
    tooltipLines.push('No live data is currently available.');
  } else if (tone === 'outdated' && ageLabel) {
    tooltipLines.push(`Data may not reflect current market conditions.`);
  }

  const inner = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 px-2 py-0.5 text-[10px] font-medium leading-none cursor-help',
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
      aria-label={`Data freshness: ${TONE_LABEL[tone]}${ageLabel ? `, ${ageLabel}` : ''}`}
    >
      <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
        {tone === 'live' && (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', styles.dot)} />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', styles.dot)} />
      </span>
      {size === 'default' && <Icon className="h-3 w-3" />}
      <span className="whitespace-nowrap">
        {size === 'default' ? TONE_LABEL[tone] : ''}
        {ageLabel && tone !== 'estimated' && tone !== 'unavailable' ? (
          <span className="ml-1 opacity-80">· {ageLabel}</span>
        ) : null}
      </span>
    </Badge>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-0.5 text-xs">
            {tooltipLines.map((line, i) => (
              <p key={i} className={i === 0 && label ? 'font-medium' : 'text-muted-foreground'}>
                {line}
              </p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
