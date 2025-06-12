
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PropertyMap } from '@/components/PropertyMap';
import { PropertyList } from '@/components/PropertyList';
import { AlertsPanel } from '@/components/AlertsPanel';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <PropertyMap />;
      case 'properties':
        return <PropertyList />;
      case 'alerts':
        return <AlertsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
