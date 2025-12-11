import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreditSettingsPanel } from '@/components/aeso/CreditSettingsPanel';
import { CreditSettings, defaultCreditSettings } from '@/hooks/useEnergyCredits';

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  uptimePercentage: number;
  granularity: 'hourly' | 'daily' | 'monthly' | 'yearly';
  unit: 'mwh' | 'kwh';
  showAIL: boolean;
  showGeneration: boolean;
  onPeakStart: number;
  onPeakEnd: number;
  creditSettings: CreditSettings;
}

interface Props {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onApply: () => void;
  loading: boolean;
}

export function AdvancedAnalyticsControls({ filters, onFiltersChange, onApply, loading }: Props) {
  // Get default date range (last 3 years)
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 3);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || defaults.start}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                max={filters.endDate || defaults.end}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || defaults.end}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                min={filters.startDate || defaults.start}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Uptime Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uptime" className="text-sm font-medium">
                Monthly Uptime Filter: {filters.uptimePercentage}%
              </Label>
              <span className="text-xs text-muted-foreground">
                Drops highest-price hours first
              </span>
            </div>
            <Slider
              id="uptime"
              min={0}
              max={100}
              step={1}
              value={[filters.uptimePercentage]}
              onValueChange={([value]) => onFiltersChange({ ...filters, uptimePercentage: value })}
              className="w-full"
            />
            {filters.uptimePercentage < 100 && (
              <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-3 py-2 rounded-md">
                Uptime filter active: keeping {filters.uptimePercentage}% of hours per month (dropping highest-price hours)
              </p>
            )}
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Granularity */}
            <div className="space-y-2">
              <Label htmlFor="granularity">Granularity</Label>
              <Select
                value={filters.granularity}
                onValueChange={(value: any) => onFiltersChange({ ...filters, granularity: value })}
              >
                <SelectTrigger id="granularity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Price Unit</Label>
              <Select
                value={filters.unit}
                onValueChange={(value: any) => onFiltersChange({ ...filters, unit: value })}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mwh">$ / MWh</SelectItem>
                  <SelectItem value="kwh">¢ / kWh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* On-Peak Hours */}
            <div className="space-y-2">
              <Label htmlFor="peakStart">On-Peak Start</Label>
              <Input
                id="peakStart"
                type="number"
                min={0}
                max={23}
                value={filters.onPeakStart}
                onChange={(e) => onFiltersChange({ ...filters, onPeakStart: parseInt(e.target.value) || 8 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peakEnd">On-Peak End</Label>
              <Input
                id="peakEnd"
                type="number"
                min={0}
                max={23}
                value={filters.onPeakEnd}
                onChange={(e) => onFiltersChange({ ...filters, onPeakEnd: parseInt(e.target.value) || 22 })}
              />
            </div>
          </div>

          {/* Overlays */}
          <div className="flex flex-wrap gap-4">
            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-md">
              Note: Generation and AIL overlays show limited data for extended date ranges due to AESO API constraints.
            </div>
          </div>

          {/* Credit Settings */}
          <CreditSettingsPanel
            settings={filters.creditSettings || defaultCreditSettings}
            onSettingsChange={(creditSettings) => onFiltersChange({ ...filters, creditSettings })}
          />

          {/* Apply Button */}
          <Button
            onClick={onApply}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading Data...' : 'Apply & Load Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
