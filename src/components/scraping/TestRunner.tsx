
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const testScenarios = [
  { location: 'Texas', type: 'industrial', description: 'Texas Industrial Properties' },
  { location: 'Dallas, TX', type: 'warehouse', description: 'Dallas Warehouse Facilities' },
  { location: 'Houston, TX', type: 'manufacturing', description: 'Houston Manufacturing Sites' },
  { location: 'Austin, TX', type: 'data_center', description: 'Austin Data Centers' },
];

interface TestRunnerProps {
  onPropertiesFound: (count: number) => void;
}

export function TestRunner({ onPropertiesFound }: TestRunnerProps) {
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const runTestScenario = async (scenario: typeof testScenarios[0]) => {
    console.log(`Running test scenario: ${scenario.description}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-property-scraper', {
        body: {
          location: scenario.location,
          property_type: scenario.type,
          sources: ['cbre'],
          budget_range: 'under_10m',
          power_requirements: 'high',
          test_mode: true
        }
      });

      console.log(`Test scenario "${scenario.description}" response:`, { data, error });

      if (error) {
        throw new Error(error.message || 'Test scenario failed');
      }

      return {
        scenario: scenario.description,
        success: data?.success || false,
        properties_found: data?.properties_found || 0,
        message: data?.message || 'No message',
        sources_used: data?.sources_used || []
      };

    } catch (error: any) {
      console.error(`Test scenario "${scenario.description}" failed:`, error);
      return {
        scenario: scenario.description,
        success: false,
        properties_found: 0,
        message: error.message || 'Test failed',
        sources_used: []
      };
    }
  };

  const handleRunTests = async () => {
    setTestRunning(true);
    setTestResults([]);
    
    toast({
      title: "Running Test Scenarios",
      description: "Testing scraper with multiple locations and property types...",
    });

    const results = [];
    
    for (const scenario of testScenarios) {
      const result = await runTestScenario(scenario);
      results.push(result);
      setTestResults([...results]);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const totalProperties = results.reduce((sum, r) => sum + r.properties_found, 0);
    const successfulTests = results.filter(r => r.success).length;
    
    toast({
      title: "Test Run Complete",
      description: `${successfulTests}/${results.length} tests successful. Found ${totalProperties} total properties.`,
      variant: successfulTests > 0 ? "default" : "destructive"
    });
    
    if (totalProperties > 0) {
      onPropertiesFound(totalProperties);
    }
    
    setTestRunning(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-medium text-blue-800">Test Runner</span>
        </div>
        <Button 
          onClick={handleRunTests}
          disabled={testRunning}
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {testRunning ? 'Running Tests...' : 'Run Test Scenarios'}
        </Button>
      </div>
      
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-blue-800">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="text-sm bg-white rounded p-2 border">
              <div className="flex justify-between items-center">
                <span className="font-medium">{result.scenario}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <div className="text-gray-600 mt-1">
                Properties: {result.properties_found} | {result.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
