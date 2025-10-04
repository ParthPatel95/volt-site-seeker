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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Secure Share</h1>
              <p className="text-muted-foreground">
                Share documents securely with investors and partners
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[800px] grid-cols-5">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
