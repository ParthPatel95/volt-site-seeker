import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VoltMarketLayout } from '@/components/voltmarket/VoltMarketLayout';
import { VoltMarketHomepage } from '@/components/voltmarket/VoltMarketHomepage';
import { WattbytesAuth } from '@/components/voltmarket/WattbytesAuth';
import { VoltMarketListings } from '@/components/voltmarket/VoltMarketListings';
import { VoltMarketDashboard } from '@/components/voltmarket/VoltMarketDashboard';
import { VoltMarketProfile } from '@/components/voltmarket/VoltMarketProfile';
import { VoltMarketCreateListing } from '@/components/voltmarket/VoltMarketCreateListing';
import { VoltMarketEditListing } from '@/components/voltmarket/VoltMarketEditListing';
import { VoltMarketListingDetail } from '@/components/voltmarket/VoltMarketListingDetail';
import { VoltMarketMessages } from '@/components/voltmarket/VoltMarketMessages';
import { VoltMarketEnhancedMessages } from '@/components/voltmarket/VoltMarketEnhancedMessages';
import { VoltMarketWatchlist } from '@/components/voltmarket/VoltMarketWatchlist';
import { VoltMarketVerificationCenter } from '@/components/voltmarket/VoltMarketVerificationCenter';

import { VoltMarketAdvancedSearch } from '@/components/voltmarket/VoltMarketAdvancedSearch';
import { VoltMarketNotificationCenter } from '@/components/voltmarket/VoltMarketNotificationCenter';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { VoltMarketQATest } from '@/components/voltmarket/VoltMarketQATest';
import { VoltMarketDocumentCenter } from '@/components/voltmarket/VoltMarketDocumentCenter';
import { VoltMarketAdvancedPortfolio } from '@/components/voltmarket/VoltMarketAdvancedPortfolio';
import { VoltMarketLOICenter } from '@/components/voltmarket/VoltMarketLOICenter';
import { VoltMarketDueDiligenceCenter } from '@/components/voltmarket/VoltMarketDueDiligenceCenter';
import { VoltMarketContactMessages } from '@/components/voltmarket/VoltMarketContactMessages';
import { VoltMarketDocumentRequests } from '@/components/voltmarket/VoltMarketDocumentRequests';
import { VoltMarketInvestmentCalculator } from '@/components/voltmarket/VoltMarketInvestmentCalculator';
import { VoltMarketMarketReports } from '@/components/voltmarket/VoltMarketMarketReports';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      <Route path="/documents" element={
        <VoltMarketLayout>
          {user ? <VoltMarketDocumentCenter /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/portfolio" element={
        <VoltMarketLayout>
          {user ? <VoltMarketAdvancedPortfolio /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/loi-center" element={
        <VoltMarketLayout>
          {user ? <VoltMarketLOICenter /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/due-diligence" element={
        <VoltMarketLayout>
          {user ? <VoltMarketDueDiligenceCenter /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/profile" element={
        <VoltMarketLayout>
          {user && !loading ? <VoltMarketProfile /> : (!loading ? <WattbytesAuth /> : <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>)}
        </VoltMarketLayout>
      } />
      <Route path="/verification" element={
        <VoltMarketLayout>
          {user && !loading ? <VoltMarketVerificationCenter /> : (!loading ? <WattbytesAuth /> : <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>)}
        </VoltMarketLayout>
      } />
      <Route path="/create-listing" element={
        <VoltMarketLayout>
          {user ? <VoltMarketCreateListing /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/edit-listing/:id" element={
        <VoltMarketLayout>
          {user ? <VoltMarketEditListing /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/contact-messages" element={
        <VoltMarketLayout>
          {user ? <VoltMarketContactMessages /> : <WattbytesAuth />}
        </VoltMarketLayout>
      } />
      <Route path="/document-requests" element={
        <VoltMarketLayout>
          {user ? <VoltMarketDocumentRequests /> : <WattbytesAuth />}
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
      <Route path="/calculator" element={
        <VoltMarketLayout>
          <VoltMarketInvestmentCalculator />
        </VoltMarketLayout>
      } />
      <Route path="/reports" element={
        <VoltMarketLayout>
          <VoltMarketMarketReports />
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
