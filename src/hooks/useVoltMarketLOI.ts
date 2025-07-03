
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

export interface LOIData {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offering_price: number;
  proposed_terms: string;
  due_diligence_period_days: number;
  contingencies?: string;
  financing_details?: string;
  closing_timeline: string;
  buyer_qualifications: string;
  additional_notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  updated_at: string;
  listing: {
    title: string;
    asking_price: number;
  };
  buyer: {
    company_name: string;
  };
}

export const useVoltMarketLOI = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const submitLOI = async (listingId: string, loiData: any) => {
    if (!profile) throw new Error('Not authenticated');

    setLoading(true);
    try {
      // Get listing details to find seller
      const { data: listing, error: listingError } = await supabase
        .from('voltmarket_listings')
        .select('seller_id, asking_price')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Create LOI record (mock implementation - would need actual table)
      const loiRecord = {
        listing_id: listingId,
        buyer_id: profile.id,
        seller_id: listing.seller_id,
        status: 'pending',
        ...loiData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // For now, we'll create a message with LOI details
      const { error: messageError } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: listing.seller_id,
          message: `LOI Submitted - Offering Price: $${loiData.offering_price.toLocaleString()}\n\nTerms: ${loiData.proposed_terms}\n\nBuyer Qualifications: ${loiData.buyer_qualifications}`,
          is_read: false
        });

      if (messageError) throw messageError;

      return { success: true };
    } catch (error) {
      console.error('Error submitting LOI:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitLOI,
    loading
  };
};
