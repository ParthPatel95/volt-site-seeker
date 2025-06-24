
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, StoredIntelResult } from './types';

export async function saveIntelResults(
  opportunities: Opportunity[], 
  scanSessionId?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const resultsToInsert = opportunities.map(opportunity => ({
      scan_session_id: scanSessionId,
      opportunity_type: opportunity.type,
      name: opportunity.name,
      address: opportunity.address,
      city: opportunity.city,
      state: opportunity.state,
      zip_code: opportunity.zipCode,
      coordinates: opportunity.coordinates ? `(${opportunity.coordinates[1]},${opportunity.coordinates[0]})` : null,
      estimated_power_mw: opportunity.estimatedPowerMW,
      distress_score: opportunity.distressScore,
      ai_insights: opportunity.aiInsights,
      data_sources: opportunity.sources,
      opportunity_details: opportunity.opportunityDetails || {},
      status: opportunity.status,
      created_by: user.id
    }));

    const { error } = await supabase
      .from('industry_intel_results')
      .insert(resultsToInsert);

    if (error) {
      console.error('Error saving intel results:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveIntelResults:', error);
    return false;
  }
}

export async function getStoredIntelResults(): Promise<StoredIntelResult[]> {
  try {
    const { data, error } = await supabase
      .from('industry_intel_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching intel results:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStoredIntelResults:', error);
    return [];
  }
}

export async function updateIntelResultStatus(
  id: string, 
  status: 'active' | 'closed' | 'monitoring'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('industry_intel_results')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating intel result status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateIntelResultStatus:', error);
    return false;
  }
}

export async function deleteIntelResult(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('industry_intel_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting intel result:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteIntelResult:', error);
    return false;
  }
}
