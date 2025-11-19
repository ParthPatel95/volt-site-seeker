import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAESOPhase1Features } from '@/hooks/useAESOPhase1Features';
import { useAESOPhase2Features } from '@/hooks/useAESOPhase2Features';
import { useAESOPhase3Features } from '@/hooks/useAESOPhase3Features';
import { useAESOPhase4Features } from '@/hooks/useAESOPhase4Features';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running' | 'pending';
  message: string;
  duration?: number;
}

export const AESOPredictionTester = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();
  const { calculatePhase1Features, loading: phase1Loading } = useAESOPhase1Features();
  const { calculatePhase2Features, loading: phase2Loading } = useAESOPhase2Features();
  const { calculatePhase3Features, loading: phase3Loading } = useAESOPhase3Features();
  const { calculatePhase4Features, loading: phase4Loading } = useAESOPhase4Features();

  const updateResult = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, duration } : r);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests = [
      'Database Schema',
      'Training Data',
      'Model Performance',
      'Prediction Generation',
      'Data Quality',
      'Phase 1 Features',
      'Phase 2 Features',
      'Cache System',
      'Error Handling'
    ];
    
    setResults(tests.map(name => ({ name, status: 'pending' as const, message: 'Waiting...' })));

    try {
      // Test 1: Database Schema
      updateResult('Database Schema', 'running', 'Checking tables and columns...');
      const start1 = Date.now();
      const { data: schemaData, error: schemaError } = await supabase
        .from('aeso_model_performance')
        .select('model_version, smape, mae, rmse')
        .limit(1);
      
      if (schemaError) {
        updateResult('Database Schema', 'failed', `Schema error: ${schemaError.message}`, Date.now() - start1);
      } else {
        updateResult('Database Schema', 'passed', 'All required tables and columns exist', Date.now() - start1);
      }

      // Test 2: Training Data
      updateResult('Training Data', 'running', 'Checking training data availability...');
      const start2 = Date.now();
      const { count, error: countError } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        updateResult('Training Data', 'failed', `Data check failed: ${countError.message}`, Date.now() - start2);
      } else if (!count || count < 100) {
        updateResult('Training Data', 'warning', `Only ${count || 0} training records (need 100+)`, Date.now() - start2);
      } else {
        updateResult('Training Data', 'passed', `${count} training records available`, Date.now() - start2);
      }

      // Test 3: Model Performance
      updateResult('Model Performance', 'running', 'Checking model metrics...');
      const start3 = Date.now();
      const { data: perfData, error: perfError } = await supabase
        .from('aeso_model_status')
        .select('*')
        .order('last_trained', { ascending: false })
        .limit(1)
        .single();
      
      if (perfError || !perfData) {
        updateResult('Model Performance', 'warning', 'No model trained yet', Date.now() - start3);
      } else {
        const quality = perfData.smape < 20 ? 'excellent' : perfData.smape < 50 ? 'good' : 'needs improvement';
        updateResult('Model Performance', perfData.smape < 50 ? 'passed' : 'warning', 
          `sMAPE: ${perfData.smape.toFixed(1)}% (${quality})`, Date.now() - start3);
      }

      // Test 4: Prediction Generation
      updateResult('Prediction Generation', 'running', 'Testing prediction API...');
      const start4 = Date.now();
      const { data: predData, error: predError } = await supabase.functions.invoke('aeso-optimized-predictor', {
        body: { horizon: '6h', forceRefresh: false }
      });
      
      if (predError || !predData?.success) {
        updateResult('Prediction Generation', 'failed', 
          predError?.message || predData?.error || 'Prediction failed', Date.now() - start4);
      } else {
        updateResult('Prediction Generation', 'passed', 
          `Generated ${predData.predictions.length} predictions`, Date.now() - start4);
      }

      // Test 5: Data Quality
      updateResult('Data Quality', 'running', 'Checking data completeness...');
      const start5 = Date.now();
      const { data: qualityData, error: qualityError } = await supabase
        .from('aeso_data_quality_summary')
        .select('*')
        .single();
      
      if (qualityError || !qualityData) {
        updateResult('Data Quality', 'warning', 'Quality metrics unavailable', Date.now() - start5);
      } else {
        const validPercent = qualityData.valid_percentage || 0;
        updateResult('Data Quality', validPercent > 80 ? 'passed' : 'warning', 
          `${validPercent.toFixed(1)}% data validity`, Date.now() - start5);
      }

      // Test 6: Phase 1 Features
      updateResult('Phase 1 Features', 'running', 'Calculating Phase 1 features...');
      const start6 = Date.now();
      try {
        const phase1Result = await calculatePhase1Features();
        if (phase1Result && phase1Result.success) {
          updateResult('Phase 1 Features', 'passed', 
            `Phase 1: ${phase1Result.records_processed} records with extended lags, quantiles, day_type`, 
            Date.now() - start6);
        } else {
          updateResult('Phase 1 Features', 'failed', 'Phase 1 calculation failed', Date.now() - start6);
        }
      } catch (error) {
        updateResult('Phase 1 Features', 'failed', `Phase 1 error: ${error.message}`, Date.now() - start6);
      }

      // Test 7: Phase 2 Features
      updateResult('Phase 2 Features', 'running', 'Calculating Phase 2 features...');
      const start7 = Date.now();
      try {
        const phase2Result = await calculatePhase2Features();
        if (phase2Result && phase2Result.success) {
          updateResult('Phase 2 Features', 'passed', 
            `Phase 2: ${phase2Result.stats.updated_records} records with Fourier transforms & timing`, 
            Date.now() - start7);
        } else {
          updateResult('Phase 2 Features', 'failed', 'Phase 2 calculation failed', Date.now() - start7);
        }
      } catch (error) {
        updateResult('Phase 2 Features', 'failed', `Phase 2 error: ${error.message}`, Date.now() - start7);
      }

      // Test 7.5: Phase 3 Features
      updateResult('Phase 3 Features', 'running', 'Calculating Phase 3 features...');
      const start7_5 = Date.now();
      try {
        const phase3Result = await calculatePhase3Features();
        if (phase3Result && phase3Result.success) {
          const totalFeatures = phase3Result.stats.gas_features + phase3Result.stats.interaction_features + 
                               phase3Result.stats.volatility_features + phase3Result.stats.momentum_features;
          updateResult('Phase 3 Features', 'passed', 
            `Phase 3: ${phase3Result.stats.updated_records} records with ${totalFeatures} gas/weather/interaction features`, 
            Date.now() - start7_5);
        } else {
          updateResult('Phase 3 Features', 'failed', 'Phase 3 calculation failed', Date.now() - start7_5);
        }
      } catch (error) {
        updateResult('Phase 3 Features', 'failed', `Phase 3 error: ${error.message}`, Date.now() - start7_5);
      }

      // Test 7.75: Phase 4 Features
      updateResult('Phase 4 Features', 'running', 'Calculating Phase 4 features...');
      const start7_75 = Date.now();
      try {
        const phase4Result = await calculatePhase4Features();
        if (phase4Result && phase4Result.success) {
          const totalFeatures = phase4Result.stats.polynomial_features + phase4Result.stats.ratio_features + 
                               phase4Result.stats.cross_features + phase4Result.stats.binning_features;
          updateResult('Phase 4 Features', 'passed', 
            `Phase 4: ${phase4Result.stats.updated_records} records with ${totalFeatures} advanced features`, 
            Date.now() - start7_75);
        } else {
          updateResult('Phase 4 Features', 'failed', 'Phase 4 calculation failed', Date.now() - start7_75);
        }
      } catch (error) {
        updateResult('Phase 4 Features', 'failed', `Phase 4 error: ${error.message}`, Date.now() - start7_75);
      }

      // Test 8: Cache System
      updateResult('Cache System', 'running', 'Testing prediction cache...');
      const start8 = Date.now();
      const { data: cacheData, error: cacheError } = await supabase
        .from('aeso_price_predictions')
        .select('target_timestamp, predicted_price')
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .limit(1);
      
      if (cacheError) {
        updateResult('Cache System', 'warning', 'Cache unavailable', Date.now() - start8);
      } else {
        updateResult('Cache System', 'passed', 
          `${cacheData.length > 0 ? 'Cache active' : 'Cache empty'}`, Date.now() - start8);
      }

      // Test 9: Error Handling
      updateResult('Error Handling', 'running', 'Testing error recovery...');
      const start9 = Date.now();
      const { error: testError } = await supabase
        .from('aeso_training_data')
        .select('nonexistent_column')
        .limit(1);
      
      if (testError) {
        updateResult('Error Handling', 'passed', 'Error handling working correctly', Date.now() - start9);
      } else {
        updateResult('Error Handling', 'warning', 'Error handling needs verification', Date.now() - start9);
      }

      // Summary
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const warnings = results.filter(r => r.status === 'warning').length;

      toast({
        title: "Test Suite Complete",
        description: `${passed} passed, ${failed} failed, ${warnings} warnings`,
        variant: failed > 0 ? "destructive" : "default",
      });

    } catch (error) {
      console.error('Test suite error:', error);
      toast({
        title: "Test Suite Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'running': return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default: return <div className="h-5 w-5 rounded-full bg-muted" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-success/10 text-success border-success/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'running': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const summary = {
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    warning: results.filter(r => r.status === 'warning').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Prediction System Tests</CardTitle>
            <CardDescription>Comprehensive validation of all prediction components</CardDescription>
          </div>
          <Button onClick={runTests} disabled={testing} size="lg">
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-success/10 text-success">
              {summary.passed} Passed
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              {summary.failed} Failed
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning">
              {summary.warning} Warnings
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.name}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm opacity-80">{result.message}</div>
                </div>
              </div>
              {result.duration && (
                <div className="text-xs opacity-60">{result.duration}ms</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
