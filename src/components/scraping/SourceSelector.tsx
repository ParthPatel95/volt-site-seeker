
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const brokerageSites = [
  // Major US Brokerages
  { id: 'cbre', name: 'CBRE', description: 'Global commercial real estate leader', country: 'USA' },
  { id: 'jll', name: 'JLL', description: 'Jones Lang LaSalle commercial properties', country: 'USA' },
  { id: 'cushman-wakefield', name: 'Cushman & Wakefield', description: 'Global commercial real estate services', country: 'USA' },
  { id: 'colliers', name: 'Colliers', description: 'Global commercial real estate', country: 'USA/Canada' },
  { id: 'marcus-millichap', name: 'Marcus & Millichap', description: 'Investment property specialists', country: 'USA' },
  { id: 'savills', name: 'Savills', description: 'International real estate advisor', country: 'USA/Canada' },
  { id: 'kidder-mathews', name: 'Kidder Mathews', description: 'Pacific Northwest commercial real estate', country: 'USA' },
  { id: 'transwestern', name: 'Transwestern', description: 'Commercial real estate services', country: 'USA' },
  { id: 'avison-young', name: 'Avison Young', description: 'Global commercial real estate', country: 'USA/Canada' },
  { id: 'newmark', name: 'Newmark', description: 'Commercial real estate advisory firm', country: 'USA' },
  { id: 'cresa', name: 'Cresa', description: 'Corporate real estate advisor', country: 'USA' },
  { id: 'stream-realty', name: 'Stream Realty', description: 'Full-service commercial real estate', country: 'USA' },
  { id: 'lee-associates', name: 'Lee & Associates', description: 'Commercial real estate brokerage', country: 'USA' },
  { id: 'hff', name: 'HFF (JLL)', description: 'Capital markets and investment sales', country: 'USA' },
  { id: 'eastdil-secured', name: 'Eastdil Secured', description: 'Real estate investment banking', country: 'USA' },
  
  // Regional US Brokerages
  { id: 'unico-properties', name: 'Unico Properties', description: 'Pacific Northwest real estate', country: 'USA' },
  { id: 'bradleycorp', name: 'Bradley Company', description: 'Southwest commercial real estate', country: 'USA' },
  { id: 'corfac', name: 'CORFAC International', description: 'Independent commercial real estate', country: 'USA' },
  { id: 'svn', name: 'SVN International', description: 'Shared value network brokerage', country: 'USA' },
  { id: 'matthews-real-estate', name: 'Matthews Real Estate', description: 'Investment sales and services', country: 'USA' },
  
  // Major Canadian Brokerages
  { id: 'colliers-canada', name: 'Colliers Canada', description: 'Leading Canadian commercial real estate', country: 'Canada' },
  { id: 'cbre-canada', name: 'CBRE Canada', description: 'CBRE Canadian operations', country: 'Canada' },
  { id: 'cushman-wakefield-canada', name: 'Cushman & Wakefield Canada', description: 'Canadian commercial real estate services', country: 'Canada' },
  { id: 'royal-lepage-commercial', name: 'Royal LePage Commercial', description: 'Canadian commercial real estate network', country: 'Canada' },
  { id: 'rew-commercial', name: 'REW Commercial', description: 'Western Canadian commercial real estate', country: 'Canada' },
  { id: 'industrial-alliance', name: 'Industrial Alliance', description: 'Quebec-based commercial real estate', country: 'Canada' },
  { id: 'century21-commercial', name: 'Century 21 Commercial', description: 'Commercial division of Century 21 Canada', country: 'Canada' },
  { id: 'remax-commercial', name: 'RE/MAX Commercial', description: 'Commercial division of RE/MAX Canada', country: 'Canada' },
  { id: 'macdonald-commercial', name: 'Macdonald Commercial', description: 'Western Canadian commercial specialists', country: 'Canada' },
  { id: 'prairie-commercial', name: 'Prairie Commercial', description: 'Prairie provinces commercial real estate', country: 'Canada' },
];

interface SourceSelectorProps {
  selectedSources: string[];
  onSourceToggle: (sourceId: string) => void;
}

export function SourceSelector({ selectedSources, onSourceToggle }: SourceSelectorProps) {
  const usaBrokerages = brokerageSites.filter(site => site.country.includes('USA'));
  const canadaBrokerages = brokerageSites.filter(site => site.country === 'Canada' || site.country === 'USA/Canada');

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select Brokerage Sites to Scrape ({brokerageSites.length} Available)</Label>
      
      {/* USA Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-1">
          United States ({usaBrokerages.length} brokerages)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {usaBrokerages.map((site) => (
            <div key={site.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
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

      {/* Canada Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-red-700 border-b border-red-200 pb-1">
          Canada ({canadaBrokerages.length} brokerages)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {canadaBrokerages.map((site) => (
            <div key={site.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                  🇨🇦 Canada
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
