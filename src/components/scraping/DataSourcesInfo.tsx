
import { Target, CheckCircle, Globe, Search, Zap, Building } from 'lucide-react';

export function DataSourcesInfo() {
  const dataSources = [
    { name: 'LoopNet Commercial', color: 'bg-blue-500', status: 'active', coverage: 'US & Canada', type: 'Commercial RE' },
    { name: 'Crexi Marketplace', color: 'bg-purple-500', status: 'active', coverage: 'United States', type: 'Commercial RE' },
    { name: 'Showcase Properties', color: 'bg-green-500', status: 'active', coverage: 'US Commercial', type: 'Commercial RE' },
    { name: 'CommercialCafe', color: 'bg-orange-500', status: 'active', coverage: 'US Markets', type: 'Commercial RE' },
    { name: 'Realtor.ca Commercial', color: 'bg-red-600', status: 'active', coverage: 'Canada', type: 'All Real Estate' },
    { name: 'CityFeet Commercial', color: 'bg-indigo-500', status: 'active', coverage: 'US Cities', type: 'Commercial Space' },
    { name: 'ROFO Properties', color: 'bg-cyan-500', status: 'active', coverage: 'US Markets', type: 'Commercial RE' },
    { name: 'RealtyLink', color: 'bg-emerald-500', status: 'active', coverage: 'Canada', type: 'Commercial RE' }
  ];

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-3 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Enhanced Multi-Source Real Data Discovery Network
      </h4>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-4">
        {dataSources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 ${source.color} rounded-full mr-2`}></div>
              <span className="flex-1 font-medium">{source.name}</span>
              <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <span className="text-xs">{source.type}</span>
              <span className="text-xs">•</span>
              <span className="text-xs">{source.coverage}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Search className="w-3 h-3 mr-1" />
            <span className="font-medium">Intelligent Web Discovery:</span>
          </div>
          <span className="ml-4">Advanced algorithms search across 8+ major platforms simultaneously</span>
        </div>
        
        <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Zap className="w-3 h-3 mr-1" />
            <span className="font-medium">Power Infrastructure Focus:</span>
          </div>
          <span className="ml-4">Specialized filtering for high-capacity electrical and transmission access</span>
        </div>
        
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Building className="w-3 h-3 mr-1" />
            <span className="font-medium">Real-Time Market Data:</span>
          </div>
          <span className="ml-4">Live property listings with verified contact information and pricing</span>
        </div>
        
        <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Globe className="w-3 h-3 mr-1" />
            <span className="font-medium">Geographic Coverage:</span>
          </div>
          <span className="ml-4">Complete North American coverage - US states and Canadian provinces</span>
        </div>
      </div>
    </div>
  );
}
