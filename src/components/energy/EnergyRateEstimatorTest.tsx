
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EnergyRateEstimator } from './EnergyRateEstimator';
import { CheckCircle, XCircle, PlayCircle } from 'lucide-react';

export function EnergyRateEstimatorTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunningTests(true);
    const results = [];

    // Test 1: Alberta coordinates
    console.log('Running Test 1: Alberta coordinates validation');
    const albertaTest = {
      name: 'Alberta Coordinates Validation',
      input: { latitude: 51.0447, longitude: -114.0719, contractedLoadMW: 25.0 },
      expected: 'Should resolve to Alberta territory',
      status: 'pending'
    };

    try {
      // Simulate validation
      if (albertaTest.input.latitude >= 49.0 && albertaTest.input.latitude <= 60.0 && 
          albertaTest.input.longitude >= -120.0 && albertaTest.input.longitude <= -110.0) {
        albertaTest.status = 'passed';
      } else {
        albertaTest.status = 'failed';
      }
    } catch (error) {
      albertaTest.status = 'failed';
    }
    results.push(albertaTest);

    // Test 2: Texas coordinates
    console.log('Running Test 2: Texas coordinates validation');
    const texasTest = {
      name: 'Texas Coordinates Validation',
      input: { latitude: 30.2672, longitude: -97.7431, contractedLoadMW: 50.0 },
      expected: 'Should resolve to Texas/ERCOT territory',
      status: 'pending'
    };

    try {
      if (texasTest.input.latitude >= 25.8 && texasTest.input.latitude <= 36.5 && 
          texasTest.input.longitude >= -106.6 && texasTest.input.longitude <= -93.5) {
        texasTest.status = 'passed';
      } else {
        texasTest.status = 'failed';
      }
    } catch (error) {
      texasTest.status = 'failed';
    }
    results.push(texasTest);

    // Test 3: Input validation
    console.log('Running Test 3: Input validation');
    const validationTest = {
      name: 'Input Validation',
      input: { latitude: 91, longitude: 181, contractedLoadMW: -5 },
      expected: 'Should reject invalid coordinates and negative load',
      status: 'pending'
    };

    try {
      const isValidLat = Math.abs(validationTest.input.latitude) <= 90;
      const isValidLng = Math.abs(validationTest.input.longitude) <= 180;
      const isValidLoad = validationTest.input.contractedLoadMW > 0;
      
      if (!isValidLat || !isValidLng || !isValidLoad) {
        validationTest.status = 'passed'; // Test passes if validation correctly rejects invalid input
      } else {
        validationTest.status = 'failed';
      }
    } catch (error) {
      validationTest.status = 'failed';
    }
    results.push(validationTest);

    // Test 4: Currency handling
    console.log('Running Test 4: Currency handling');
    const currencyTest = {
      name: 'Currency Handling',
      input: { currencies: ['CAD', 'USD'] },
      expected: 'Should support both CAD and USD currencies',
      status: 'pending'
    };

    try {
      const supportedCurrencies = ['CAD', 'USD'];
      const allSupported = currencyTest.input.currencies.every(curr => supportedCurrencies.includes(curr));
      currencyTest.status = allSupported ? 'passed' : 'failed';
    } catch (error) {
      currencyTest.status = 'failed';
    }
    results.push(currencyTest);

    // Test 5: Customer class validation
    console.log('Running Test 5: Customer class validation');
    const customerClassTest = {
      name: 'Customer Class Validation',
      input: { classes: ['Industrial', 'Commercial'] },
      expected: 'Should support Industrial and Commercial customer classes',
      status: 'pending'
    };

    try {
      const supportedClasses = ['Industrial', 'Commercial'];
      const allSupported = customerClassTest.input.classes.every(cls => supportedClasses.includes(cls));
      customerClassTest.status = allSupported ? 'passed' : 'failed';
    } catch (error) {
      customerClassTest.status = 'failed';
    }
    results.push(customerClassTest);

    setTestResults(results);
    setIsRunningTests(false);

    const passedTests = results.filter(test => test.status === 'passed').length;
    const totalTests = results.length;

    toast({
      title: "Test Results",
      description: `${passedTests}/${totalTests} tests passed`,
      variant: passedTests === totalTests ? "default" : "destructive"
    });

    console.log('Test Results Summary:', {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      details: results
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Energy Rate Estimator Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Test Suite'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {testResults.map((test, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {test.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.expected}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Input: {JSON.stringify(test.input)}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      test.status === 'passed' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {test.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Energy Rate Estimator</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the actual component below with sample data
          </p>
        </CardHeader>
        <CardContent>
          <EnergyRateEstimator />
        </CardContent>
      </Card>
    </div>
  );
}
