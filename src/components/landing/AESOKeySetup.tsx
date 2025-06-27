
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export function AESOKeySetup() {
  const [apiKeys, setApiKeys] = useState({
    primary: '',
    subscription: ''
  });
  const [saved, setSaved] = useState({
    primary: false,
    subscription: false
  });

  const apiKeyDetails = [
    {
      key: 'primary',
      name: 'AESO Primary API Key',
      description: 'Primary authentication key for AESO API access',
      placeholder: 'Enter your AESO primary API key',
      envVar: 'AESO_API_KEY'
    },
    {
      key: 'subscription',
      name: 'AESO Subscription Key',
      description: 'Subscription key for AESO Pool Price API access',
      placeholder: 'Enter your AESO subscription key',
      envVar: 'AESO_SUB_KEY'
    }
  ];

  const handleSaveKey = (keyType: string) => {
    // In a real implementation, this would securely store the API key
    // For now, we'll just mark it as saved
    setSaved(prev => ({ ...prev, [keyType]: true }));
    
    // Store in localStorage for demo purposes
    const envVar = keyType === 'primary' ? 'AESO_API_KEY' : 'AESO_SUB_KEY';
    localStorage.setItem(`api_key_${envVar}`, apiKeys[keyType as keyof typeof apiKeys]);
  };

  const handleKeyChange = (keyType: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [keyType]: value }));
    setSaved(prev => ({ ...prev, [keyType]: false }));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need both a primary API key and a subscription key to access live AESO market data.
          Both keys are provided when you register for AESO API access.
        </AlertDescription>
      </Alert>

      {apiKeyDetails.map((keyDetail) => (
        <Card key={keyDetail.key} className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                {keyDetail.name}
              </div>
              {saved[keyDetail.key as keyof typeof saved] && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Configured</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{keyDetail.description}</p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Environment Variable: {keyDetail.envVar}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.aeso.ca/aeso/api-access/', '_blank')}
                  className="text-blue-600 border-blue-300"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Keys
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${keyDetail.key}-input`}>API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id={`${keyDetail.key}-input`}
                  type="password"
                  placeholder={keyDetail.placeholder}
                  value={apiKeys[keyDetail.key as keyof typeof apiKeys]}
                  onChange={(e) => handleKeyChange(keyDetail.key, e.target.value)}
                />
                <Button
                  onClick={() => handleSaveKey(keyDetail.key)}
                  disabled={!apiKeys[keyDetail.key as keyof typeof apiKeys] || saved[keyDetail.key as keyof typeof saved]}
                  variant={saved[keyDetail.key as keyof typeof saved] ? "outline" : "default"}
                >
                  {saved[keyDetail.key as keyof typeof saved] ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-2">✓ Setup Instructions</h4>
        <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
          <li>Visit the AESO API Access page</li>
          <li>Register for an account or log in</li>
          <li>Subscribe to the Pool Price API</li>
          <li>Copy both your primary API key and subscription key</li>
          <li>Enter both keys in the forms above</li>
          <li>Save each key individually</li>
        </ol>
      </div>
    </div>
  );
}
</CardContent>
</Card>
