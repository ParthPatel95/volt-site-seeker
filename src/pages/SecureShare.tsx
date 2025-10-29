import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { DocumentsTab } from '@/components/secure-share/DocumentsTab';
import { LinksManagement } from '@/components/secure-share/LinksManagement';
import { BundlesTab } from '@/components/secure-share/BundlesTab';
import { AnalyticsTab } from '@/components/secure-share/AnalyticsTab';
import { SettingsTab } from '@/components/secure-share/SettingsTab';

export default function SecureShare() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-watt-primary/5">
      {/* Professional Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-sm">
        <div className="container-responsive py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-watt-primary to-watt-secondary rounded-xl blur opacity-25 group-hover:opacity-40 transition"></div>
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-watt-primary to-watt-secondary">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Secure Share
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Professional document sharing platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-muted/50 p-1 backdrop-blur-sm border border-border/50 overflow-x-auto w-full sm:w-auto">
            <TabsTrigger 
              value="documents" 
              className="text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="links" 
              className="text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md"
            >
              Links
            </TabsTrigger>
            <TabsTrigger 
              value="bundles" 
              className="text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md"
            >
              Bundles
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Secure Links</h2>
                <p className="text-muted-foreground">
                  Manage and track all secure share links
                </p>
              </div>
              <LinksManagement />
            </div>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            <BundlesTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
