
import { Target } from 'lucide-react';

export function DataSourcesInfo() {
  const dataSources = [
    { name: 'RentSpree API', color: 'bg-green-500' },
    { name: 'Government Open Data', color: 'bg-blue-500' },
    { name: 'RSS Feeds', color: 'bg-orange-500' },
    { name: 'Advanced Scraping', color: 'bg-purple-500' },
    { name: 'Rentals.com API', color: 'bg-red-500' },
    { name: 'Market Intelligence', color: 'bg-yellow-500' }
  ];

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-2 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Real Data Sources
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {dataSources.map((source, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-2 h-2 ${source.color} rounded-full mr-2`}></div>
            <span>{source.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
