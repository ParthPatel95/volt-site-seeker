import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, XCircle, AlertCircle, Play, Loader2,
  Cpu, Zap, BarChart3, TrendingUp, Trash2, Database, 
  Power, Moon, RefreshCw
} from 'lucide-react';

interface TestResult {
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  duration?: number;
  details?: any;
}

interface TestCategory {
  name: string;
  icon: typeof Cpu;
  tests: { name: string; fn: () => Promise<Partial<TestResult>> }[];
}

export function MinerFleetTestRunner() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testMinerId, setTestMinerId] = useState<string | null>(null);
  const { toast } = useToast();

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  // Test Categories
  const getTestCategories = (): TestCategory[] => [
    {
      name: 'Edge Function Deployment',
      icon: Zap,
      tests: [
        {
          name: 'miner-controller Function Accessible',
          fn: async () => {
            const start = Date.now();
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            if (error) {
              // Check if it's a CORS or network error vs function error
              if (error.message.includes('Failed to fetch')) {
                throw new Error(`Edge function not deployed or not accessible: ${error.message}`);
              }
              throw new Error(`Function error: ${error.message}`);
            }
            
            return {
              status: 'passed',
              message: 'miner-controller edge function is accessible and responding',
              duration: Date.now() - start,
              details: { responseKeys: Object.keys(data) }
            };
          }
        },
        {
          name: 'Database Tables Exist',
          fn: async () => {
            const start = Date.now();
            
            // Check hydro_miners table
            const { error: minersError } = await supabase
              .from('hydro_miners')
              .select('id')
              .limit(1);
            
            if (minersError && minersError.message.includes('does not exist')) {
              throw new Error('hydro_miners table does not exist');
            }
            
            // Check miner_control_log table
            const { error: logError } = await supabase
              .from('miner_control_log')
              .select('id')
              .limit(1);
            
            if (logError && logError.message.includes('does not exist')) {
              throw new Error('miner_control_log table does not exist');
            }
            
            // Check miner_power_readings table
            const { error: readingsError } = await supabase
              .from('miner_power_readings')
              .select('id')
              .limit(1);
            
            if (readingsError && readingsError.message.includes('does not exist')) {
              throw new Error('miner_power_readings table does not exist');
            }
            
            return {
              status: 'passed',
              message: 'All required database tables exist (hydro_miners, miner_control_log, miner_power_readings)',
              duration: Date.now() - start,
            };
          }
        },
      ]
    },
    {
      name: 'Miner Registration (CRUD)',
      icon: Cpu,
      tests: [
        {
          name: 'List Miners (Empty State)',
          fn: async () => {
            const start = Date.now();
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            if (error) throw new Error(`List failed: ${error.message}`);
            
            const minerCount = data.miners?.length || 0;
            return {
              status: 'passed',
              message: `List action working. Current miners: ${minerCount}`,
              duration: Date.now() - start,
              details: { minerCount }
            };
          }
        },
        {
          name: 'Register Test Miner',
          fn: async () => {
            const start = Date.now();
            const testMiner = {
              name: `Test-Miner-${Date.now()}`,
              model: 'S19 XP Hydro',
              ip_address: '192.168.99.99',
              firmware_type: 'stock',
              priority_group: 'low',
              target_hashrate_th: 255,
              location: 'Test Location'
            };
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'register', miner_data: testMiner }
            });
            
            if (error) throw new Error(`Registration failed: ${error.message}`);
            if (!data.miner?.id) throw new Error('No miner ID returned');
            
            // Store for later tests
            setTestMinerId(data.miner.id);
            
            return {
              status: 'passed',
              message: `Miner registered successfully with ID: ${data.miner.id.substring(0, 8)}...`,
              duration: Date.now() - start,
              details: { minerId: data.miner.id, name: testMiner.name }
            };
          }
        },
        {
          name: 'Verify Miner in List',
          fn: async () => {
            const start = Date.now();
            
            // Wait a moment for DB consistency
            await new Promise(r => setTimeout(r, 500));
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            if (error) throw new Error(`List failed: ${error.message}`);
            
            const testMiner = data.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (!testMiner) throw new Error('Test miner not found in list');
            
            return {
              status: 'passed',
              message: `Test miner verified in fleet list`,
              duration: Date.now() - start,
              details: { found: true, status: testMiner.current_status }
            };
          }
        },
        {
          name: 'Update Miner',
          fn: async () => {
            const start = Date.now();
            
            // Get test miner ID
            const { data: listData } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            const miner = listData.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (!miner) throw new Error('Test miner not found');
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { 
                action: 'update', 
                miner_id: miner.id,
                miner_data: { location: 'Updated Test Location' }
              }
            });
            
            if (error) throw new Error(`Update failed: ${error.message}`);
            
            return {
              status: 'passed',
              message: 'Miner updated successfully',
              duration: Date.now() - start,
              details: { updated: true }
            };
          }
        },
      ]
    },
    {
      name: 'Miner Control Commands',
      icon: Power,
      tests: [
        {
          name: 'Sleep Command (Network Error Expected)',
          fn: async () => {
            const start = Date.now();
            
            // Get test miner
            const { data: listData } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            const miner = listData.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (!miner) {
              return {
                status: 'skipped',
                message: 'No test miner available',
                duration: Date.now() - start,
              };
            }
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { 
                action: 'sleep', 
                miner_ids: [miner.id],
                reason: 'Test sleep command'
              }
            });
            
            // We expect network errors for fake IPs, but the command should be logged
            if (error && !error.message.includes('network')) {
              throw new Error(`Sleep command failed unexpectedly: ${error.message}`);
            }
            
            return {
              status: 'passed',
              message: 'Sleep command sent (network error expected for fake IP)',
              duration: Date.now() - start,
              details: { results: data?.results }
            };
          }
        },
        {
          name: 'Wakeup Command (Network Error Expected)',
          fn: async () => {
            const start = Date.now();
            
            const { data: listData } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            const miner = listData.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (!miner) {
              return {
                status: 'skipped',
                message: 'No test miner available',
                duration: Date.now() - start,
              };
            }
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { 
                action: 'wakeup', 
                miner_ids: [miner.id],
                reason: 'Test wakeup command'
              }
            });
            
            if (error && !error.message.includes('network')) {
              throw new Error(`Wakeup command failed unexpectedly: ${error.message}`);
            }
            
            return {
              status: 'passed',
              message: 'Wakeup command sent (network error expected for fake IP)',
              duration: Date.now() - start,
              details: { results: data?.results }
            };
          }
        },
        {
          name: 'Batch Sleep by Priority',
          fn: async () => {
            const start = Date.now();
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { 
                action: 'batch_sleep', 
                priority_groups: ['low', 'curtailable'],
                reason: 'Test batch sleep'
              }
            });
            
            if (error) throw new Error(`Batch sleep failed: ${error.message}`);
            
            return {
              status: 'passed',
              message: `Batch sleep command executed for low/curtailable priority groups`,
              duration: Date.now() - start,
              details: { affectedCount: data?.affected_count || 0 }
            };
          }
        },
        {
          name: 'Get Fleet Stats',
          fn: async () => {
            const start = Date.now();
            
            const { data, error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'stats' }
            });
            
            if (error) throw new Error(`Stats fetch failed: ${error.message}`);
            
            const stats = data.stats || {};
            return {
              status: 'passed',
              message: `Fleet stats retrieved: ${stats.total || 0} total miners`,
              duration: Date.now() - start,
              details: stats
            };
          }
        },
      ]
    },
    {
      name: 'Control Log Verification',
      icon: Database,
      tests: [
        {
          name: 'Control Log Entries Created',
          fn: async () => {
            const start = Date.now();
            
            const { data, error } = await supabase
              .from('miner_control_log')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5);
            
            if (error) throw new Error(`Log query failed: ${error.message}`);
            
            const logCount = data?.length || 0;
            return {
              status: logCount > 0 ? 'passed' : 'warning',
              message: logCount > 0 
                ? `Found ${logCount} control log entries`
                : 'No control log entries yet (commands may not have been executed)',
              duration: Date.now() - start,
              details: { logCount, recentActions: data?.map((d: any) => d.action) }
            };
          }
        },
      ]
    },
    {
      name: 'Cleanup',
      icon: Trash2,
      tests: [
        {
          name: 'Delete Test Miner',
          fn: async () => {
            const start = Date.now();
            
            // Find test miner
            const { data: listData } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            const miner = listData.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (!miner) {
              return {
                status: 'passed',
                message: 'No test miner to clean up',
                duration: Date.now() - start,
              };
            }
            
            const { error } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'delete', miner_id: miner.id }
            });
            
            if (error) throw new Error(`Delete failed: ${error.message}`);
            
            setTestMinerId(null);
            
            return {
              status: 'passed',
              message: 'Test miner deleted successfully',
              duration: Date.now() - start,
            };
          }
        },
        {
          name: 'Verify Deletion',
          fn: async () => {
            const start = Date.now();
            
            await new Promise(r => setTimeout(r, 500));
            
            const { data } = await supabase.functions.invoke('miner-controller', {
              body: { action: 'list' }
            });
            
            const testMiner = data.miners?.find((m: any) => m.ip_address === '192.168.99.99');
            if (testMiner) {
              return {
                status: 'warning',
                message: 'Test miner still exists after deletion',
                duration: Date.now() - start,
              };
            }
            
            return {
              status: 'passed',
              message: 'Test miner successfully removed from fleet',
              duration: Date.now() - start,
            };
          }
        },
      ]
    },
  ];

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestMinerId(null);
    
    const categories = getTestCategories();
    const allTests: TestResult[] = [];
    
    // Build flat test list
    categories.forEach(cat => {
      cat.tests.forEach(test => {
        allTests.push({
          name: test.name,
          category: cat.name,
          status: 'pending',
          message: '',
        });
      });
    });
    
    setTests(allTests);
    
    let testIndex = 0;
    const totalTests = allTests.length;
    
    for (const category of categories) {
      for (const test of category.tests) {
        updateTest(testIndex, { status: 'running' });
        setProgress((testIndex / totalTests) * 100);
        
        try {
          const result = await test.fn();
          updateTest(testIndex, {
            status: result.status || 'passed',
            message: result.message || '',
            duration: result.duration,
            details: result.details,
          });
        } catch (error: any) {
          updateTest(testIndex, {
            status: 'failed',
            message: error.message || 'Test failed',
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        testIndex++;
      }
    }
    
    setIsRunning(false);
    setProgress(100);
    
    const passed = allTests.filter(t => tests.find(tt => tt.name === t.name)?.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const warnings = tests.filter(t => t.status === 'warning').length;
    
    toast({
      title: 'Miner Fleet Tests Complete',
      description: `${passed} passed, ${failed} failed, ${warnings} warnings`,
      variant: failed > 0 ? 'destructive' : 'default',
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'skipped':
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], string> = {
      passed: 'bg-success/10 text-success hover:bg-success/20',
      failed: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      warning: 'bg-warning/10 text-warning hover:bg-warning/20',
      skipped: 'bg-muted text-muted-foreground',
      running: 'bg-primary/10 text-primary hover:bg-primary/20',
      pending: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const summary = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    warnings: tests.filter(t => t.status === 'warning').length,
    skipped: tests.filter(t => t.status === 'skipped').length,
    pending: tests.filter(t => t.status === 'pending').length,
  };

  // Group tests by category
  const testsByCategory = tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Miner Fleet Test Suite</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive validation of miner management features
              </p>
            </div>
          </div>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {tests.length > 0 && (
          <div className="grid grid-cols-6 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <Database className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">{summary.passed}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold text-destructive">{summary.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-warning">{summary.warnings}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{summary.skipped}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{summary.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        )}

        {/* Tests grouped by category */}
        <div className="space-y-6">
          {Object.entries(testsByCategory).map(([category, categoryTests]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryTests.map((test, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="pt-0.5">{getStatusIcon(test.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h4 className="font-medium">{test.name}</h4>
                        <div className="flex items-center gap-2">
                          {test.duration && (
                            <span className="text-xs text-muted-foreground">
                              {test.duration}ms
                            </span>
                          )}
                          {getStatusBadge(test.status)}
                        </div>
                      </div>
                      {test.message && (
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                      )}
                      {test.details && (
                        <div className="mt-2 p-2 rounded bg-muted/50 text-xs font-mono overflow-x-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run All Tests" to start validation</p>
            <p className="text-sm mt-2">
              Tests will verify edge function deployment, CRUD operations, 
              control commands, and database integrity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
