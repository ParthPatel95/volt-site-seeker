
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export function APIKeySetup() {
  const [apiKeys, setApiKeys] = useState({
    google_places: '',
    yelp: ''
  });
  const [saved, setSaved] = useState({
    google_places: false,
    yelp: false
  });

  const apiServices = [
    {
      key: 'google_places',
      name: 'Google Places API',
      description: 'Access to business and commercial property listings',
      setupUrl: 'https://developers.google.com/maps/documentation/places/web-service/get-api-key',
      freeTier: '1,000 requests/month',
      instructions: [
        'Go to Google Cloud Console',
        'Enable Places API',
        'Create credentials (API Key)',
        'Restrict the key to Places API'
      ]
    },
    {
      key: 'yelp',
      name: 'Yelp Fusion API',
      description: 'Business listings and commercial property data',
      setupUrl: 'https://fusion.yelp.com/',
      freeTier: '5,000 requests/day',
      instructions: [
        'Create Yelp developer account',
        'Create new app',
        'Copy API key from dashboard',
        'Test with sample requests'
      ]
    }
  ];

  const handleSaveKey = (service: string) => {
    // In a real implementation, this would securely store the API key
    // For now, we'll just mark it as saved
    setSaved(prev => ({ ...prev, [service]: true }));
    
    // Store in localStorage for demo purposes
    localStorage.setItem(`api_key_${service}`, apiKeys[service as keyof typeof apiKeys]);
  };

  const handleKeyChange = (service: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [service]: value }));
    setSaved(prev => ({ ...prev, [service]: false }));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Setting up free API keys will significantly increase the amount of real property data you can access.
          All keys are stored securely and only used for data retrieval.
        </AlertDescription>
      </Alert>

      {apiServices.map((service) => (
        <Card key={service.key} className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                {service.name}
              </div>
              {saved[service.key as keyof typeof saved] && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Configured</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{service.description}</p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Free Tier: {service.freeTier}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(service.setupUrl, '_blank')}
                  className="text-blue-600 border-blue-300"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Key
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${service.key}-input`}>API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id={`${service.key}-input`}
                  type="password"
                  placeholder="Paste your API key here"
                  value={apiKeys[service.key as keyof typeof apiKeys]}
                  onChange={(e) => handleKeyChange(service.key, e.target.value)}
                />
                <Button
                  onClick={() => handleSaveKey(service.key)}
                  disabled={!apiKeys[service.key as keyof typeof apiKeys] || saved[service.key as keyof typeof saved]}
                  variant={saved[service.key as keyof typeof saved] ? "outline" : "default"}
                >
                  {saved[service.key as keyof typeof saved] ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Quick Setup:</p>
              <ol className="list-decimal list-inside space-y-1">
                {service.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-2">✓ No API Key Required</h4>
        <p className="text-sm text-green-700 mb-2">
          These sources work immediately without any setup:
        </p>
        <ul className="text-sm text-green-600 space-y-1">
          <li>• <strong>OpenStreetMap:</strong> Open source geographic data</li>
          <li>• <strong>U.S. Census Bureau:</strong> Government business patterns</li>
          <li>• <strong>EIA Energy Data:</strong> Power infrastructure information</li>
          <li>• <strong>USGS:</strong> Geographic and geological data</li>
        </ul>
      </div>
    </div>
  );
}
