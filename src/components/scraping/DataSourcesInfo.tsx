
import { Target, CheckCircle, AlertCircle, Zap, Building, Database } from 'lucide-react';

export function DataSourcesInfo() {
  const realEstateSources = [
    { name: 'Zillow Commercial', color: 'bg-blue-500', status: 'active', coverage: 'National', type: 'Commercial Real Estate' },
    { name: 'Realtor.com Commercial', color: 'bg-purple-500', status: 'active', coverage: 'National', type: 'MLS Data' },
    { name: 'CREXI', color: 'bg-green-500', status: 'active', coverage: 'National', type: 'Commercial Platform' },
    { name: 'Ten-X Auctions', color: 'bg-orange-500', status: 'active', coverage: 'National', type: 'Auction Platform' },
    { name: 'DistressedPro', color: 'bg-red-600', status: 'integration', coverage: 'National', type: 'Distressed Assets' },
    { name: 'CommercialSearch', color: 'bg-indigo-500', status: 'active', coverage: 'Regional', type: 'Broker Network' },
    { name: 'Showcase.com', color: 'bg-cyan-500', status: 'active', coverage: 'National', type: 'Commercial Listings' },
    { name: 'CityFeet', color: 'bg-emerald-500', status: 'integration', coverage: 'Urban Markets', type: 'Commercial Space' },
    { name: 'Catylist', color: 'bg-yellow-500', status: 'active', coverage: 'National', type: 'Industrial Focus' },
    { name: 'OfficeSpace.com', color: 'bg-pink-500', status: 'integration', coverage: 'Major Cities', type: 'Office & Industrial' },
    { name: 'Squared Away', color: 'bg-teal-500', status: 'active', coverage: 'Southwest', type: 'Regional Specialist' },
    { name: 'PropertyShark', color: 'bg-gray-500', status: 'development', coverage: 'Major Markets', type: 'Property Data' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'integration':
        return <AlertCircle className="w-3 h-3 text-yellow-600" />;
      case 'development':
        return <AlertCircle className="w-3 h-3 text-orange-600" />;
      default:
        return <CheckCircle className="w-3 h-3 text-green-600" />;
    }
  };

  return (
    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
      <h4 className="font-medium text-green-800 mb-3 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Real Estate Data Sources - Top Commercial Property Platforms
      </h4>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-4 max-h-48 overflow-y-auto">
        {realEstateSources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 ${source.color} rounded-full mr-2`}></div>
              <span className="flex-1 font-medium">{source.name}</span>
              {getStatusIcon(source.status)}
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
            <Zap className="w-3 h-3 mr-1" />
            <span className="font-medium">Commercial Real Estate Platforms:</span>
          </div>
          <span className="ml-4">Live data from major commercial property listing services and MLS databases</span>
        </div>
        
        <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Database className="w-3 h-3 mr-1" />
            <span className="font-medium">Industrial & Power-Ready Properties:</span>
          </div>
          <span className="ml-4">Specialized platforms focusing on industrial spaces with high power capacity</span>
        </div>
        
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Building className="w-3 h-3 mr-1" />
            <span className="font-medium">Auction & Distressed Assets:</span>
          </div>
          <span className="ml-4">Access to foreclosure, bankruptcy, and auction properties with development potential</span>
        </div>
        
        <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span className="font-medium">Data Quality Notice:</span>
          </div>
          <span className="ml-4">All data sourced from legitimate real estate platforms - no synthetic or fake listings</span>
        </div>
      </div>
    </div>
  );
}
