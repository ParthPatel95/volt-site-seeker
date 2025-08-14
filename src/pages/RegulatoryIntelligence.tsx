import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, AlertCircle, TrendingUp, Calendar, Filter, RefreshCw } from 'lucide-react';

interface RegulatoryUpdate {
  id: string;
  jurisdiction: string;
  agency: string;
  update_type: string;
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_sectors: string[];
  effective_date: string;
  created_at: string;
}

interface ImpactAnalysis {
  totalUpdates: number;
  impactBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  sectorsAffected: string[];
  upcomingChanges: Array<{
    title: string;
    effectiveDate: string;
    impact: string;
  }>;
  riskAssessment: string;
}

export default function RegulatoryIntelligence() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    jurisdiction: '',
    agency: '',
    updateType: '',
    impactLevel: ''
  });
  const { toast } = useToast();

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('regulatory-intelligence', {
        body: { 
          action: 'get_updates',
          ...filters
        }
      });

      if (error) throw error;
      setUpdates(data.updates || []);
    } catch (error) {
      console.error('Error fetching regulatory updates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch regulatory updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scanForUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('regulatory-intelligence', {
        body: { 
          action: 'scan_updates',
          jurisdiction: filters.jurisdiction || 'Texas'
        }
      });

      if (error) throw error;
      
      toast({
        title: "Scan Complete",
        description: `Found ${data.updates?.length || 0} new regulatory updates`,
      });
      
      await fetchUpdates();
    } catch (error) {
      console.error('Error scanning for updates:', error);
      toast({
        title: "Error",
        description: "Failed to scan for regulatory updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeImpact = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('regulatory-intelligence', {
        body: { 
          action: 'analyze_impact',
          jurisdiction: filters.jurisdiction || 'Texas'
        }
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Regulatory impact analysis updated",
      });
    } catch (error) {
      console.error('Error analyzing impact:', error);
      toast({
        title: "Error",
        description: "Failed to analyze regulatory impact",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Regulatory Intelligence System
              </h1>
              <p className="text-muted-foreground">
                Monitor regulatory changes and assess their impact on energy markets
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={analyzeImpact} disabled={loading} className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analyze Impact
              </Button>
              <Button onClick={scanForUpdates} disabled={loading} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Scan Updates
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={filters.jurisdiction} onValueChange={(value) => setFilters({...filters, jurisdiction: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Jurisdictions</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="Alberta">Alberta</SelectItem>
                  <SelectItem value="Federal">Federal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.agency} onValueChange={(value) => setFilters({...filters, agency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Agencies</SelectItem>
                  <SelectItem value="PUCT">PUCT</SelectItem>
                  <SelectItem value="AUC">AUC</SelectItem>
                  <SelectItem value="FERC">FERC</SelectItem>
                  <SelectItem value="ERCOT">ERCOT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.updateType} onValueChange={(value) => setFilters({...filters, updateType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Update Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="tariff">Tariff</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="rule">Rule</SelectItem>
                  <SelectItem value="filing">Filing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.impactLevel} onValueChange={(value) => setFilters({...filters, impactLevel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Impact Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4">
              <Button onClick={fetchUpdates} disabled={loading} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Regulatory Updates */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Regulatory Updates ({updates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : updates.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {updates.map((update) => (
                      <div key={update.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getImpactIcon(update.impact_level)}
                            <Badge className={getImpactColor(update.impact_level)}>
                              {update.impact_level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {update.update_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {update.jurisdiction} • {update.agency}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mb-2">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Effective: {new Date(update.effective_date).toLocaleDateString()}
                          </div>
                          <div>
                            Sectors: {update.affected_sectors?.join(', ') || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No regulatory updates found. Try scanning for new updates or adjusting your filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Impact Analysis */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.totalUpdates}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Updates
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Impact Breakdown</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Critical</span>
                          <span className="text-sm font-semibold text-red-600">{analysis.impactBreakdown.critical}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">High</span>
                          <span className="text-sm font-semibold text-orange-600">{analysis.impactBreakdown.high}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Medium</span>
                          <span className="text-sm font-semibold text-yellow-600">{analysis.impactBreakdown.medium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Low</span>
                          <span className="text-sm font-semibold text-green-600">{analysis.impactBreakdown.low}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Affected Sectors</div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.sectorsAffected.map((sector, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {analysis.upcomingChanges.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Upcoming Changes</div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {analysis.upcomingChanges.map((change, index) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded">
                              <div className="font-medium">{change.title}</div>
                              <div className="text-muted-foreground">{change.effectiveDate}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm font-medium mb-1">Risk Assessment</div>
                      <div className="text-xs text-muted-foreground">{analysis.riskAssessment}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Impact" to generate regulatory impact analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}