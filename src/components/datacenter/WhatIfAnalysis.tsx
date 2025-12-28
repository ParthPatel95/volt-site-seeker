import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDUDevice {
  id: string;
  name: string;
  location: string | null;
  priority_group: 'critical' | 'high' | 'medium' | 'low';
  max_capacity_kw: number;
  current_load_kw: number;
  current_status: string;
}

interface ShutdownRule {
  id: string;
  name: string;
  price_ceiling_cad: number;
  soft_ceiling_cad?: number | null;
  price_floor_cad?: number;
  affected_priority_groups: string[];
  is_active: boolean;
}

interface WhatIfAnalysisProps {
  currentPrice: number;
  pdus: PDUDevice[];
  rules: ShutdownRule[];
}

export function WhatIfAnalysis({ currentPrice, pdus, rules }: WhatIfAnalysisProps) {
  const [simulatedPrice, setSimulatedPrice] = useState(currentPrice);
  const [simulatedDuration, setSimulatedDuration] = useState(1); // hours

  const activeRule = rules.find(r => r.is_active);
  const priceRange = {
    min: 0,
    max: Math.max(500, (activeRule?.price_ceiling_cad || 200) * 2)
  };

  const analysis = useMemo(() => {
    if (!activeRule) {
      return {
        decision: 'no_rule',
        affectedPDUs: [],
        loadReduction: 0,
        estimatedSavings: 0,
        priceBuffer: 0
      };
    }

    const isBelowFloor = activeRule.price_floor_cad && simulatedPrice < activeRule.price_floor_cad;
    const isAboveSoftCeiling = activeRule.soft_ceiling_cad && simulatedPrice >= activeRule.soft_ceiling_cad;
    const isAboveHardCeiling = simulatedPrice >= activeRule.price_ceiling_cad;

    let decision: 'normal' | 'warning' | 'shutdown' | 'floor_opportunity';
    let affectedPDUs: PDUDevice[] = [];

    if (isBelowFloor) {
      decision = 'floor_opportunity';
    } else if (isAboveHardCeiling) {
      decision = 'shutdown';
      affectedPDUs = pdus.filter(p => 
        activeRule.affected_priority_groups.includes(p.priority_group) && 
        p.current_status === 'online'
      );
    } else if (isAboveSoftCeiling) {
      decision = 'warning';
      // Only critical priority affected at soft ceiling
      affectedPDUs = pdus.filter(p => 
        p.priority_group === 'critical' && 
        p.current_status === 'online'
      );
    } else {
      decision = 'normal';
    }

    const loadReduction = affectedPDUs.reduce((sum, p) => sum + p.current_load_kw, 0);
    
    // Estimated savings = (price above threshold) × load × duration
    const priceAboveThreshold = Math.max(0, simulatedPrice - (activeRule.soft_ceiling_cad || activeRule.price_ceiling_cad * 0.85));
    const estimatedSavings = (priceAboveThreshold / 1000) * loadReduction * simulatedDuration; // Convert $/MWh to $/kWh

    const priceBuffer = activeRule.price_ceiling_cad - simulatedPrice;

    return {
      decision,
      affectedPDUs,
      loadReduction,
      estimatedSavings,
      priceBuffer
    };
  }, [simulatedPrice, simulatedDuration, activeRule, pdus]);

  const getDecisionDisplay = () => {
    switch (analysis.decision) {
      case 'shutdown':
        return { label: 'SHUTDOWN', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
      case 'warning':
        return { label: 'WARNING', color: 'bg-yellow-500 text-white', icon: AlertTriangle };
      case 'floor_opportunity':
        return { label: 'OPPORTUNITY', color: 'bg-green-500 text-white', icon: TrendingDown };
      case 'no_rule':
        return { label: 'NO RULES', color: 'bg-muted text-muted-foreground', icon: Calculator };
      default:
        return { label: 'NORMAL', color: 'bg-emerald-500 text-white', icon: Zap };
    }
  };

  const decisionDisplay = getDecisionDisplay();
  const DecisionIcon = decisionDisplay.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          What-If Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Simulated Price</label>
            <span className={cn(
              "text-lg font-bold",
              analysis.decision === 'shutdown' && "text-destructive",
              analysis.decision === 'warning' && "text-yellow-500",
              analysis.decision === 'floor_opportunity' && "text-green-500"
            )}>
              CA${simulatedPrice.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[simulatedPrice]}
            onValueChange={([value]) => setSimulatedPrice(value)}
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            {activeRule?.price_floor_cad && (
              <span className="text-green-500">Floor: ${activeRule.price_floor_cad}</span>
            )}
            {activeRule?.soft_ceiling_cad && (
              <span className="text-yellow-500">Soft: ${activeRule.soft_ceiling_cad}</span>
            )}
            {activeRule && (
              <span className="text-destructive">Hard: ${activeRule.price_ceiling_cad}</span>
            )}
            <span>${priceRange.max}</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Duration (hours)</label>
            <span className="text-lg font-bold">{simulatedDuration}h</span>
          </div>
          <Slider
            value={[simulatedDuration]}
            onValueChange={([value]) => setSimulatedDuration(value)}
            min={1}
            max={24}
            step={1}
            className="py-2"
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Decision</p>
            <Badge className={cn("text-sm", decisionDisplay.color)}>
              <DecisionIcon className="w-3 h-3 mr-1" />
              {decisionDisplay.label}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price Buffer</p>
            <p className={cn(
              "text-lg font-bold",
              analysis.priceBuffer > 50 ? "text-green-500" : 
              analysis.priceBuffer > 0 ? "text-yellow-500" : "text-destructive"
            )}>
              CA${analysis.priceBuffer.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Affected PDUs</p>
            <p className="text-lg font-bold">{analysis.affectedPDUs.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Load Reduction</p>
            <p className="text-lg font-bold">{analysis.loadReduction.toFixed(1)} kW</p>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-medium">Estimated Savings</span>
            </div>
            <span className="text-2xl font-bold text-green-500">
              CA${analysis.estimatedSavings.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Over {simulatedDuration} hour{simulatedDuration > 1 ? 's' : ''} at CA${simulatedPrice}/MWh
          </p>
        </div>

        {/* Affected PDUs List */}
        {analysis.affectedPDUs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">PDUs That Would Be Affected:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {analysis.affectedPDUs.map(pdu => (
                <div key={pdu.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{pdu.priority_group}</Badge>
                    <span>{pdu.name}</span>
                  </div>
                  <span className="text-muted-foreground">{pdu.current_load_kw} kW</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
