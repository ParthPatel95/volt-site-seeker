
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

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
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
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

      // Create LOI record in the proper table
      const { data: loiRecord, error: loiError } = await supabase
        .from('voltmarket_lois')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: listing.seller_id,
          status: 'pending',
          offered_price: loiData.offering_price,
          conditions: loiData.proposed_terms,
          timeline_days: loiData.due_diligence_period_days,
          additional_notes: loiData.additional_notes,
        })
        .select()
        .single();

      if (loiError) throw loiError;

      return { success: true, data: loiRecord };
    } catch (error) {
      console.error('Error submitting LOI:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getLOIs = async () => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('voltmarket_lois')
        .select(`
          *,
          listing:voltmarket_listings(title, asking_price),
          buyer:voltmarket_profiles!buyer_id(company_name, phone_number, bio, website),
          seller:voltmarket_profiles!seller_id(company_name, phone_number, bio, website)
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Add type field to determine if received or sent
      const loisWithType = (data || []).map(loi => ({
        ...loi,
        type: loi.seller_id === profile.id ? 'received' : 'sent'
      }));
      
      return loisWithType;
    } catch (error) {
      console.error('Error fetching LOIs:', error);
      return [];
    }
  };

  const updateLOIStatus = async (loiId: string, status: 'accepted' | 'rejected' | 'pending') => {
    if (!profile) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('voltmarket_lois')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('id', loiId)
        .eq('seller_id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating LOI status:', error);
      throw error;
    }
  };

  return {
    submitLOI,
    getLOIs,
    updateLOIStatus,
    loading
  };
};
