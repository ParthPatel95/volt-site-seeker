
import { Target, CheckCircle, Globe, Search } from 'lucide-react';

export function DataSourcesInfo() {
  const dataSources = [
    { name: 'Google Search - Multi-Platform', color: 'bg-red-500', status: 'active', coverage: 'USA & Canada' },
    { name: 'LoopNet API', color: 'bg-blue-500', status: 'active', coverage: 'North America' },
    { name: 'Crexi Marketplace', color: 'bg-purple-500', status: 'active', coverage: 'United States' },
    { name: 'RealtyMole API', color: 'bg-green-500', status: 'active', coverage: 'US & Canada' },
    { name: 'Canadian MLS & Realtor.ca', color: 'bg-red-600', status: 'active', coverage: 'Canada' },
    { name: 'US Gov & Commercial DBs', color: 'bg-indigo-500', status: 'active', coverage: 'United States' }
  ];

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-2 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Enhanced Multi-Source Real Data Discovery
      </h4>
      <div className="grid grid-cols-1 gap-2 text-xs">
        {dataSources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 ${source.color} rounded-full mr-2`}></div>
              <span className="flex-1">{source.name}</span>
              <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
            </div>
            <span className="text-gray-500 text-xs">{source.coverage}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
          <div className="flex items-center">
            <Search className="w-3 h-3 mr-1" />
            <span className="font-medium">Google Search Integration:</span>
          </div>
          <span className="ml-4">Finds properties on LoopNet, Crexi, Commercial Cafe, Showcase & more</span>
        </div>
        
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          <div className="flex items-center">
            <Globe className="w-3 h-3 mr-1" />
            <span className="font-medium">Full Coverage:</span>
          </div>
          <span className="ml-4">All major US states and Canadian provinces - real data only</span>
        </div>
      </div>
    </div>
  );
}
