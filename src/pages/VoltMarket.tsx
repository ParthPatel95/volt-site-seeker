
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VoltMarketLayout } from '@/components/voltmarket/VoltMarketLayout';
import { VoltMarketLandingPage } from '@/components/voltmarket/VoltMarketLandingPage';
import { VoltMarketHome } from '@/components/voltmarket/VoltMarketHome';
import { VoltMarketAuth } from '@/components/voltmarket/VoltMarketAuth';
import { VoltMarketListings } from '@/components/voltmarket/VoltMarketListings';
import { VoltMarketDashboard } from '@/components/voltmarket/VoltMarketDashboard';
import { VoltMarketProfile } from '@/components/voltmarket/VoltMarketProfile';
import { VoltMarketCreateListing } from '@/components/voltmarket/VoltMarketCreateListing';
import { VoltMarketListingDetail } from '@/components/voltmarket/VoltMarketListingDetail';
import { VoltMarketMessages } from '@/components/voltmarket/VoltMarketMessages';
import { VoltMarketWatchlist } from '@/components/voltmarket/VoltMarketWatchlist';
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
    <Routes>
      <Route path="/" element={<VoltMarketLandingPage />} />
      <Route path="/home" element={
        <VoltMarketLayout>
          <VoltMarketHome />
        </VoltMarketLayout>
      } />
      <Route path="/auth" element={
        <VoltMarketLayout>
          <VoltMarketAuth />
        </VoltMarketLayout>
      } />
      <Route path="/listings" element={
        <VoltMarketLayout>
          <VoltMarketListings />
        </VoltMarketLayout>
      } />
      <Route path="/listings/:id" element={
        <VoltMarketLayout>
          <VoltMarketListingDetail />
        </VoltMarketLayout>
      } />
      <Route path="/dashboard" element={
        <VoltMarketLayout>
          {user ? <VoltMarketDashboard /> : <VoltMarketAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/profile" element={
        <VoltMarketLayout>
          {user ? <VoltMarketProfile /> : <VoltMarketAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/create-listing" element={
        <VoltMarketLayout>
          {user ? <VoltMarketCreateListing /> : <VoltMarketAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/messages" element={
        <VoltMarketLayout>
          {user ? <VoltMarketMessages /> : <VoltMarketAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/watchlist" element={
        <VoltMarketLayout>
          {user ? <VoltMarketWatchlist /> : <VoltMarketAuth />}
        </VoltMarketLayout>
      } />
    </Routes>
  );
};
