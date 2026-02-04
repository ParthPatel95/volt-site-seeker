import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Info, Calendar, CheckCircle2 } from 'lucide-react';

interface RateSourceBadgeProps {
  source: string;
  effectiveDate: string;
  sourceUrl?: string;
  lastVerified?: string;
  variant?: 'inline' | 'compact' | 'detailed';
  className?: string;
}

export function RateSourceBadge({
  source,
  effectiveDate,
  sourceUrl,
  lastVerified,
  variant = 'compact',
  className = '',
}: RateSourceBadgeProps) {
  const formattedDate = new Date(effectiveDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  if (variant === 'inline') {
    return (
      <span className={`text-xs text-muted-foreground ${className}`}>
        (effective {formattedDate})
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`text-xs bg-muted/50 text-muted-foreground border-border hover:bg-muted cursor-help ${className}`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formattedDate}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium text-sm">{source}</p>
              <p className="text-xs text-muted-foreground">Effective: {effectiveDate}</p>
              {lastVerified && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Verified: {lastVerified}
                </p>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // detailed variant
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border text-xs ${className}`}>
      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-muted-foreground">
          <strong className="text-foreground">{source}</strong>
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Effective {formattedDate}
        </span>
        {lastVerified && (
          <span className="text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Verified {lastVerified}
          </span>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            Source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// Preset badges for common rate sources
export function AESOTransmissionBadge({ variant = 'compact', className = '' }: { variant?: 'inline' | 'compact' | 'detailed'; className?: string }) {
  return (
    <RateSourceBadge
      source="AESO Rate DTS"
      effectiveDate="2026-01-01"
      sourceUrl="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/"
      lastVerified="2026-02-01"
      variant={variant}
      className={className}
    />
  );
}

export function FortisAlbertaRate65Badge({ variant = 'compact', className = '' }: { variant?: 'inline' | 'compact' | 'detailed'; className?: string }) {
  return (
    <RateSourceBadge
      source="FortisAlberta Rate 65"
      effectiveDate="2025-07-01"
      sourceUrl="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf"
      lastVerified="2026-02-01"
      variant={variant}
      className={className}
    />
  );
}
