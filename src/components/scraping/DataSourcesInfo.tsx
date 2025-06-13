
import { Target, CheckCircle } from 'lucide-react';

export function DataSourcesInfo() {
  const dataSources = [
    { name: 'RealtyMole API', color: 'bg-green-500', status: 'active', coverage: 'US & Canada' },
    { name: 'RentSpree API', color: 'bg-blue-500', status: 'active', coverage: 'United States' },
    { name: 'Canadian MLS Data', color: 'bg-red-500', status: 'active', coverage: 'Canada' },
    { name: 'US Government GSA', color: 'bg-purple-500', status: 'active', coverage: 'United States' },
    { name: 'Canadian Open Data', color: 'bg-orange-500', status: 'active', coverage: 'Canada' },
    { name: 'Power Infrastructure APIs', color: 'bg-yellow-500', status: 'active', coverage: 'North America' }
  ];

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-2 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Real Data Sources - USA & Canada Coverage
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
      <div className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded">
        <div className="flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          <span className="font-medium">North America Coverage:</span>
        </div>
        <span className="ml-4">Real property data from USA and Canada - no synthetic results</span>
      </div>
    </div>
  );
}
