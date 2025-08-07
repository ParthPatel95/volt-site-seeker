import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DataSourceBadgeProps {
  pricingSource?: string;
  loadSource?: string;
  mixSource?: string;
  className?: string;
}

const abbreviate = (s?: string) => {
  if (!s) return 'unknown';
  const map: Record<string, string> = {
    fallback: 'fallback',
    aeso_csd: 'csd',
    aeso_api: 'api',
    ercot_lmp: 'lmp',
    ercot_lmp_hubavg: 'lmp(hub)',
    ercot_load_html: 'load',
    ercot_api: 'api',
  };
  return map[s] ?? s;
};

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  pricingSource,
  loadSource,
  mixSource,
  className = '',
}) => {
  const title = `pricing: ${pricingSource || 'unknown'}, load: ${loadSource || 'unknown'}, mix: ${mixSource || 'unknown'}`;
  return (
    <Badge
      variant="outline"
      className={`bg-muted text-muted-foreground border-border ${className}`}
      title={title}
      aria-label={`Data sources - ${title}`}
    >
      Data: P {abbreviate(pricingSource)} • L {abbreviate(loadSource)} • M {abbreviate(mixSource)}
    </Badge>
  );
};

export default DataSourceBadge;
