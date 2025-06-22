
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PowerInfrastructureHeader } from './power/PowerInfrastructureHeader';
import { PowerInfrastructureTabs } from './power/PowerInfrastructureTabs';
import { PowerInfrastructureLoading } from './power/PowerInfrastructureLoading';
import { PowerOverviewCards } from './power/PowerOverviewCards';
import { EnhancedCapacityEstimator } from './power/EnhancedCapacityEstimator';
import { UltimatePowerInfrastructureFinder } from './power/UltimatePowerInfrastructureFinder';
import { EIADataPanel } from './power/EIADataPanel';
import { ERCOTDashboard } from './power/ERCOTDashboard';
import { FERCDashboard } from './power/FERCDashboard';
import { USGSDashboard } from './power/USGSDashboard';
import { EnvironmentalDashboard } from './power/EnvironmentalDashboard';
import { IdleIndustryScanner } from './power/IdleIndustryScanner';
import { EnergyRateIntelligence } from './energy/EnergyRateIntelligence';
import { SubstationsOverview } from './power/SubstationsOverview';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PowerData {
  totalSubstations: number;
  totalCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

export function PowerInfrastructure() {
  const [powerData, setPowerData] = useState<PowerData>({
    totalSubstations: 0,
    totalCapacity: 0,
    averageCapacity: 0,
    highCapacityCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPowerData();
  }, []);

  const loadPowerData = async () => {
    try {
      console.log('Loading real power infrastructure data...');
      setError(null);
      
      const { data: substations, error: fetchError } = await supabase
        .from('substations')
        .select('capacity_mva')
        .eq('status', 'active');

      if (fetchError) {
        console.error('Error loading power data:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (substations && substations.length > 0) {
        const totalSubstations = substations.length;
        const totalCapacity = substations.reduce((sum, sub) => sum + (sub.capacity_mva || 0), 0);
        const averageCapacity = totalCapacity / totalSubstations;
        const highCapacityCount = substations.filter(sub => (sub.capacity_mva || 0) > 100).length;

        const realPowerData = {
          totalSubstations,
          totalCapacity: Math.round(totalCapacity),
          averageCapacity: Math.round(averageCapacity * 10) / 10,
          highCapacityCount
        };

        setPowerData(realPowerData);
        console.log('Real power data loaded:', realPowerData);
      } else {
        console.log('No substations found in database');
        setPowerData({
          totalSubstations: 0,
          totalCapacity: 0,
          averageCapacity: 0,
          highCapacityCount: 0
        });
      }
    } catch (error) {
      console.error('Error loading power data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load power data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PowerInfrastructureLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PowerInfrastructureHeader powerData={powerData} />

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <PowerInfrastructureTabs />

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <PowerOverviewCards powerData={powerData} />
            
            {error && (
              <div className="text-center py-4 px-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive mb-2">Error loading data: {error}</p>
                <button 
                  onClick={loadPowerData}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            )}
            
            {!error && powerData.totalSubstations === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No substation data available. Use the Ultimate Finder to discover and analyze substations with all 5 integrated phases.
                </p>
              </div>
            )}

            <SubstationsOverview />
          </TabsContent>

          <TabsContent value="ultimate-finder">
            <UltimatePowerInfrastructureFinder />
          </TabsContent>

          <TabsContent value="capacity-estimator">
            <EnhancedCapacityEstimator />
          </TabsContent>

          <TabsContent value="energy-rates">
            <EnergyRateIntelligence />
          </TabsContent>

          <TabsContent value="ercot-live">
            <ERCOTDashboard />
          </TabsContent>

          <TabsContent value="ferc-data">
            <FERCDashboard />
          </TabsContent>

          <TabsContent value="usgs-data">
            <USGSDashboard />
          </TabsContent>

          <TabsContent value="environmental">
            <EnvironmentalDashboard />
          </TabsContent>

          <TabsContent value="eia-data">
            <EIADataPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
