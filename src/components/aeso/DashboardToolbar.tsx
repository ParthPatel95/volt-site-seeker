import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Bell, FileText, Download, BarChart3, Calculator, Smartphone, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardSettingsDialog } from './DashboardSettingsDialog';

interface DashboardToolbarProps {
  dashboardId: string;
  market: 'aeso' | 'ercot';
  onExport?: () => void;
  onAlert?: () => void;
}

export function DashboardToolbar({ dashboardId, market, onExport, onAlert }: DashboardToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('general');

  const openSettings = (tab: string) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => openSettings('features')}
        >
          <Zap className="w-4 h-4 mr-2" />
          Features
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Analytics Tools</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openSettings('compare')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Comparative Analysis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('calculations')}>
              <Calculator className="w-4 h-4 mr-2" />
              Custom Calculations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard Analytics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Reports & Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openSettings('export')}>
              <Download className="w-4 h-4 mr-2" />
              Export Options
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('reports')}>
              <FileText className="w-4 h-4 mr-2" />
              Scheduled Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('builder')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Report Builder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => openSettings('alerts')}
        >
          <Bell className="w-4 h-4 mr-2" />
          Alerts
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Advanced Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openSettings('widgets')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Widget Library
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('performance')}>
              <Zap className="w-4 h-4 mr-2" />
              Performance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('mobile')}>
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Experience
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettings('api')}>
              <FileText className="w-4 h-4 mr-2" />
              API Access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DashboardSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        dashboardId={dashboardId}
        market={market}
        defaultTab={settingsTab}
      />
    </>
  );
}
