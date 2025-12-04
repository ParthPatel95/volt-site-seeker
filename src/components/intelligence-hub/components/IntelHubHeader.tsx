
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Download, Activity, Zap, Building2, Bell } from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';

export function IntelHubHeader() {
  const { state } = useIntelligenceHub();
  const { opportunities, alerts, scanStats, isScanning } = state;

  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const totalMW = scanStats?.totalMW || opportunities.reduce((sum, o) => sum + (o.metrics.powerCapacityMW || 0), 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Intelligence Hub</h1>
            <p className="text-sm text-muted-foreground">Unified site & company intelligence platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${isScanning ? 'bg-green-500/10 text-green-600 border-green-500/30 animate-pulse' : 'bg-muted text-muted-foreground'}`}
          >
            <Activity className="w-3 h-3 mr-1" />
            {isScanning ? 'Scanning...' : 'Ready'}
          </Badge>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Building2}
          label="Sites Found"
          value={opportunities.length}
          color="blue"
        />
        <StatCard
          icon={Zap}
          label="Total Capacity"
          value={`${totalMW.toFixed(0)} MW`}
          color="yellow"
        />
        <StatCard
          icon={Brain}
          label="Distressed"
          value={scanStats?.distressedCompanies || opportunities.filter(o => o.type === 'distressed_company').length}
          color="red"
        />
        <StatCard
          icon={Bell}
          label="Active Alerts"
          value={unreadAlerts}
          color="purple"
          highlight={unreadAlerts > 0}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'yellow' | 'red' | 'purple' | 'green';
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, color, highlight }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    red: 'bg-red-500/10 text-red-600',
    purple: 'bg-purple-500/10 text-purple-600',
    green: 'bg-green-500/10 text-green-600'
  };

  return (
    <div className={`bg-muted/50 rounded-lg p-3 sm:p-4 ${highlight ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
