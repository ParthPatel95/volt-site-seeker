import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedEnergyCalculations } from '@/hooks/useSavedEnergyCalculations';
import { useEnergyRateEstimator } from '@/hooks/useEnergyRateEstimator';
import { EnergyRateResults } from './EnergyRateResults';
import { RefreshCw, Trash2, Calendar, MapPin, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SavedCalculationsDashboard() {
  const { savedCalculations, loading, updateCalculation, deleteCalculation } = useSavedEnergyCalculations();
  const { calculateRates } = useEnergyRateEstimator();
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUpdate = async (calculation: any) => {
    setUpdatingIds(prev => new Set(prev).add(calculation.id));
    try {
      const newResults = await calculateRates(calculation.input_data);
      await updateCalculation(calculation.id, calculation.input_data, newResults);
    } catch (error) {
      console.error('Failed to update calculation:', error);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(calculation.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this calculation?')) {
      await deleteCalculation(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading saved calculations...</span>
      </div>
    );
  }

  if (savedCalculations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Saved Calculations</h3>
          <p className="text-muted-foreground">
            Create your first energy rate calculation and save it to see live updates here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Energy Calculations</h2>
        <Badge variant="secondary">{savedCalculations.length} calculations</Badge>
      </div>

      <div className="grid gap-4">
        {savedCalculations.map((calculation) => (
          <Card key={calculation.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{calculation.calculation_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate(calculation)}
                    disabled={updatingIds.has(calculation.id)}
                  >
                    <RefreshCw className={`h-4 w-4 ${updatingIds.has(calculation.id) ? 'animate-spin' : ''}`} />
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(calculation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {calculation.input_data.latitude.toFixed(4)}, {calculation.input_data.longitude.toFixed(4)}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {calculation.input_data.contractedLoadMW} MW
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated {formatDistanceToNow(new Date(calculation.updated_at), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {(typeof calculation.results_data.averageAllInPrice === 'object' 
                      ? calculation.results_data.averageAllInPrice.centsPerKWh 
                      : calculation.results_data.averageAllInPrice).toFixed(2)}¢
                  </div>
                  <div className="text-xs text-muted-foreground">Avg All-In Price</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {calculation.results_data.territory?.utility || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Utility</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {calculation.results_data.currency}
                  </div>
                  <div className="text-xs text-muted-foreground">Currency</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {calculation.input_data.customerClass}
                  </div>
                  <div className="text-xs text-muted-foreground">Class</div>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setExpandedId(expandedId === calculation.id ? null : calculation.id)}
                className="w-full"
              >
                {expandedId === calculation.id ? 'Hide Details' : 'Show Details'}
              </Button>

              {expandedId === calculation.id && (
                <div className="mt-4 border-t pt-4">
                  <EnergyRateResults
                    results={calculation.results_data}
                    input={calculation.input_data}
                    onDownloadCSV={() => {}}
                    onDownloadPDF={() => {}}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}