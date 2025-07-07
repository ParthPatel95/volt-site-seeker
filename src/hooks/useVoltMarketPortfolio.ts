import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  portfolio_type: 'investment' | 'development' | 'trading' | 'research';
  total_value: number;
  target_allocation: Record<string, number>;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
  created_at: string;
  updated_at: string;
  metrics?: {
    totalItems: number;
    totalAcquisitionValue: number;
    totalCurrentValue: number;
    totalReturn: number;
    returnPercentage: number;
    activeItems: number;
  };
}

interface PortfolioItem {
  id: string;
  portfolio_id: string;
  listing_id?: string;
  item_type: 'listing' | 'investment' | 'opportunity' | 'research';
  name: string;
  acquisition_price?: number;
  current_value?: number;
  acquisition_date?: string;
  status: 'active' | 'sold' | 'under_contract' | 'monitoring';
  notes?: string;
  metadata: Record<string, any>;
  added_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    asking_price: number;
    location: string;
    power_capacity_mw: number;
  };
}

export const useVoltMarketPortfolio = () => {
  const { profile } = useVoltMarketAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPortfolios = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (portfolioData: {
    name: string;
    description?: string;
    portfolioType: 'investment' | 'development' | 'trading' | 'research';
    targetAllocation?: Record<string, number>;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
  }) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: { ...portfolioData, action: 'create' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      
      await fetchPortfolios();
      return data.portfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  };

  const addPortfolioItem = async (itemData: {
    portfolioId: string;
    listingId?: string;
    itemType: 'listing' | 'investment' | 'opportunity' | 'research';
    name: string;
    acquisitionPrice?: number;
    currentValue?: number;
    acquisitionDate?: string;
    notes?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: { ...itemData, action: 'add-item' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      
      await fetchPortfolios();
      return data.item;
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      throw error;
    }
  };

  const getPortfolioItems = async (portfolioId: string): Promise<PortfolioItem[]> => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: { portfolioId, action: 'items' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      return data.items || [];
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      return [];
    }
  };

  const analyzePortfolio = async (portfolioId: string) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: { portfolioId, action: 'analyze' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      return data.analytics;
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw error;
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      const { error } = await supabase.functions.invoke('voltmarket-portfolio-management', {
        body: { portfolioId, action: 'delete' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      
      await fetchPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchPortfolios();
    }
  }, [profile]);

  return {
    portfolios,
    loading,
    fetchPortfolios,
    createPortfolio,
    addPortfolioItem,
    getPortfolioItems,
    analyzePortfolio,
    deletePortfolio
  };
};