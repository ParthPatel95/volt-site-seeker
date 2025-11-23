import { useState } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, MapPin, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function SupplyChainPanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const isMobile = useIsMobile();

  const analyzeSupplyChain = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="Supply Chain Analysis"
        icon={Truck}
        priority="high"
        loading={loading}
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && analyzeSupplyChain()}
              className="flex-1"
            />
            <Button 
              onClick={analyzeSupplyChain} 
              disabled={loading}
              className={isMobile ? 'w-full' : ''}
            >
              {loading ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {analyzed && (
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
              <EnhancedCard
                title="Critical Dependencies"
                icon={MapPin}
                priority="high"
                className="border-destructive/20"
              >
                <div className="space-y-3">
                  <Badge variant="destructive" className="text-xs mb-2">
                    High Risk
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span className="text-foreground">Semiconductor components (Asia-Pacific: 78%)</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span className="text-foreground">Raw materials (Single supplier: 45%)</span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard
                title="Risk Assessment"
                icon={AlertTriangle}
                priority="medium"
                className="border-warning/20"
              >
                <div className="space-y-3">
                  <Badge variant="outline" className="text-xs mb-2 border-warning text-warning-foreground">
                    Medium Risk
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-warning" />
                      <span className="text-foreground">Geographic concentration risk</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-warning" />
                      <span className="text-foreground">Single points of failure identified</span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
}
