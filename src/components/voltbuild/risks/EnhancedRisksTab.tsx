import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Grid3X3, List } from 'lucide-react';
import { useEnhancedRisks } from './hooks/useEnhancedRisks';
import { useRiskAnalytics } from './hooks/useRiskAnalytics';
import { RiskDashboard } from './RiskDashboard';
import { RiskRegister } from './RiskRegister';
import { RiskForm, type RiskFormData } from './RiskForm';
import type { EnhancedRisk, RiskFilters, RiskStatus } from './types/voltbuild-risks.types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  getRiskLevel, 
  getRiskLevelColor, 
  STATUS_CONFIG, 
  PROBABILITY_CONFIG, 
  IMPACT_CONFIG,
  CATEGORY_CONFIG,
  RESPONSE_TYPE_CONFIG
} from './types/voltbuild-risks.types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface EnhancedRisksTabProps {
  projectId: string;
  phases?: { id: string; name: string }[];
  tasks?: { id: string; name: string }[];
}

export function EnhancedRisksTab({ projectId, phases = [], tasks = [] }: EnhancedRisksTabProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register'>('dashboard');
  const [filters, setFilters] = useState<RiskFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<EnhancedRisk | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [matrixFilteredRisks, setMatrixFilteredRisks] = useState<EnhancedRisk[] | null>(null);

  const { 
    risks, 
    isLoading, 
    createRisk, 
    updateRisk, 
    deleteRisk, 
    filterRisks,
    isCreating,
    isUpdating 
  } = useEnhancedRisks(projectId);
  
  const { analytics, riskMatrix } = useRiskAnalytics(risks);

  // Apply filters
  const displayedRisks = useMemo(() => {
    if (matrixFilteredRisks) return matrixFilteredRisks;
    return filterRisks(risks, filters);
  }, [risks, filters, matrixFilteredRisks, filterRisks]);

  const handleCreateRisk = (data: RiskFormData) => {
    createRisk({
      project_id: projectId,
      ...data,
    });
    setIsFormOpen(false);
  };

  const handleStatusChange = (riskId: string, status: RiskStatus) => {
    updateRisk({ 
      id: riskId, 
      status,
      actual_resolution_date: status === 'closed' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const handleRiskClick = (risk: EnhancedRisk) => {
    setSelectedRisk(risk);
    setIsDetailOpen(true);
  };

  const handleMatrixCellClick = (cellRisks: EnhancedRisk[]) => {
    if (cellRisks.length > 0) {
      setMatrixFilteredRisks(cellRisks);
      setActiveTab('register');
    }
  };

  const clearMatrixFilter = () => {
    setMatrixFilteredRisks(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Risk Management</h2>
          <p className="text-sm text-muted-foreground">
            {analytics.totalRisks} total risks • {analytics.openRisks} open • {analytics.criticalRisks} critical
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); clearMatrixFilter(); }}>
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="register" className="gap-2">
            <List className="w-4 h-4" />
            Register
            {matrixFilteredRisks && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {matrixFilteredRisks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Matrix filter indicator */}
        {matrixFilteredRisks && activeTab === 'register' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {matrixFilteredRisks.length} risks from matrix selection</span>
            <Button variant="link" size="sm" onClick={clearMatrixFilter}>
              Clear filter
            </Button>
          </div>
        )}

        <TabsContent value="dashboard" className="mt-4">
          <RiskDashboard 
            analytics={analytics} 
            riskMatrix={riskMatrix} 
            onCellClick={handleMatrixCellClick}
          />
        </TabsContent>

        <TabsContent value="register" className="mt-4">
          <RiskRegister
            risks={displayedRisks}
            filters={filters}
            onFiltersChange={setFilters}
            onRiskClick={handleRiskClick}
            onStatusChange={handleStatusChange}
            onDeleteRisk={deleteRisk}
          />
        </TabsContent>
      </Tabs>

      {/* Add Risk Form */}
      <RiskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateRisk}
        phases={phases}
        tasks={tasks}
        isSubmitting={isCreating}
      />

      {/* Risk Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedRisk && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedRisk.title}</SheetTitle>
                <SheetDescription>
                  Created {new Date(selectedRisk.created_at).toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status & Score */}
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={cn(
                      selectedRisk.status === 'open' && 'border-red-500/50 text-red-600',
                      selectedRisk.status === 'mitigated' && 'border-yellow-500/50 text-yellow-600',
                      selectedRisk.status === 'closed' && 'border-muted-foreground/50'
                    )}
                  >
                    {STATUS_CONFIG[selectedRisk.status].label}
                  </Badge>
                  <Badge className={cn(getRiskLevelColor(getRiskLevel(selectedRisk.risk_score)))}>
                    Score: {selectedRisk.risk_score}
                  </Badge>
                </div>

                {/* Description */}
                {selectedRisk.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                  </div>
                )}

                <Separator />

                {/* Assessment */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Probability</span>
                    <p className="font-medium">{PROBABILITY_CONFIG[selectedRisk.probability].label}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact</span>
                    <p className="font-medium">{IMPACT_CONFIG[selectedRisk.impact].label}</p>
                  </div>
                  {selectedRisk.category && (
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">{CATEGORY_CONFIG[selectedRisk.category].label}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Response Strategy</span>
                    <p className="font-medium">{RESPONSE_TYPE_CONFIG[selectedRisk.response_type].label}</p>
                  </div>
                </div>

                <Separator />

                {/* Impact Estimates */}
                {(selectedRisk.estimated_cost_impact || selectedRisk.estimated_days_delay) && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedRisk.estimated_cost_impact && (
                        <div>
                          <span className="text-muted-foreground">Cost Impact</span>
                          <p className="font-medium">${selectedRisk.estimated_cost_impact.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedRisk.estimated_days_delay && (
                        <div>
                          <span className="text-muted-foreground">Delay Risk</span>
                          <p className="font-medium">{selectedRisk.estimated_days_delay} days</p>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Mitigation Plan */}
                {selectedRisk.mitigation_plan && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Mitigation Plan</h4>
                    <p className="text-sm text-muted-foreground">{selectedRisk.mitigation_plan}</p>
                  </div>
                )}

                {/* Owner & Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedRisk.owner && (
                    <div>
                      <span className="text-muted-foreground">Owner</span>
                      <p className="font-medium">{selectedRisk.owner}</p>
                    </div>
                  )}
                  {selectedRisk.target_resolution_date && (
                    <div>
                      <span className="text-muted-foreground">Target Resolution</span>
                      <p className="font-medium">{new Date(selectedRisk.target_resolution_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {selectedRisk.status === 'open' && (
                    <Button 
                      variant="outline"
                      onClick={() => { handleStatusChange(selectedRisk.id, 'mitigated'); setIsDetailOpen(false); }}
                      disabled={isUpdating}
                    >
                      Mark as Mitigated
                    </Button>
                  )}
                  {selectedRisk.status !== 'closed' && (
                    <Button 
                      variant="outline"
                      onClick={() => { handleStatusChange(selectedRisk.id, 'closed'); setIsDetailOpen(false); }}
                      disabled={isUpdating}
                    >
                      Close Risk
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
