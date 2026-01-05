import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen } from 'lucide-react';
import { VoltBuildPhase } from '../types/voltbuild.types';
import { CapexPhaseLine, CapexCatalogItem, CapexCalculatedSummary } from '../types/voltbuild-advanced.types';
import { CapexLineItemTable } from './CapexLineItemTable';
import { CapexCatalogDrawer } from './CapexCatalogDrawer';
import { CapexAddLineDialog } from './CapexAddLineDialog';

interface CapexPhaseAccordionProps {
  phases: VoltBuildPhase[];
  linesByPhase: Record<string, CapexPhaseLine[]>;
  calculations: CapexCalculatedSummary;
  projectId: string;
  onCreateLine: (line: {
    project_id: string;
    phase_id: string;
    catalog_item_id?: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    notes?: string;
  }) => void;
  onUpdateLine: (id: string, updates: Partial<CapexPhaseLine>) => void;
  onDeleteLine: (id: string) => void;
  isCreating?: boolean;
}

export function CapexPhaseAccordion({
  phases,
  linesByPhase,
  calculations,
  projectId,
  onCreateLine,
  onUpdateLine,
  onDeleteLine,
  isCreating,
}: CapexPhaseAccordionProps) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [prefilledItem, setPrefilledItem] = useState<CapexCatalogItem | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPhasePercentage = (phaseId: string) => {
    const phaseTotal = calculations.byPhase[phaseId] || 0;
    if (calculations.totalDirect === 0) return 0;
    return (phaseTotal / calculations.totalDirect) * 100;
  };

  const handleAddFromCatalog = (phaseId: string) => {
    setActivePhaseId(phaseId);
    setShowCatalog(true);
  };

  const handleCatalogSelect = (item: CapexCatalogItem) => {
    setPrefilledItem(item);
    setShowAddDialog(true);
  };

  const handleAddCustom = () => {
    setPrefilledItem(null);
    setShowAddDialog(true);
  };

  const handleSubmitLine = (values: {
    item_name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    notes?: string;
    catalog_item_id?: string;
  }) => {
    if (!activePhaseId) return;
    onCreateLine({
      project_id: projectId,
      phase_id: activePhaseId,
      ...values,
    });
  };

  return (
    <>
      <Accordion type="multiple" className="space-y-2">
        {phases.map((phase) => {
          const phaseLines = linesByPhase[phase.id] || [];
          const phaseTotal = calculations.byPhase[phase.id] || 0;
          const percentage = getPhasePercentage(phase.id);

          return (
            <AccordionItem
              key={phase.id}
              value={phase.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{phase.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {phaseLines.length} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(phaseTotal)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <CapexLineItemTable
                  lines={phaseLines}
                  onUpdate={(id, updates) => onUpdateLine(id, updates)}
                  onDelete={onDeleteLine}
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFromCatalog(phase.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    From Catalog
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivePhaseId(phase.id);
                      handleAddCustom();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Custom Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <CapexCatalogDrawer
        open={showCatalog}
        onOpenChange={setShowCatalog}
        onSelectItem={handleCatalogSelect}
        onAddCustom={handleAddCustom}
      />

      <CapexAddLineDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleSubmitLine}
        prefilledItem={prefilledItem}
        isSubmitting={isCreating}
      />
    </>
  );
}
