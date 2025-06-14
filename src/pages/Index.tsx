
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { PropertyList } from '@/components/PropertyList';
import { MultiSourceScraper } from '@/components/MultiSourceScraper';
import { EnergyRateIntelligence } from '@/components/energy/EnergyRateIntelligence';
import { CorporateIntelligence } from '@/components/CorporateIntelligence';
import { PowerInfrastructure } from '@/components/PowerInfrastructure';
import { DataManagement } from '@/components/DataManagement';

export default function Index() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/scraper" element={<MultiSourceScraper />} />
          <Route path="/energy-rates" element={<EnergyRateIntelligence />} />
          <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
          <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
          <Route path="/data-management" element={<DataManagement />} />
        </Routes>
      </main>
    </div>
  );
}
