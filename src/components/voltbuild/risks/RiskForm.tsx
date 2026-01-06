import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { 
  RiskProbability, 
  RiskImpact, 
  RiskCategory, 
  RiskResponseType,
  RiskSeverity 
} from './types/voltbuild-risks.types';
import { 
  PROBABILITY_CONFIG, 
  IMPACT_CONFIG, 
  CATEGORY_CONFIG, 
  RESPONSE_TYPE_CONFIG 
} from './types/voltbuild-risks.types';

interface RiskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RiskFormData) => void;
  initialData?: Partial<RiskFormData>;
  phases?: { id: string; name: string }[];
  tasks?: { id: string; name: string }[];
  isSubmitting?: boolean;
}

export interface RiskFormData {
  title: string;
  description?: string;
  severity?: RiskSeverity;
  probability?: RiskProbability;
  impact?: RiskImpact;
  category?: RiskCategory;
  response_type?: RiskResponseType;
  mitigation_plan?: string;
  owner?: string;
  phase_id?: string;
  linked_task_id?: string;
  estimated_cost_impact?: number;
  estimated_days_delay?: number;
  target_resolution_date?: string;
  trigger_indicators?: string;
}

export function RiskForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  phases = [],
  tasks = [],
  isSubmitting 
}: RiskFormProps) {
  const [formData, setFormData] = useState<RiskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    severity: initialData?.severity || 'medium',
    probability: initialData?.probability || 'medium',
    impact: initialData?.impact || 'medium',
    category: initialData?.category,
    response_type: initialData?.response_type || 'mitigate',
    mitigation_plan: initialData?.mitigation_plan || '',
    owner: initialData?.owner || '',
    phase_id: initialData?.phase_id,
    linked_task_id: initialData?.linked_task_id,
    estimated_cost_impact: initialData?.estimated_cost_impact,
    estimated_days_delay: initialData?.estimated_days_delay,
    target_resolution_date: initialData?.target_resolution_date,
    trigger_indicators: initialData?.trigger_indicators,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  const updateField = <K extends keyof RiskFormData>(field: K, value: RiskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.title ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Risk Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Utility interconnection delays"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the risk and its potential impact..."
                rows={3}
              />
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Probability</Label>
              <Select 
                value={formData.probability} 
                onValueChange={(v) => updateField('probability', v as RiskProbability)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROBABILITY_CONFIG) as RiskProbability[]).map(p => (
                    <SelectItem key={p} value={p}>
                      {PROBABILITY_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Impact</Label>
              <Select 
                value={formData.impact} 
                onValueChange={(v) => updateField('impact', v as RiskImpact)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(IMPACT_CONFIG) as RiskImpact[]).map(i => (
                    <SelectItem key={i} value={i}>
                      {IMPACT_CONFIG[i].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Response */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(v) => updateField('category', v as RiskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_CONFIG) as RiskCategory[]).map(c => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_CONFIG[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Response Strategy</Label>
              <Select 
                value={formData.response_type} 
                onValueChange={(v) => updateField('response_type', v as RiskResponseType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RESPONSE_TYPE_CONFIG) as RiskResponseType[]).map(r => (
                    <SelectItem key={r} value={r}>
                      {RESPONSE_TYPE_CONFIG[r].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Impact Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost Impact ($)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.estimated_cost_impact || ''}
                onChange={(e) => updateField('estimated_cost_impact', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="delay">Delay Risk (days)</Label>
              <Input
                id="delay"
                type="number"
                value={formData.estimated_days_delay || ''}
                onChange={(e) => updateField('estimated_days_delay', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Mitigation */}
          <div>
            <Label htmlFor="mitigation">Mitigation Plan</Label>
            <Textarea
              id="mitigation"
              value={formData.mitigation_plan}
              onChange={(e) => updateField('mitigation_plan', e.target.value)}
              placeholder="Describe the steps to mitigate this risk..."
              rows={3}
            />
          </div>

          {/* Owner & Phase */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => updateField('owner', e.target.value)}
                placeholder="e.g., Project Manager"
              />
            </div>
            
            {phases.length > 0 && (
              <div>
                <Label>Linked Phase</Label>
                <Select 
                  value={formData.phase_id || '__none__'} 
                  onValueChange={(v) => updateField('phase_id', v === '__none__' ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {phases.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_date">Target Resolution Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_resolution_date || ''}
                onChange={(e) => updateField('target_resolution_date', e.target.value)}
              />
            </div>
          </div>

          {/* Trigger Indicators */}
          <div>
            <Label htmlFor="triggers">Trigger Indicators</Label>
            <Textarea
              id="triggers"
              value={formData.trigger_indicators}
              onChange={(e) => updateField('trigger_indicators', e.target.value)}
              placeholder="What warning signs should we watch for?"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? 'Saving...' : (initialData?.title ? 'Update Risk' : 'Add Risk')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
