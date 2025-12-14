import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, FileText, Link as LinkIcon, Package, 
  BarChart3, Settings, Menu, X, ChevronRight,
  Upload, Plus, Activity
} from 'lucide-react';
import { DocumentsTab } from '@/components/secure-share/DocumentsTab';
import { LinksManagement } from '@/components/secure-share/LinksManagement';
import { BundlesTab } from '@/components/secure-share/BundlesTab';
import { AnalyticsTab } from '@/components/secure-share/AnalyticsTab';
import { SettingsTab } from '@/components/secure-share/SettingsTab';
import { useRealTimeViewerTracking } from '@/hooks/useRealTimeViewerTracking';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'bundles', label: 'Bundles', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SecureShare() {
  const [activeTab, setActiveTab] = useState('documents');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalActiveViewers } = useRealTimeViewerTracking();

  // Quick stats
  const { data: quickStats } = useQuery({
    queryKey: ['secure-share-quick-stats'],
    queryFn: async () => {
      const [{ count: docCount }, { count: linkCount }, { count: bundleCount }] = await Promise.all([
        supabase.from('secure_documents').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('secure_links').select('*', { count: 'exact', head: true }),
        supabase.from('document_bundles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      return {
        documents: docCount || 0,
        links: linkCount || 0,
        bundles: bundleCount || 0,
      };
    },
  });

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'documents': return quickStats?.documents;
      case 'links': return quickStats?.links;
      case 'bundles': return quickStats?.bundles;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Secure Share</span>
            </div>
          </div>
          {totalActiveViewers > 0 && (
            <Badge className="gap-1 bg-green-500/20 text-green-600 animate-pulse">
              <Activity className="w-3 h-3" />
              {totalActiveViewers} live
            </Badge>
          )}
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 sm:p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-40 transition" />
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80">
                      <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">Secure Share</h1>
                    <p className="text-xs text-muted-foreground">Document sharing</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Live Indicator */}
              {totalActiveViewers > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-600">
                      {totalActiveViewers} viewer{totalActiveViewers !== 1 ? 's' : ''} online
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const count = getTabCount(item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {count !== null && count !== undefined && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"}
                        className={cn(
                          "h-5 px-1.5 text-xs",
                          isActive && "bg-primary-foreground/20 text-primary-foreground border-0"
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-border/50 space-y-2">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Create Link
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block sticky top-0 z-30 border-b border-border/50 bg-card/95 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Secure Share</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-foreground capitalize">{activeTab}</span>
              </div>
              {totalActiveViewers > 0 && (
                <Badge className="gap-1 bg-green-500/20 text-green-600 animate-pulse">
                  <Activity className="w-3 h-3" />
                  {totalActiveViewers} viewer{totalActiveViewers !== 1 ? 's' : ''} online
                </Badge>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'links' && <LinksManagement />}
            {activeTab === 'bundles' && <BundlesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
