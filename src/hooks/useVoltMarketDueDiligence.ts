import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

export interface DueDiligenceReport {
  id: string;
  company_id?: string;
  listing_id?: string;
  report_type: string;
  executive_summary?: string;
  financial_analysis?: any;
  power_infrastructure_assessment?: any;
  risk_assessment?: any;
  valuation_analysis?: any;
  report_data?: any;
  recommendations?: string[];
  generated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DueDiligenceTask {
  id: string;
  listing_id: string;
  task_type: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  completion_notes?: string;
  attachments?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useVoltMarketDueDiligence = () => {
  const { profile } = useVoltMarketAuth();
  const [loading, setLoading] = useState(false);

  const getDueDiligenceReports = async () => {
    if (!profile) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching due diligence reports:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDueDiligenceTasks = async () => {
    if (!profile) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voltmarket_due_diligence_tasks')
        .select(`
          *,
          listing:voltmarket_listings(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching due diligence tasks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createDueDiligenceReport = async (reportData: {
    listing_id?: string;
    company_id?: string;
    report_type: string;
    executive_summary?: string;
    financial_analysis?: any;
    power_infrastructure_assessment?: any;
    risk_assessment?: any;
    valuation_analysis?: any;
    recommendations?: string[];
  }) => {
    if (!profile) throw new Error('Not authenticated');

    try {
      setLoading(true);
      
      // Create a proper insert object based on the table schema
      const insertData: any = {
        ...reportData,
        company_id: reportData.company_id || null,
        report_data: {
          status: 'in_progress',
          completion_percentage: 0,
          sections: {
            financial: { status: 'pending', score: null },
            technical: { status: 'pending', score: null },
            legal: { status: 'pending', score: null },
            environmental: { status: 'pending', score: null },
            market: { status: 'pending', score: null }
          }
        }
      };

      const { data, error } = await supabase
        .from('due_diligence_reports')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Simulate report generation progress
      setTimeout(() => {
        simulateReportProgress(data.id);
      }, 2000);

      return { success: true, data };
    } catch (error) {
      console.error('Error creating due diligence report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const simulateReportProgress = async (reportId: string) => {
    try {
      // Phase 1: Start financial analysis (20%)
      await supabase
        .from('due_diligence_reports')
        .update({
          report_data: {
            status: 'in_progress',
            completion_percentage: 20,
            sections: {
              financial: { status: 'completed', score: 85 },
              technical: { status: 'pending', score: null },
              legal: { status: 'pending', score: null },
              environmental: { status: 'pending', score: null },
              market: { status: 'pending', score: null }
            }
          }
        })
        .eq('id', reportId);

      // Phase 2: Complete technical analysis (40%)
      setTimeout(async () => {
        await supabase
          .from('due_diligence_reports')
          .update({
            report_data: {
              status: 'in_progress',
              completion_percentage: 40,
              sections: {
                financial: { status: 'completed', score: 85 },
                technical: { status: 'completed', score: 92 },
                legal: { status: 'pending', score: null },
                environmental: { status: 'pending', score: null },
                market: { status: 'pending', score: null }
              }
            }
          })
          .eq('id', reportId);
      }, 3000);

      // Phase 3: Complete legal analysis (60%)
      setTimeout(async () => {
        await supabase
          .from('due_diligence_reports')
          .update({
            report_data: {
              status: 'in_progress',
              completion_percentage: 60,
              sections: {
                financial: { status: 'completed', score: 85 },
                technical: { status: 'completed', score: 92 },
                legal: { status: 'completed', score: 78 },
                environmental: { status: 'pending', score: null },
                market: { status: 'pending', score: null }
              }
            }
          })
          .eq('id', reportId);
      }, 6000);

      // Phase 4: Complete environmental analysis (80%)
      setTimeout(async () => {
        await supabase
          .from('due_diligence_reports')
          .update({
            report_data: {
              status: 'in_progress',
              completion_percentage: 80,
              sections: {
                financial: { status: 'completed', score: 85 },
                technical: { status: 'completed', score: 92 },
                legal: { status: 'completed', score: 78 },
                environmental: { status: 'completed', score: 88 },
                market: { status: 'pending', score: null }
              }
            }
          })
          .eq('id', reportId);
      }, 9000);

      // Phase 5: Complete market analysis and finalize (100%)
      setTimeout(async () => {
        const sampleAnalysis = {
          financial_metrics: {
            revenue: 125000000,
            ebitda: 32500000,
            debt_to_equity: 0.65,
            current_ratio: 1.8,
            roi_projection: 0.185
          },
          risk_factors: [
            'Regulatory compliance requirements',
            'Market volatility exposure',
            'Technology upgrade needs'
          ],
          opportunities: [
            'Power efficiency improvements',
            'Market expansion potential',
            'Technology modernization benefits'
          ]
        };

        await supabase
          .from('due_diligence_reports')
          .update({
            report_data: {
              status: 'completed',
              completion_percentage: 100,
              sections: {
                financial: { status: 'completed', score: 85 },
                technical: { status: 'completed', score: 92 },
                legal: { status: 'completed', score: 78 },
                environmental: { status: 'completed', score: 88 },
                market: { status: 'completed', score: 82 }
              }
            },
            financial_analysis: sampleAnalysis,
            risk_assessment: {
              overall_risk: 'medium',
              risk_score: 65,
              key_risks: sampleAnalysis.risk_factors
            },
            valuation_analysis: {
              estimated_value: 45000000,
              valuation_method: 'DCF + Comparable Analysis',
              confidence_level: 'High'
            },
            recommendations: [
              'Proceed with acquisition subject to technical due diligence',
              'Negotiate price reduction based on identified risks',
              'Plan for immediate infrastructure upgrades'
            ]
          })
          .eq('id', reportId);
      }, 12000);

    } catch (error) {
      console.error('Error simulating report progress:', error);
    }
  };

  const updateDueDiligenceReport = async (reportId: string, updates: Partial<DueDiligenceReport>) => {
    if (!profile) throw new Error('Not authenticated');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating due diligence report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDueDiligenceTask = async (taskData: {
    listing_id: string;
    task_type: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assigned_to?: string;
    due_date?: string;
  }) => {
    if (!profile) throw new Error('Not authenticated');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voltmarket_due_diligence_tasks')
        .insert({
          ...taskData,
          created_by: profile.id,
          status: 'pending',
          priority: taskData.priority || 'medium'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating due diligence task:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDueDiligenceTask = async (taskId: string, updates: Partial<DueDiligenceTask>) => {
    if (!profile) throw new Error('Not authenticated');

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voltmarket_due_diligence_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating due diligence task:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getListings = async () => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select('id, title, location, power_capacity_mw, asking_price, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  };

  return {
    loading,
    getDueDiligenceReports,
    getDueDiligenceTasks,
    createDueDiligenceReport,
    updateDueDiligenceReport,
    createDueDiligenceTask,
    updateDueDiligenceTask,
    getListings
  };
};