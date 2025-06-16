
import React from 'react';
import { useFERCData } from '@/hooks/useFERCData';
import { FERCDashboardHeader } from './FERCDashboardHeader';
import { FERCInterconnectionSummary } from './FERCInterconnectionSummary';
import { FERCTechnologyMix } from './FERCTechnologyMix';
import { FERCQueueItems } from './FERCQueueItems';
import { FERCGeneratorData } from './FERCGeneratorData';

export function FERCDashboard() {
  const { 
    interconnectionQueue, 
    generatorData, 
    loading, 
    refetch 
  } = useFERCData();

  return (
    <div className="space-y-6">
      <FERCDashboardHeader loading={loading} refetch={refetch} />
      <FERCInterconnectionSummary interconnectionQueue={interconnectionQueue} />
      
      {interconnectionQueue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FERCTechnologyMix interconnectionQueue={interconnectionQueue} />
          <FERCQueueItems interconnectionQueue={interconnectionQueue} />
        </div>
      )}
      
      <FERCGeneratorData generatorData={generatorData} />
    </div>
  );
}
