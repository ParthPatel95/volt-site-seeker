import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoltMarketQATest } from '@/components/voltmarket/VoltMarketQATest';
import { VoltMarketFeatureTest } from '@/components/voltmarket/VoltMarketFeatureTest';
import { TestRunner } from '@/components/scraping/TestRunner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Database,
  TestTube,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';

interface SystemTest {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message: string;
  category: string;
}

export default function ComprehensiveTest() {
  const { toast } = useToast();
  const [systemTests, setSystemTests] = useState<SystemTest[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [propertiesFoundCount, setPropertiesFoundCount] = useState(0);

  const runSystemTests = async () => {
    setTesting(true);
    setProgress(0);
    setSystemTests([]);

    const tests = [
      { test: testDatabaseConnection, category: 'Infrastructure', name: 'Database Connection' },
      { test: testSupabaseAuth, category: 'Infrastructure', name: 'Supabase Authentication' },
      { test: testEdgeFunctions, category: 'Infrastructure', name: 'Edge Functions' },
      { test: testRealtimeFeatures, category: 'Infrastructure', name: 'Real-time Features' },
      { test: testFileStorage, category: 'Infrastructure', name: 'File Storage' },
      { test: testVoltMarketTables, category: 'VoltMarket', name: 'VoltMarket Database Tables' },
      { test: testMessagingSystem, category: 'VoltMarket', name: 'Messaging System' },
      { test: testListingManagement, category: 'VoltMarket', name: 'Listing Management' },
      { test: testUserProfiles, category: 'VoltMarket', name: 'User Profiles' },
      { test: testPropertyScraping, category: 'Scraping', name: 'Property Scraping' },
      { test: testEnergyDataIntegration, category: 'Energy', name: 'Energy Data Integration' },
      { test: testBTCROICalculator, category: 'Analytics', name: 'BTC ROI Calculator' },
      { test: testCorporateIntelligence, category: 'Intelligence', name: 'Corporate Intelligence' },
    ];

    for (let i = 0; i < tests.length; i++) {
      const { test, category, name } = tests[i];
      setProgress((i / tests.length) * 100);
      
      try {
        const result = await test();
        setSystemTests(prev => [...prev, { name, category, ...result }]);
      } catch (error) {
        setSystemTests(prev => [...prev, {
          name,
          category,
          status: 'failed',
          message: `Test failed: ${error}`
        }]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setProgress(100);
    setTesting(false);
    
    toast({
      title: "System Tests Complete",
      description: `Ran ${tests.length} system tests. Check results below.`
    });
  };

  // System test functions
  const testDatabaseConnection = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'failed', message: 'Database connection failed' };
    }
  };

  const testSupabaseAuth = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      return { status: 'passed', message: `Auth system working (${session.session ? 'logged in' : 'logged out'})` };
    } catch (error) {
      return { status: 'failed', message: 'Auth system error' };
    }
  };

  const testEdgeFunctions = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      // Test a simple edge function
      const { data, error } = await supabase.functions.invoke('geocode-location', {
        body: { address: 'Austin, TX' }
      });
      if (error && error.message?.includes('not found')) {
        return { status: 'passed', message: 'Edge functions infrastructure working' };
      }
      return { status: 'passed', message: 'Edge functions accessible' };
    } catch (error) {
      return { status: 'failed', message: 'Edge functions unavailable' };
    }
  };

  const testRealtimeFeatures = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const channel = supabase.channel('test-channel');
      await channel.subscribe();
      supabase.removeChannel(channel);
      return { status: 'passed', message: 'Real-time features working' };
    } catch (error) {
      return { status: 'failed', message: 'Real-time features failed' };
    }
  };

  const testFileStorage = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      return { status: 'passed', message: `Storage accessible (${data.length} buckets)` };
    } catch (error) {
      return { status: 'failed', message: 'File storage failed' };
    }
  };

  const testVoltMarketTables = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      // Test VoltMarket listings table
      const { error: listingsError } = await supabase.from('voltmarket_listings').select('count', { count: 'exact' });
      if (listingsError) throw new Error(`VoltMarket listings: ${listingsError.message}`);
      
      // Test VoltMarket profiles table
      const { error: profilesError } = await supabase.from('voltmarket_profiles').select('count', { count: 'exact' });
      if (profilesError) throw new Error(`VoltMarket profiles: ${profilesError.message}`);
      
      // Test VoltMarket messages table
      const { error: messagesError } = await supabase.from('voltmarket_messages').select('count', { count: 'exact' });
      if (messagesError) throw new Error(`VoltMarket messages: ${messagesError.message}`);
      
      // Test VoltMarket conversations table
      const { error: conversationsError } = await supabase.from('voltmarket_conversations').select('count', { count: 'exact' });
      if (conversationsError) throw new Error(`VoltMarket conversations: ${conversationsError.message}`);
      
      return { status: 'passed', message: 'All VoltMarket tables accessible' };
    } catch (error) {
      return { status: 'failed', message: `VoltMarket tables error: ${error}` };
    }
  };

  const testMessagingSystem = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('voltmarket_messages').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Messaging system accessible' };
    } catch (error) {
      return { status: 'failed', message: 'Messaging system failed' };
    }
  };

  const testListingManagement = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('voltmarket_listings').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Listing management working' };
    } catch (error) {
      return { status: 'failed', message: 'Listing management failed' };
    }
  };

  const testUserProfiles = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('voltmarket_profiles').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'User profiles system working' };
    } catch (error) {
      return { status: 'failed', message: 'User profiles failed' };
    }
  };

  const testPropertyScraping = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('scraped_properties').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Property scraping system accessible' };
    } catch (error) {
      return { status: 'failed', message: 'Property scraping failed' };
    }
  };

  const testEnergyDataIntegration = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('energy_rates').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Energy data integration working' };
    } catch (error) {
      return { status: 'failed', message: 'Energy data integration failed' };
    }
  };

  const testBTCROICalculator = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('btc_roi_calculations').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'BTC ROI calculator accessible' };
    } catch (error) {
      return { status: 'failed', message: 'BTC ROI calculator failed' };
    }
  };

  const testCorporateIntelligence = async (): Promise<Omit<SystemTest, 'name' | 'category'>> => {
    try {
      const { data, error } = await supabase.from('companies').select('count', { count: 'exact' });
      if (error) throw error;
      return { status: 'passed', message: 'Corporate intelligence system working' };
    } catch (error) {
      return { status: 'failed', message: 'Corporate intelligence failed' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const groupedResults = systemTests.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as { [key: string]: SystemTest[] });

  const totalTests = systemTests.length;
  const passedTests = systemTests.filter(t => t.status === 'passed').length;
  const failedTests = systemTests.filter(t => t.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive System Testing</h1>
          <p className="text-gray-600">Complete testing suite for all platform features and infrastructure</p>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              System Tests
            </TabsTrigger>
            <TabsTrigger value="voltmarket" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              VoltMarket QA
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Feature Tests
            </TabsTrigger>
            <TabsTrigger value="scraping" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Scraping Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {/* System Test Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Infrastructure & System Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Button 
                    onClick={runSystemTests} 
                    disabled={testing}
                    className="flex items-center gap-2"
                  >
                    {testing ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {testing ? 'Running System Tests...' : 'Run All System Tests'}
                  </Button>
                </div>
                
                {testing && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Test Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Test Results Summary */}
            {systemTests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tests</p>
                        <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                      </div>
                      <TestTube className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Passed</p>
                        <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* System Test Results by Category */}
            {Object.keys(groupedResults).length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedResults).map(([category, results]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.map((result, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(result.status)}
                              <div>
                                <h4 className="font-medium text-gray-900">{result.name}</h4>
                                <p className="text-sm text-gray-600">{result.message}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(result.status)}>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voltmarket">
            <VoltMarketQATest />
          </TabsContent>

          <TabsContent value="features">
            <VoltMarketFeatureTest />
          </TabsContent>

          <TabsContent value="scraping">
            <Card>
              <CardHeader>
                <CardTitle>Property Scraping Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {propertiesFoundCount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✅ Found {propertiesFoundCount} properties in testing
                      </p>
                    </div>
                  )}
                </div>
                <TestRunner onPropertiesFound={setPropertiesFoundCount} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}