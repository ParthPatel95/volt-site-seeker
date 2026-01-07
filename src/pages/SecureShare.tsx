import { useState } from 'react';
import { DocumentsTab } from '@/components/secure-share/DocumentsTab';
import { LinksManagement } from '@/components/secure-share/LinksManagement';
import { BundlesTab } from '@/components/secure-share/BundlesTab';
import { AnalyticsTab } from '@/components/secure-share/AnalyticsTab';
import { SettingsTab } from '@/components/secure-share/SettingsTab';
import { ViewerTrackingProvider, useViewerTracking } from '@/contexts/ViewerTrackingContext';
import { SecureShareLayout, SecureShareView } from '@/components/secure-share/layout/SecureShareLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function SecureShareContent() {
  const [activeTab, setActiveTab] = useState<SecureShareView>('documents');
  const { totalActiveViewers } = useViewerTracking();

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

  const handleUploadDocument = () => {
    setActiveTab('documents');
    // The DocumentsTab has its own upload functionality
  };

  const handleCreateLink = () => {
    setActiveTab('links');
    // The LinksManagement has its own create link functionality
  };

  return (
    <SecureShareLayout
      currentView={activeTab}
      onViewChange={setActiveTab}
      documentCount={quickStats?.documents}
      linkCount={quickStats?.links}
      bundleCount={quickStats?.bundles}
      activeViewers={totalActiveViewers}
      onUploadDocument={handleUploadDocument}
      onCreateLink={handleCreateLink}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'links' && <LinksManagement />}
        {activeTab === 'bundles' && <BundlesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </SecureShareLayout>
  );
}

export default function SecureShare() {
  return (
    <ViewerTrackingProvider>
      <SecureShareContent />
    </ViewerTrackingProvider>
  );
}
