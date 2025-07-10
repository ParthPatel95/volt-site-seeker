
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

interface Verification {
  id: string;
  user_id: string;
  verification_type: 'id_document' | 'business_license' | 'utility_bill' | 'bank_statement';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export const useVoltMarketVerification = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const uploadVerificationDocument = async (file: File, verificationType: string) => {
    if (!profile) throw new Error('Must be logged in');

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${verificationType}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const submitVerification = async (verificationType: string, file: File) => {
    if (!profile) throw new Error('Must be logged in');

    setLoading(true);
    try {
      const documentUrl = await uploadVerificationDocument(file, verificationType);

      const { data, error } = await supabase
        .from('voltmarket_verifications')
        .insert({
          user_id: profile.id,
          verification_type: verificationType,
          document_url: documentUrl
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getVerifications = async () => {
    if (!profile) return { data: null, error: 'Not logged in' };

    try {
      const { data, error } = await supabase
        .from('voltmarket_verifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    loading,
    submitVerification,
    getVerifications
  };
};
