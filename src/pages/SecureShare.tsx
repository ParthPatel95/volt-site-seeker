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
    <div className="min-h-screen bg-gradient-to-br from-background via-watt-light/5 to-background">
      {/* Enhanced Header */}
      <div className="border-b border-border bg-gradient-to-r from-card/80 via-watt-primary/5 to-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container-responsive py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-gradient-to-br from-watt-primary to-watt-secondary shadow-watt-glow animate-glow">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-watt-primary to-watt-secondary bg-clip-text text-transparent">
                  Secure Share
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Share documents securely with investors and partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 h-auto p-1 bg-gradient-to-r from-watt-primary/10 via-watt-secondary/10 to-watt-primary/10 backdrop-blur-sm shadow-lg">
            <TabsTrigger 
              value="documents" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="links" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Links
            </TabsTrigger>
            <TabsTrigger 
              value="bundles" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              Bundles
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all col-span-2 xs:col-span-1"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all col-span-2 xs:col-span-1 sm:col-span-1"
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
