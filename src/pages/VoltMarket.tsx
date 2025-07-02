
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VoltMarketLayout } from '@/components/voltmarket/VoltMarketLayout';
import { VoltMarketHome } from '@/components/voltmarket/VoltMarketHome';
import { VoltMarketAuth } from '@/components/voltmarket/VoltMarketAuth';
import { VoltMarketListings } from '@/components/voltmarket/VoltMarketListings';
import { VoltMarketDashboard } from '@/components/voltmarket/VoltMarketDashboard';
import { VoltMarketProfile } from '@/components/voltmarket/VoltMarketProfile';
import { VoltMarketCreateListing } from '@/components/voltmarket/VoltMarketCreateListing';
import { VoltMarketListingDetail } from '@/components/voltmarket/VoltMarketListingDetail';
import { VoltMarketMessages } from '@/components/voltmarket/VoltMarketMessages';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';

export const VoltMarket = () => {
  const { user, loading } = useVoltMarketAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <VoltMarketLayout>
      <Routes>
        <Route path="/" element={<VoltMarketHome />} />
        <Route path="/auth" element={<VoltMarketAuth />} />
        <Route path="/listings" element={<VoltMarketListings />} />
        <Route path="/listings/:id" element={<VoltMarketListingDetail />} />
        <Route path="/dashboard" element={user ? <VoltMarketDashboard /> : <VoltMarketAuth />} />
        <Route path="/profile" element={user ? <VoltMarketProfile /> : <VoltMarketAuth />} />
        <Route path="/create-listing" element={user ? <VoltMarketCreateListing /> : <VoltMarketAuth />} />
        <Route path="/messages" element={user ? <VoltMarketMessages /> : <VoltMarketAuth />} />
      </Routes>
    </VoltMarketLayout>
  );
};
