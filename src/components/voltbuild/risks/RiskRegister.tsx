import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnhancedRisk, RiskFilters, RiskStatus, RiskCategory } from './types/voltbuild-risks.types';
import { 
  getRiskLevel, 
  getRiskLevelColor, 
  STATUS_CONFIG, 
  CATEGORY_CONFIG, 
  PROBABILITY_CONFIG, 
  IMPACT_CONFIG 
} from './types/voltbuild-risks.types';

interface RiskRegisterProps {
  risks: EnhancedRisk[];
  filters: RiskFilters;
  onFiltersChange: (filters: RiskFilters) => void;
  onRiskClick: (risk: EnhancedRisk) => void;
  onStatusChange: (riskId: string, status: RiskStatus) => void;
  onDeleteRisk: (riskId: string) => void;
}

export function RiskRegister({ 
  risks, 
  filters, 
  onFiltersChange, 
  onRiskClick,
  onStatusChange,
  onDeleteRisk
}: RiskRegisterProps) {
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'risk_score' | 'title' | 'created_at'>('risk_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleExpand = (riskId: string) => {
    setExpandedRisks(prev => {
      const next = new Set(prev);
      if (next.has(riskId)) {
        next.delete(riskId);
      } else {
        next.add(riskId);
      }
      return next;
    });
  };

  const sortedRisks = [...risks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'risk_score') {
      comparison = a.risk_score - b.risk_score;
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sortDir === 'desc' ? -comparison : comparison;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Risk Register</CardTitle>
          <Badge variant="outline">{risks.length} risks</Badge>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search risks..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(['open', 'mitigated', 'closed'] as RiskStatus[]).map(status => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => {
                    const current = filters.status || [];
                    const next = current.includes(status)
                      ? current.filter(s => s !== status)
                      : [...current, status];
                    onFiltersChange({ ...filters, status: next.length ? next : undefined });
                  }}
                >
                  <span className={cn(
                    'w-2 h-2 rounded-full mr-2',
                    status === 'open' && 'bg-red-500',
                    status === 'mitigated' && 'bg-yellow-500',
                    status === 'closed' && 'bg-muted-foreground'
                  )} />
                  {STATUS_CONFIG[status].label}
                  {filters.status?.includes(status) && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={filters.showCriticalOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, showCriticalOnly: !filters.showCriticalOnly })}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Critical Only
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Risk</div>
          <button 
            className="col-span-2 flex items-center gap-1 hover:text-foreground"
            onClick={() => handleSort('risk_score')}
          >
            Score {sortField === 'risk_score' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Risk Rows */}
        <div className="divide-y">
          {sortedRisks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No risks found</p>
              {(filters.searchTerm || filters.status?.length || filters.showCriticalOnly) && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => onFiltersChange({})}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            sortedRisks.map(risk => {
              const level = getRiskLevel(risk.risk_score);
              const isExpanded = expandedRisks.has(risk.id);
              
              return (
                <div key={risk.id} className="hover:bg-muted/30 transition-colors">
                  {/* Main Row */}
                  <div 
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer"
                    onClick={() => toggleExpand(risk.id)}
                  >
                    <div className="col-span-12 md:col-span-4 flex items-start gap-2">
                      <button className="mt-0.5 text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{risk.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{risk.owner || 'Unassigned'}</p>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 items-center gap-2">
                      <Badge className={cn('text-xs', getRiskLevelColor(level))}>
                        {risk.risk_score}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{level}</span>
                    </div>
                    
                    <div className="hidden md:block col-span-2">
                      {risk.category ? (
                        <span className="text-xs capitalize">{risk.category.replace('_', ' ')}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    
                    <div className="hidden md:block col-span-2">
                      <Badge 
                        variant="outline"
                        className={cn(
                          'text-xs',
                          risk.status === 'open' && 'border-red-500/50 text-red-600 dark:text-red-400',
                          risk.status === 'mitigated' && 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
                          risk.status === 'closed' && 'border-muted-foreground/50'
                        )}
                      >
                        {STATUS_CONFIG[risk.status].label}
                      </Badge>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRiskClick(risk); }}>
                            View Details
                          </DropdownMenuItem>
                          {risk.status !== 'mitigated' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(risk.id, 'mitigated'); }}>
                              Mark as Mitigated
                            </DropdownMenuItem>
                          )}
                          {risk.status !== 'closed' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(risk.id, 'closed'); }}>
                              Close Risk
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDeleteRisk(risk.id); }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-10 space-y-2 bg-muted/20">
                      {risk.description && (
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Probability:</span>{' '}
                          <span className="font-medium">{PROBABILITY_CONFIG[risk.probability].label}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impact:</span>{' '}
                          <span className="font-medium">{IMPACT_CONFIG[risk.impact].label}</span>
                        </div>
                        {risk.estimated_cost_impact && (
                          <div>
                            <span className="text-muted-foreground">Cost Impact:</span>{' '}
                            <span className="font-medium">${risk.estimated_cost_impact.toLocaleString()}</span>
                          </div>
                        )}
                        {risk.estimated_days_delay && (
                          <div>
                            <span className="text-muted-foreground">Delay Risk:</span>{' '}
                            <span className="font-medium">{risk.estimated_days_delay} days</span>
                          </div>
                        )}
                      </div>
                      
                      {risk.mitigation_plan && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Mitigation:</span>{' '}
                          <span>{risk.mitigation_plan}</span>
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onRiskClick(risk); }}
                        >
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
