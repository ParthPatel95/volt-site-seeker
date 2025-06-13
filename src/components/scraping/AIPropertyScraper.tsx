
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertySearchForm, type SearchParams } from './PropertySearchForm';
import { DataSourcesInfo } from './DataSourcesInfo';

interface AIPropertyScraperProps {
  onPropertiesFound: (count: number) => void;
}

interface QATestResult {
  status: 'PASSED' | 'FAILED' | 'NO_RESULTS_FOUND';
  propertiesFound: number;
  sources: string[];
  errors?: string[];
}

export function AIPropertyScraper({ onPropertiesFound }: AIPropertyScraperProps) {
  const [scraping, setScraping] = useState(false);
  const [qaTestResult, setQaTestResult] = useState<QATestResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async (searchParams: SearchParams) => {
    setScraping(true);
    setQaTestResult(null);
    
    try {
      console.log('=== FRONTEND QA TEST STARTING ===');
      console.log('Search parameters:', searchParams);
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('=== EDGE FUNCTION RESPONSE ===');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to search for properties');
      }

      // Update QA test result
      const qaResult: QATestResult = {
        status: data?.qa_test_status || 'FAILED',
        propertiesFound: data?.properties_found || 0,
        sources: data?.data_sources_used || [],
        errors: data?.debug_info?.errors
      };
      setQaTestResult(qaResult);

      if (data?.success && data?.properties_found > 0) {
        console.log('=== SUCCESS: Properties found ===');
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "✅ QA Test PASSED - Real Properties Found!",
          description: `Found ${data.properties_found} properties from ${data.data_sources_used?.length || 0} sources. Check the Scraped Properties tab.`,
        });
      } else {
        console.log('=== NO RESULTS FOUND ===');
        toast({
          title: "⚠️ QA Test: No Properties Found",
          description: data?.message || 'No properties found. Try a different location like "Texas" or "California".',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('=== QA TEST FAILED ===');
      console.error('Frontend error:', error);
      
      setQaTestResult({
        status: 'FAILED',
        propertiesFound: 0,
        sources: [],
        errors: [error.message]
      });
      
      toast({
        title: "❌ QA Test FAILED",
        description: error.message || "Property search failed. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  const getQAStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'NO_RESULTS_FOUND':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Brain className="w-5 h-5 text-blue-600" />;
    }
  };

  const getQAStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'FAILED':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'NO_RESULTS_FOUND':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <Brain className="w-5 h-5 mr-2" />
          AI Property Discovery - QA Testing Mode
        </CardTitle>
        <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span>Running comprehensive QA tests to ensure real property data retrieval</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PropertySearchForm 
          onSearch={handleSearch}
          isSearching={scraping}
        />

        {/* QA Test Results */}
        {qaTestResult && (
          <Card className={`${getQAStatusColor(qaTestResult.status)} border-2`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                {getQAStatusIcon(qaTestResult.status)}
                <h3 className="font-semibold">QA Test Result: {qaTestResult.status}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Properties Found:</strong> {qaTestResult.propertiesFound}
                </div>
                <div>
                  <strong>Data Sources:</strong> {qaTestResult.sources.join(', ') || 'None'}
                </div>
                {qaTestResult.errors && qaTestResult.errors.length > 0 && (
                  <div>
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {qaTestResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {qaTestResult.status === 'PASSED' && (
                <div className="mt-3 p-2 bg-green-100 rounded">
                  ✅ QA Test passed! Real properties were successfully found and stored.
                </div>
              )}
              
              {qaTestResult.status === 'FAILED' && (
                <div className="mt-3 p-2 bg-red-100 rounded">
                  ❌ QA Test failed! Check the console logs for detailed error information.
                </div>
              )}
              
              {qaTestResult.status === 'NO_RESULTS_FOUND' && (
                <div className="mt-3 p-2 bg-yellow-100 rounded">
                  ⚠️ No properties found for this search. Try different search terms.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <DataSourcesInfo />
      </CardContent>
    </Card>
  );
}
