
import { Globe, Database, AlertTriangle } from 'lucide-react';

export function EducationalNotices() {
  return (
    <>
      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Globe className="w-4 h-4 text-blue-600 mr-2" />
          <span className="font-medium text-blue-800">Web Scraping Tool</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Demonstrates web scraping techniques for property discovery</p>
          <p>• Includes user-agent rotation and rate limiting</p>
          <p>• Simulates realistic property data extraction</p>
          <p>• Respects server resources with built-in delays</p>
        </div>
      </div>

      {/* Technical Features */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center mb-2">
          <Database className="w-4 h-4 text-gray-600 mr-2" />
          <span className="font-medium text-gray-800">Technical Features</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>✓ Anti-bot detection circumvention</p>
          <p>✓ Dynamic content handling</p>
          <p>✓ Multiple parsing strategies</p>
          <p>✓ Error recovery and retry logic</p>
          <p>✓ Property data normalization</p>
        </div>
      </div>
    </>
  );
}
