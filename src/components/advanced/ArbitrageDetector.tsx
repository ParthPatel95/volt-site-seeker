import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Clock, DollarSign, Zap, AlertCircle } from 'lucide-react';

interface ArbitrageOpportunity {
  id: string;
  market_from: string;
  market_to: string;
  price_spread: number;
  profit_potential: number;
  risk_adjusted_return: number;
  execution_window_start: string;
  execution_window_end: string;
  status: 'active' | 'expired' | 'executed';
}

export const ArbitrageDetector: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  const scanArbitrageOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trading-signals', {
        body: { action: 'detect_arbitrage' }
      });

      if (error) throw error;

      setOpportunities(data.opportunities || []);
      setLastUpdate(new Date().toLocaleString());
      
      toast({
        title: "Arbitrage Scan Complete",
        description: `Found ${data.opportunities?.length || 0} active opportunities`,
      });
    } catch (error) {
      console.error('Error scanning arbitrage opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to scan for arbitrage opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanArbitrageOpportunities();
    
    // Set up periodic scanning every 5 minutes
    const interval = setInterval(scanArbitrageOpportunities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'executed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Energy Arbitrage Detector</h2>
          <p className="text-muted-foreground">Real-time cross-market arbitrage opportunities</p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdate}</p>
          )}
        </div>
        <Button onClick={scanArbitrageOpportunities} disabled={loading} className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Scan Opportunities
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Active Arbitrage Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities.filter(opp => opp.status === 'active').length > 0 ? (
                <div className="space-y-4">
                  {opportunities.filter(opp => opp.status === 'active').map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(opportunity.status)}>
                          {opportunity.status.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeRemaining(opportunity.execution_window_end)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">From:</span>
                          <span className="font-semibold">{opportunity.market_from}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">To:</span>
                          <span className="font-semibold">{opportunity.market_to}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Price Spread</div>
                          <div className="font-semibold text-green-600">
                            ${opportunity.price_spread}/MWh
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Profit Potential</div>
                          <div className="font-semibold">
                            {formatCurrency(opportunity.profit_potential)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Risk-Adj Return</div>
                          <div className="font-semibold text-primary">
                            {opportunity.risk_adjusted_return}%
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Execute Trade
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active arbitrage opportunities found</p>
                  <p className="text-sm">Market spreads are currently minimal</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Market Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Opportunities:</span>
                    <span className="font-semibold text-green-600">
                      {opportunities.filter(opp => opp.status === 'active').length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Profit Potential:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        opportunities
                          .filter(opp => opp.status === 'active')
                          .reduce((sum, opp) => sum + opp.profit_potential, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Return:</span>
                    <span className="font-semibold text-primary">
                      {opportunities.length > 0 
                        ? Math.max(...opportunities.map(opp => opp.risk_adjusted_return)).toFixed(1)
                        : 0}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Spread:</span>
                    <span className="font-semibold">
                      ${opportunities.length > 0 
                        ? (opportunities.reduce((sum, opp) => sum + opp.price_spread, 0) / opportunities.length).toFixed(2)
                        : 0}/MWh
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Risk Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Arbitrage opportunities are time-sensitive and market-dependent</p>
                <p>• Transmission costs and losses reduce actual profits</p>
                <p>• Regulatory constraints may limit cross-border trading</p>
                <p>• Price volatility can eliminate spreads quickly</p>
                <p>• Consider transaction costs and execution delays</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};