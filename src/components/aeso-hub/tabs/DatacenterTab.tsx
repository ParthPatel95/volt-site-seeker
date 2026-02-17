import { DatacenterControlCenter } from '@/components/datacenter';

interface DatacenterTabProps {
  currentPrice: number;
}

export function DatacenterTab({ currentPrice }: DatacenterTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <DatacenterControlCenter currentPrice={currentPrice} />
    </div>
  );
}
