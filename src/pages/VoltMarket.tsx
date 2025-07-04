import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VoltMarketLayout } from '@/components/voltmarket/VoltMarketLayout';
import { VoltMarketHomepage } from '@/components/voltmarket/VoltMarketHomepage';
import { WattbytesAuth } from '@/components/voltmarket/WattbytesAuth';
import { VoltMarketListings } from '@/components/voltmarket/VoltMarketListings';
import { VoltMarketDashboard } from '@/components/voltmarket/VoltMarketDashboard';
import { VoltMarketProfile } from '@/components/voltmarket/VoltMarketProfile';
import { VoltMarketCreateListing } from '@/components/voltmarket/VoltMarketCreateListing';
import { VoltMarketListingDetail } from '@/components/voltmarket/VoltMarketListingDetail';
import { VoltMarketMessages } from '@/components/voltmarket/VoltMarketMessages';
import { VoltMarketEnhancedMessages } from '@/components/voltmarket/VoltMarketEnhancedMessages';
import { VoltMarketWatchlist } from '@/components/voltmarket/VoltMarketWatchlist';
import { VoltMarketVerificationCenter } from '@/components/voltmarket/VoltMarketVerificationCenter';
import { VoltMarketAnalyticsDashboard } from '@/components/voltmarket/VoltMarketAnalyticsDashboard';
import { VoltMarketAdvancedSearch } from '@/components/voltmarket/VoltMarketAdvancedSearch';
import { VoltMarketNotificationCenter } from '@/components/voltmarket/VoltMarketNotificationCenter';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { VoltMarketQATest } from '@/components/voltmarket/VoltMarketQATest';

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
      <Route path="/" element={
        <VoltMarketLayout>
          <VoltMarketHomepage />
        </VoltMarketLayout>
      } />
      <Route path="/home" element={
        <VoltMarketLayout>
          <VoltMarketHomepage />
        </VoltMarketLayout>
      } />
      <Route path="/auth" element={<WattbytesAuth />} />
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
      <Route path="/search" element={
        <VoltMarketLayout>
          <VoltMarketAdvancedSearch />
        </VoltMarketLayout>
      } />
      <Route path="/dashboard" element={
        <VoltMarketLayout>
          {user ? <VoltMarketDashboard /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/analytics" element={
        <VoltMarketLayout>
          {user ? <VoltMarketAnalyticsDashboard /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/profile" element={
        <VoltMarketLayout>
          {user ? <VoltMarketProfile /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/verification" element={
        <VoltMarketLayout>
          {user ? <VoltMarketVerificationCenter /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/create-listing" element={
        <VoltMarketLayout>
          {user ? <VoltMarketCreateListing /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/messages" element={
        <VoltMarketLayout>
          {user ? <VoltMarketMessages /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/messages-enhanced" element={
        <VoltMarketLayout>
          {user ? <VoltMarketEnhancedMessages /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/notifications" element={
        <VoltMarketLayout>
          {user ? <VoltMarketNotificationCenter /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/watchlist" element={
        <VoltMarketLayout>
          {user ? <VoltMarketWatchlist /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/qa-test" element={
        <VoltMarketLayout>
          <VoltMarketQATest />
        </VoltMarketLayout>
      } />
    </Routes>
  );
};
