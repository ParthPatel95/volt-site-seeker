
import { Target, CheckCircle, AlertCircle, Zap, Building, Database } from 'lucide-react';

export function DataSourcesInfo() {
  const realDataSources = [
    { name: 'ERCOT Interconnection Queue', color: 'bg-blue-500', status: 'active', coverage: 'Texas Grid', type: 'Utility Data' },
    { name: 'PJM Generation Queue', color: 'bg-purple-500', status: 'active', coverage: 'Eastern US', type: 'Utility Data' },
    { name: 'CAISO Interconnection Studies', color: 'bg-green-500', status: 'active', coverage: 'California', type: 'Utility Data' },
    { name: 'Harris County Property Records', color: 'bg-orange-500', status: 'integration', coverage: 'Houston Area', type: 'Government Data' },
    { name: 'Los Angeles County Assessor', color: 'bg-red-600', status: 'integration', coverage: 'LA County', type: 'Government Data' },
    { name: 'Cook County Property Data', color: 'bg-indigo-500', status: 'integration', coverage: 'Chicago Area', type: 'Government Data' },
    { name: 'FERC Energy Infrastructure', color: 'bg-cyan-500', status: 'development', coverage: 'US Federal', type: 'Regulatory Data' },
    { name: 'EIA Power Plant Database', color: 'bg-emerald-500', status: 'active', coverage: 'US Federal', type: 'Energy Data' }
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
        Real Data Sources - Official Utility & Government Databases
      </h4>
      
      <div className="grid grid-cols-1 gap-2 text-xs mb-4">
        {realDataSources.map((source, index) => (
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
            <span className="font-medium">Utility Interconnection Queues:</span>
          </div>
          <span className="ml-4">Live data from ERCOT, PJM, and CAISO showing actual power project requests</span>
        </div>
        
        <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Database className="w-3 h-3 mr-1" />
            <span className="font-medium">Government Property Records:</span>
          </div>
          <span className="ml-4">County assessor and municipal databases with verified property information</span>
        </div>
        
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <Building className="w-3 h-3 mr-1" />
            <span className="font-medium">Regulatory Data Sources:</span>
          </div>
          <span className="ml-4">FERC and EIA databases tracking energy infrastructure and compliance</span>
        </div>
        
        <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
          <div className="flex items-center mb-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span className="font-medium">Data Availability Notice:</span>
          </div>
          <span className="ml-4">Results depend on public data availability and API access permissions</span>
        </div>
      </div>
    </div>
  );
}
