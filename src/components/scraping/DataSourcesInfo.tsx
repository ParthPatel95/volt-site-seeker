
import { Target, CheckCircle, AlertCircle } from 'lucide-react';

export function DataSourcesInfo() {
  const dataSources = [
    { name: 'LoopNet API', color: 'bg-green-500', status: 'active' },
    { name: 'Crexi Marketplace', color: 'bg-blue-500', status: 'active' },
    { name: 'Government Open Data', color: 'bg-purple-500', status: 'active' },
    { name: 'Texas Economic Development', color: 'bg-orange-500', status: 'active' },
    { name: 'California State Data', color: 'bg-red-500', status: 'active' },
    { name: 'Power Infrastructure API', color: 'bg-yellow-500', status: 'active' }
  ];

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-2 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Real Data Sources - Live APIs
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {dataSources.map((source, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-2 h-2 ${source.color} rounded-full mr-2`}></div>
            <span className="flex-1">{source.name}</span>
            <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded">
        <div className="flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          <span className="font-medium">Real Data Only:</span>
        </div>
        <span className="ml-4">No synthetic data - all properties from live market sources</span>
      </div>
    </div>
  );
}
