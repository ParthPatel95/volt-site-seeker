
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Lightbulb } from 'lucide-react';
import { useAESOIntelligence } from '@/hooks/useAESOIntelligence';
import { DemandResponsePanel } from '@/components/intelligence/DemandResponsePanel';
import { TransmissionLossPanel } from '@/components/intelligence/TransmissionLossPanel';
import { MeritOrderPanel } from '@/components/intelligence/MeritOrderPanel';
import { AncillaryServicesPanel } from '@/components/intelligence/AncillaryServicesPanel';
import { IntertieFlowsPanel } from '@/components/intelligence/IntertieFlowsPanel';
import { WeatherImpactPanel } from '@/components/intelligence/WeatherImpactPanel';
import { CarbonIntensityPanel } from '@/components/intelligence/CarbonIntensityPanel';
import { MarketParticipantsPanel } from '@/components/intelligence/MarketParticipantsPanel';
import { GridReliabilityPanel } from '@/components/intelligence/GridReliabilityPanel';
import { VolatilityAnalyticsPanel } from '@/components/intelligence/VolatilityAnalyticsPanel';

export function AESOIntelligence() {
  const {
    demandResponse,
    transmissionLossFactors,
    meritOrder,
    ancillaryServices,
    intertieFlows,
    weatherImpact,
    carbonIntensity,
    marketParticipants,
    gridReliability,
    volatilityAnalytics,
    loading,
    refreshAllIntelligenceData
  } = useAESOIntelligence();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lightbulb className="w-8 h-8 mr-3 text-yellow-600" />
                <div>
                  <CardTitle className="text-2xl">AESO Intelligence Tools</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Advanced analytics and insights for Alberta's electricity market
                  </p>
                </div>
              </div>
              <Button 
                onClick={refreshAllIntelligenceData}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh All Data
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DemandResponsePanel demandResponse={demandResponse} loading={loading} />
          <GridReliabilityPanel gridReliability={gridReliability} loading={loading} />
          <CarbonIntensityPanel carbonIntensity={carbonIntensity} loading={loading} />
          <VolatilityAnalyticsPanel volatilityAnalytics={volatilityAnalytics} loading={loading} />
          <TransmissionLossPanel transmissionLossFactors={transmissionLossFactors} loading={loading} />
          <MeritOrderPanel meritOrder={meritOrder} loading={loading} />
          <AncillaryServicesPanel ancillaryServices={ancillaryServices} loading={loading} />
          <IntertieFlowsPanel intertieFlows={intertieFlows} loading={loading} />
          <WeatherImpactPanel weatherImpact={weatherImpact} loading={loading} />
          <MarketParticipantsPanel marketParticipants={marketParticipants} loading={loading} />
        </div>
      </div>
    </AppLayout>
  );
}
