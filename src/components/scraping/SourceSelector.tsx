
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const brokerageSites = [
  { id: 'cbre', name: 'CBRE', description: 'Global commercial real estate' },
  { id: 'jll', name: 'JLL', description: 'Jones Lang LaSalle commercial properties' },
  { id: 'cushman-wakefield', name: 'Cushman & Wakefield', description: 'Commercial real estate services' },
  { id: 'colliers', name: 'Colliers', description: 'Global commercial real estate' },
  { id: 'marcus-millichap', name: 'Marcus & Millichap', description: 'Investment property specialists' },
];

interface SourceSelectorProps {
  selectedSources: string[];
  onSourceToggle: (sourceId: string) => void;
}

export function SourceSelector({ selectedSources, onSourceToggle }: SourceSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Select Brokerage Sites to Scrape</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brokerageSites.map((site) => (
          <div key={site.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
            <Checkbox
              id={site.id}
              checked={selectedSources.includes(site.id)}
              onCheckedChange={() => onSourceToggle(site.id)}
            />
            <div className="flex-1 min-w-0">
              <label htmlFor={site.id} className="font-medium text-sm cursor-pointer">
                {site.name}
              </label>
              <p className="text-xs text-gray-500 mt-1">{site.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
