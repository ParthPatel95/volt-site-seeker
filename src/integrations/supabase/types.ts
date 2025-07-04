export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          additional_info: string | null
          company: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          platform_use: string
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          status: string
        }
        Insert: {
          additional_info?: string | null
          company: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          platform_use: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: string
          status?: string
        }
        Update: {
          additional_info?: string | null
          company?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          platform_use?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      ai_company_analysis: {
        Row: {
          acquisition_readiness: number | null
          analyzed_at: string
          company_name: string
          created_at: string
          distress_probability: number | null
          financial_outlook: string | null
          id: string
          investment_recommendation: string | null
          key_insights: string[] | null
          power_consumption_analysis: string | null
          risk_assessment: string | null
        }
        Insert: {
          acquisition_readiness?: number | null
          analyzed_at?: string
          company_name: string
          created_at?: string
          distress_probability?: number | null
          financial_outlook?: string | null
          id?: string
          investment_recommendation?: string | null
          key_insights?: string[] | null
          power_consumption_analysis?: string | null
          risk_assessment?: string | null
        }
        Update: {
          acquisition_readiness?: number | null
          analyzed_at?: string
          company_name?: string
          created_at?: string
          distress_probability?: number | null
          financial_outlook?: string | null
          id?: string
          investment_recommendation?: string | null
          key_insights?: string[] | null
          power_consumption_analysis?: string | null
          risk_assessment?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          property_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          property_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          property_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      btc_roi_calculations: {
        Row: {
          calculation_type: string
          created_at: string
          form_data: Json
          id: string
          network_data: Json
          results: Json
          site_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_type: string
          created_at?: string
          form_data: Json
          id?: string
          network_data: Json
          results: Json
          site_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_type?: string
          created_at?: string
          form_data?: Json
          id?: string
          network_data?: Json
          results?: Json
          site_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      city_power_analysis: {
        Row: {
          analysis_date: string
          available_capacity_mva: number
          average_load_factor: number
          city: string
          created_at: string
          energy_rate_estimate_per_mwh: number
          expansion_opportunities: Json | null
          generation_sources: Json | null
          grid_reliability_score: number
          id: string
          market_conditions: Json | null
          peak_demand_estimate_mw: number
          regulatory_environment: Json | null
          state: string
          total_substation_capacity_mva: number
          transmission_lines: Json | null
          updated_at: string
          utility_companies: Json | null
        }
        Insert: {
          analysis_date?: string
          available_capacity_mva: number
          average_load_factor: number
          city: string
          created_at?: string
          energy_rate_estimate_per_mwh: number
          expansion_opportunities?: Json | null
          generation_sources?: Json | null
          grid_reliability_score: number
          id?: string
          market_conditions?: Json | null
          peak_demand_estimate_mw: number
          regulatory_environment?: Json | null
          state: string
          total_substation_capacity_mva: number
          transmission_lines?: Json | null
          updated_at?: string
          utility_companies?: Json | null
        }
        Update: {
          analysis_date?: string
          available_capacity_mva?: number
          average_load_factor?: number
          city?: string
          created_at?: string
          energy_rate_estimate_per_mwh?: number
          expansion_opportunities?: Json | null
          generation_sources?: Json | null
          grid_reliability_score?: number
          id?: string
          market_conditions?: Json | null
          peak_demand_estimate_mw?: number
          regulatory_environment?: Json | null
          state?: string
          total_substation_capacity_mva?: number
          transmission_lines?: Json | null
          updated_at?: string
          utility_companies?: Json | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          analyzed_at: string
          created_at: string
          current_ratio: number | null
          debt_to_equity: number | null
          distress_signals: string[] | null
          financial_health_score: number | null
          id: string
          industry: string
          locations: Json | null
          market_cap: number | null
          name: string
          power_usage_estimate: number | null
          profit_margin: number | null
          revenue_growth: number | null
          sector: string
          ticker: string | null
          updated_at: string
        }
        Insert: {
          analyzed_at?: string
          created_at?: string
          current_ratio?: number | null
          debt_to_equity?: number | null
          distress_signals?: string[] | null
          financial_health_score?: number | null
          id?: string
          industry: string
          locations?: Json | null
          market_cap?: number | null
          name: string
          power_usage_estimate?: number | null
          profit_margin?: number | null
          revenue_growth?: number | null
          sector: string
          ticker?: string | null
          updated_at?: string
        }
        Update: {
          analyzed_at?: string
          created_at?: string
          current_ratio?: number | null
          debt_to_equity?: number | null
          distress_signals?: string[] | null
          financial_health_score?: number | null
          id?: string
          industry?: string
          locations?: Json | null
          market_cap?: number | null
          name?: string
          power_usage_estimate?: number | null
          profit_margin?: number | null
          revenue_growth?: number | null
          sector?: string
          ticker?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_real_estate_assets: {
        Row: {
          company_name: string
          company_ticker: string | null
          coordinates: unknown | null
          created_at: string
          id: string
          location_description: string
          property_type: string
          raw_text: string | null
          source: string
          updated_at: string
        }
        Insert: {
          company_name: string
          company_ticker?: string | null
          coordinates?: unknown | null
          created_at?: string
          id: string
          location_description: string
          property_type: string
          raw_text?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_ticker?: string | null
          coordinates?: unknown | null
          created_at?: string
          id?: string
          location_description?: string
          property_type?: string
          raw_text?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      competitor_analysis: {
        Row: {
          analysis_date: string
          company_id: string
          competitive_advantages: string[] | null
          competitive_weaknesses: string[] | null
          competitor_name: string
          created_at: string
          id: string
          market_positioning: string | null
          market_share_estimate: number | null
          power_usage_comparison: number | null
        }
        Insert: {
          analysis_date?: string
          company_id: string
          competitive_advantages?: string[] | null
          competitive_weaknesses?: string[] | null
          competitor_name: string
          created_at?: string
          id?: string
          market_positioning?: string | null
          market_share_estimate?: number | null
          power_usage_comparison?: number | null
        }
        Update: {
          analysis_date?: string
          company_id?: string
          competitive_advantages?: string[] | null
          competitive_weaknesses?: string[] | null
          competitor_name?: string
          created_at?: string
          id?: string
          market_positioning?: string | null
          market_share_estimate?: number | null
          power_usage_comparison?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_insights: {
        Row: {
          company_name: string
          content: string
          discovered_at: string
          id: string
          insight_type: string
          keywords: string[] | null
          source: string
        }
        Insert: {
          company_name: string
          content: string
          discovered_at?: string
          id?: string
          insight_type: string
          keywords?: string[] | null
          source: string
        }
        Update: {
          company_name?: string
          content?: string
          discovered_at?: string
          id?: string
          insight_type?: string
          keywords?: string[] | null
          source?: string
        }
        Relationships: []
      }
      distress_alerts: {
        Row: {
          alert_type: string
          company_name: string
          created_at: string
          distress_level: number
          id: string
          potential_value: number
          power_capacity: number
          signals: string[]
        }
        Insert: {
          alert_type: string
          company_name: string
          created_at?: string
          distress_level: number
          id?: string
          potential_value: number
          power_capacity: number
          signals: string[]
        }
        Update: {
          alert_type?: string
          company_name?: string
          created_at?: string
          distress_level?: number
          id?: string
          potential_value?: number
          power_capacity?: number
          signals?: string[]
        }
        Relationships: []
      }
      due_diligence_reports: {
        Row: {
          company_id: string
          created_at: string
          executive_summary: string | null
          financial_analysis: Json | null
          generated_by: string | null
          id: string
          power_infrastructure_assessment: Json | null
          recommendations: string[] | null
          report_data: Json | null
          report_type: string
          risk_assessment: Json | null
          updated_at: string
          valuation_analysis: Json | null
        }
        Insert: {
          company_id: string
          created_at?: string
          executive_summary?: string | null
          financial_analysis?: Json | null
          generated_by?: string | null
          id?: string
          power_infrastructure_assessment?: Json | null
          recommendations?: string[] | null
          report_data?: Json | null
          report_type: string
          risk_assessment?: Json | null
          updated_at?: string
          valuation_analysis?: Json | null
        }
        Update: {
          company_id?: string
          created_at?: string
          executive_summary?: string | null
          financial_analysis?: Json | null
          generated_by?: string | null
          id?: string
          power_infrastructure_assessment?: Json | null
          recommendations?: string[] | null
          report_data?: Json | null
          report_type?: string
          risk_assessment?: Json | null
          updated_at?: string
          valuation_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_cost_calculations: {
        Row: {
          calculated_monthly_cost: number
          calculation_date: string
          calculation_details: Json | null
          created_at: string
          id: string
          monthly_consumption_mwh: number
          peak_demand_mw: number
          property_id: string | null
          tariff_id: string | null
        }
        Insert: {
          calculated_monthly_cost: number
          calculation_date?: string
          calculation_details?: Json | null
          created_at?: string
          id?: string
          monthly_consumption_mwh: number
          peak_demand_mw: number
          property_id?: string | null
          tariff_id?: string | null
        }
        Update: {
          calculated_monthly_cost?: number
          calculation_date?: string
          calculation_details?: Json | null
          created_at?: string
          id?: string
          monthly_consumption_mwh?: number
          peak_demand_mw?: number
          property_id?: string | null
          tariff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_cost_calculations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_cost_calculations_tariff_id_fkey"
            columns: ["tariff_id"]
            isOneToOne: false
            referencedRelation: "utility_tariffs"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_markets: {
        Row: {
          api_endpoint: string | null
          created_at: string
          id: string
          market_code: string
          market_name: string
          region: string
          timezone: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          market_code: string
          market_name: string
          region: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          market_code?: string
          market_name?: string
          region?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      energy_rates: {
        Row: {
          created_at: string
          id: string
          market_id: string
          node_id: string | null
          node_name: string | null
          price_per_mwh: number
          rate_type: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          node_id?: string | null
          node_name?: string | null
          price_per_mwh: number
          rate_type: string
          timestamp: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          node_id?: string | null
          node_name?: string | null
          price_per_mwh?: number
          rate_type?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "energy_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_scores: {
        Row: {
          assessment_date: string
          carbon_footprint_mt: number | null
          company_id: string
          created_at: string
          environmental_score: number
          governance_score: number
          green_transition_opportunities: string[] | null
          id: string
          overall_esg_score: number
          regulatory_compliance_score: number | null
          renewable_energy_percent: number | null
          social_score: number
          sustainability_commitments: string[] | null
        }
        Insert: {
          assessment_date?: string
          carbon_footprint_mt?: number | null
          company_id: string
          created_at?: string
          environmental_score: number
          governance_score: number
          green_transition_opportunities?: string[] | null
          id?: string
          overall_esg_score: number
          regulatory_compliance_score?: number | null
          renewable_energy_percent?: number | null
          social_score: number
          sustainability_commitments?: string[] | null
        }
        Update: {
          assessment_date?: string
          carbon_footprint_mt?: number | null
          company_id?: string
          created_at?: string
          environmental_score?: number
          governance_score?: number
          green_transition_opportunities?: string[] | null
          id?: string
          overall_esg_score?: number
          regulatory_compliance_score?: number | null
          renewable_energy_percent?: number | null
          social_score?: number
          sustainability_commitments?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_intel_results: {
        Row: {
          address: string | null
          ai_insights: string | null
          city: string | null
          coordinates: unknown | null
          created_at: string
          created_by: string | null
          data_sources: Json | null
          distress_score: number | null
          estimated_power_mw: number | null
          id: string
          name: string
          opportunity_details: Json | null
          opportunity_type: string
          scan_session_id: string | null
          state: string | null
          status: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          ai_insights?: string | null
          city?: string | null
          coordinates?: unknown | null
          created_at?: string
          created_by?: string | null
          data_sources?: Json | null
          distress_score?: number | null
          estimated_power_mw?: number | null
          id?: string
          name: string
          opportunity_details?: Json | null
          opportunity_type: string
          scan_session_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          ai_insights?: string | null
          city?: string | null
          coordinates?: unknown | null
          created_at?: string
          created_by?: string | null
          data_sources?: Json | null
          distress_score?: number | null
          estimated_power_mw?: number | null
          id?: string
          name?: string
          opportunity_details?: Json | null
          opportunity_type?: string
          scan_session_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_intel_results_scan_session_id_fkey"
            columns: ["scan_session_id"]
            isOneToOne: false
            referencedRelation: "site_scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_intelligence: {
        Row: {
          company_name: string
          financial_health: number | null
          id: string
          industry: string
          market_cap: number | null
          power_intensity: string | null
          risk_level: string | null
          scanned_at: string
          ticker: string | null
        }
        Insert: {
          company_name: string
          financial_health?: number | null
          id?: string
          industry: string
          market_cap?: number | null
          power_intensity?: string | null
          risk_level?: string | null
          scanned_at?: string
          ticker?: string | null
        }
        Update: {
          company_name?: string
          financial_health?: number | null
          id?: string
          industry?: string
          market_cap?: number | null
          power_intensity?: string | null
          risk_level?: string | null
          scanned_at?: string
          ticker?: string | null
        }
        Relationships: []
      }
      investment_scores: {
        Row: {
          calculated_at: string
          company_id: string
          confidence_level: number
          created_at: string
          expected_roi_range: Json | null
          id: string
          key_factors: string[] | null
          opportunity_score: number
          overall_score: number
          recommendation: string
          risk_factors: string[] | null
          risk_score: number
          timing_score: number
        }
        Insert: {
          calculated_at?: string
          company_id: string
          confidence_level: number
          created_at?: string
          expected_roi_range?: Json | null
          id?: string
          key_factors?: string[] | null
          opportunity_score: number
          overall_score: number
          recommendation: string
          risk_factors?: string[] | null
          risk_score: number
          timing_score: number
        }
        Update: {
          calculated_at?: string
          company_id?: string
          confidence_level?: number
          created_at?: string
          expected_roi_range?: Json | null
          id?: string
          key_factors?: string[] | null
          opportunity_score?: number
          overall_score?: number
          recommendation?: string
          risk_factors?: string[] | null
          risk_score?: number
          timing_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "investment_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_intelligence: {
        Row: {
          company: string
          content: string
          discovered_at: string
          id: string
          keywords: string[] | null
          post_date: string
          signals: string[] | null
        }
        Insert: {
          company: string
          content: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          post_date: string
          signals?: string[] | null
        }
        Update: {
          company?: string
          content?: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          post_date?: string
          signals?: string[] | null
        }
        Relationships: []
      }
      market_timing_analysis: {
        Row: {
          analysis_date: string
          company_id: string
          created_at: string
          fire_sale_probability: number | null
          id: string
          institutional_activity_level: string | null
          key_timing_factors: string[] | null
          market_conditions_score: number
          market_cycle_phase: string
          optimal_acquisition_window: Json | null
          timing_recommendation: string | null
        }
        Insert: {
          analysis_date?: string
          company_id: string
          created_at?: string
          fire_sale_probability?: number | null
          id?: string
          institutional_activity_level?: string | null
          key_timing_factors?: string[] | null
          market_conditions_score: number
          market_cycle_phase: string
          optimal_acquisition_window?: Json | null
          timing_recommendation?: string | null
        }
        Update: {
          analysis_date?: string
          company_id?: string
          created_at?: string
          fire_sale_probability?: number | null
          id?: string
          institutional_activity_level?: string | null
          key_timing_factors?: string[] | null
          market_conditions_score?: number
          market_cycle_phase?: string
          optimal_acquisition_window?: Json | null
          timing_recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_timing_analysis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      news_intelligence: {
        Row: {
          content: string
          discovered_at: string
          id: string
          keywords: string[] | null
          published_at: string | null
          source: string
          title: string
          url: string | null
        }
        Insert: {
          content: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          source: string
          title: string
          url?: string | null
        }
        Update: {
          content?: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          source?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      portfolio_recommendations: {
        Row: {
          created_at: string
          diversification_score: number
          expires_at: string | null
          geographic_allocation: Json | null
          id: string
          investment_thesis: string | null
          recommendation_type: string
          risk_adjusted_return: number | null
          sector_allocation: Json | null
          target_companies: string[] | null
          timing_recommendations: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          diversification_score: number
          expires_at?: string | null
          geographic_allocation?: Json | null
          id?: string
          investment_thesis?: string | null
          recommendation_type: string
          risk_adjusted_return?: number | null
          sector_allocation?: Json | null
          target_companies?: string[] | null
          timing_recommendations?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          diversification_score?: number
          expires_at?: string | null
          geographic_allocation?: Json | null
          id?: string
          investment_thesis?: string | null
          recommendation_type?: string
          risk_adjusted_return?: number | null
          sector_allocation?: Json | null
          target_companies?: string[] | null
          timing_recommendations?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      power_demand_forecasts: {
        Row: {
          company_id: string
          confidence_score: number
          created_at: string
          forecast_date: string
          forecast_horizon_months: number
          growth_assumptions: Json | null
          id: string
          predicted_consumption_mw: number
          seasonal_factors: Json | null
          updated_at: string
        }
        Insert: {
          company_id: string
          confidence_score: number
          created_at?: string
          forecast_date: string
          forecast_horizon_months: number
          growth_assumptions?: Json | null
          id?: string
          predicted_consumption_mw: number
          seasonal_factors?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          confidence_score?: number
          created_at?: string
          forecast_date?: string
          forecast_horizon_months?: number
          growth_assumptions?: Json | null
          id?: string
          predicted_consumption_mw?: number
          seasonal_factors?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "power_demand_forecasts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          asking_price: number | null
          city: string
          created_at: string
          created_by: string | null
          description: string | null
          discovered_at: string
          id: string
          listing_url: string | null
          lot_size_acres: number | null
          power_capacity_mw: number | null
          price_per_sqft: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          source: string
          square_footage: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          substation_distance_miles: number | null
          transmission_access: boolean | null
          updated_at: string
          year_built: number | null
          zip_code: string
          zoning: string | null
        }
        Insert: {
          address: string
          asking_price?: number | null
          city: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discovered_at?: string
          id?: string
          listing_url?: string | null
          lot_size_acres?: number | null
          power_capacity_mw?: number | null
          price_per_sqft?: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          source: string
          square_footage?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          substation_distance_miles?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          year_built?: number | null
          zip_code: string
          zoning?: string | null
        }
        Update: {
          address?: string
          asking_price?: number | null
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discovered_at?: string
          id?: string
          listing_url?: string | null
          lot_size_acres?: number | null
          power_capacity_mw?: number | null
          price_per_sqft?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          source?: string
          square_footage?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          substation_distance_miles?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string
          zoning?: string | null
        }
        Relationships: []
      }
      property_brokers: {
        Row: {
          broker_id: string
          created_at: string
          id: string
          is_listing_agent: boolean | null
          property_id: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          id?: string
          is_listing_agent?: boolean | null
          property_id: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          id?: string
          is_listing_agent?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_brokers_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_brokers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_notes: {
        Row: {
          created_at: string
          id: string
          is_private: boolean | null
          note: string
          property_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean | null
          note: string
          property_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean | null
          note?: string
          property_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_notes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_properties: {
        Row: {
          address: string
          ai_analysis: Json | null
          asking_price: number | null
          city: string
          created_at: string
          description: string | null
          id: string
          listing_url: string | null
          lot_size_acres: number | null
          moved_to_properties: boolean | null
          power_capacity_mw: number | null
          price_per_sqft: number | null
          property_type: string
          scraped_at: string
          source: string
          square_footage: number | null
          state: string
          substation_distance_miles: number | null
          transmission_access: boolean | null
          updated_at: string
          year_built: number | null
          zip_code: string | null
          zoning: string | null
        }
        Insert: {
          address: string
          ai_analysis?: Json | null
          asking_price?: number | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          listing_url?: string | null
          lot_size_acres?: number | null
          moved_to_properties?: boolean | null
          power_capacity_mw?: number | null
          price_per_sqft?: number | null
          property_type: string
          scraped_at?: string
          source?: string
          square_footage?: number | null
          state: string
          substation_distance_miles?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
          zoning?: string | null
        }
        Update: {
          address?: string
          ai_analysis?: Json | null
          asking_price?: number | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          listing_url?: string | null
          lot_size_acres?: number | null
          moved_to_properties?: boolean | null
          power_capacity_mw?: number | null
          price_per_sqft?: number | null
          property_type?: string
          scraped_at?: string
          source?: string
          square_footage?: number | null
          state?: string
          substation_distance_miles?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
          zoning?: string | null
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          completed_at: string | null
          errors: string[] | null
          id: string
          properties_found: number | null
          source_id: string
          source_name: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          errors?: string[] | null
          id?: string
          properties_found?: number | null
          source_id: string
          source_name: string
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          errors?: string[] | null
          id?: string
          properties_found?: number | null
          source_id?: string
          source_name?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scraping_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_sources: {
        Row: {
          created_at: string
          id: string
          keywords: string[]
          last_run: string | null
          name: string
          properties_found: number | null
          status: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          keywords?: string[]
          last_run?: string | null
          name: string
          properties_found?: number | null
          status?: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string[]
          last_run?: string | null
          name?: string
          properties_found?: number | null
          status?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      search_criteria: {
        Row: {
          created_at: string
          criteria: Json
          email_alerts: boolean | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          email_alerts?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          email_alerts?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_access_requests: {
        Row: {
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          location: string
          phone: string
          power_requirement: string
          status: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          location: string
          phone: string
          power_requirement: string
          status?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string
          phone?: string
          power_requirement?: string
          status?: string
        }
        Relationships: []
      }
      site_scan_sessions: {
        Row: {
          city: string | null
          completed_at: string | null
          config: Json | null
          created_at: string
          created_by: string | null
          current_phase: string | null
          data_sources_used: Json | null
          filters: Json | null
          id: string
          jurisdiction: string
          processing_time_minutes: number | null
          progress: number | null
          scan_type: string
          sites_discovered: number | null
          sites_verified: number | null
          status: string
        }
        Insert: {
          city?: string | null
          completed_at?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          data_sources_used?: Json | null
          filters?: Json | null
          id?: string
          jurisdiction: string
          processing_time_minutes?: number | null
          progress?: number | null
          scan_type?: string
          sites_discovered?: number | null
          sites_verified?: number | null
          status?: string
        }
        Update: {
          city?: string | null
          completed_at?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          data_sources_used?: Json | null
          filters?: Json | null
          id?: string
          jurisdiction?: string
          processing_time_minutes?: number | null
          progress?: number | null
          scan_type?: string
          sites_discovered?: number | null
          sites_verified?: number | null
          status?: string
        }
        Relationships: []
      }
      social_intelligence: {
        Row: {
          author: string | null
          content: string
          discovered_at: string
          early_warning_signals: string[] | null
          id: string
          keywords: string[] | null
          platform: string
          posted_at: string | null
          sentiment_analysis: Json | null
          sentiment_score: number | null
          source: string
          url: string | null
        }
        Insert: {
          author?: string | null
          content: string
          discovered_at?: string
          early_warning_signals?: string[] | null
          id?: string
          keywords?: string[] | null
          platform: string
          posted_at?: string | null
          sentiment_analysis?: Json | null
          sentiment_score?: number | null
          source: string
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          discovered_at?: string
          early_warning_signals?: string[] | null
          id?: string
          keywords?: string[] | null
          platform?: string
          posted_at?: string | null
          sentiment_analysis?: Json | null
          sentiment_score?: number | null
          source?: string
          url?: string | null
        }
        Relationships: []
      }
      substations: {
        Row: {
          capacity_mva: number
          city: string
          commissioning_date: string | null
          coordinates_source: string | null
          created_at: string
          id: string
          interconnection_type: string | null
          latitude: number | null
          load_factor: number | null
          longitude: number | null
          name: string
          state: string
          status: string
          updated_at: string
          upgrade_potential: number | null
          utility_owner: string
          voltage_level: string
        }
        Insert: {
          capacity_mva: number
          city: string
          commissioning_date?: string | null
          coordinates_source?: string | null
          created_at?: string
          id?: string
          interconnection_type?: string | null
          latitude?: number | null
          load_factor?: number | null
          longitude?: number | null
          name: string
          state: string
          status?: string
          updated_at?: string
          upgrade_potential?: number | null
          utility_owner: string
          voltage_level: string
        }
        Update: {
          capacity_mva?: number
          city?: string
          commissioning_date?: string | null
          coordinates_source?: string | null
          created_at?: string
          id?: string
          interconnection_type?: string | null
          latitude?: number | null
          load_factor?: number | null
          longitude?: number | null
          name?: string
          state?: string
          status?: string
          updated_at?: string
          upgrade_potential?: number | null
          utility_owner?: string
          voltage_level?: string
        }
        Relationships: []
      }
      supply_chain_analysis: {
        Row: {
          analysis_date: string
          company_id: string
          created_at: string
          critical_components: string[] | null
          disruption_risks: Json | null
          geographic_exposure: Json | null
          id: string
          impact_on_power_consumption: Json | null
          mitigation_strategies: string[] | null
          regulatory_risks: string[] | null
          supplier_dependencies: string[] | null
        }
        Insert: {
          analysis_date?: string
          company_id: string
          created_at?: string
          critical_components?: string[] | null
          disruption_risks?: Json | null
          geographic_exposure?: Json | null
          id?: string
          impact_on_power_consumption?: Json | null
          mitigation_strategies?: string[] | null
          regulatory_risks?: string[] | null
          supplier_dependencies?: string[] | null
        }
        Update: {
          analysis_date?: string
          company_id?: string
          created_at?: string
          critical_components?: string[] | null
          disruption_risks?: Json | null
          geographic_exposure?: Json | null
          id?: string
          impact_on_power_consumption?: Json | null
          mitigation_strategies?: string[] | null
          regulatory_risks?: string[] | null
          supplier_dependencies?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_analysis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alert_preferences: {
        Row: {
          alert_type: string
          created_at: string
          criteria: Json
          frequency: string
          id: string
          is_active: boolean
          last_triggered: string | null
          notification_channels: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          criteria: Json
          frequency?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          notification_channels?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          criteria?: Json
          frequency?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          notification_channels?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      utility_companies: {
        Row: {
          company_name: string
          contact_info: Json | null
          created_at: string
          id: string
          market_id: string | null
          service_territory: string
          state: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          market_id?: string | null
          service_territory: string
          state: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          market_id?: string | null
          service_territory?: string
          state?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utility_companies_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "energy_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_tariffs: {
        Row: {
          created_at: string
          demand_charge_per_kw: number | null
          effective_date: string
          expiration_date: string | null
          id: string
          maximum_demand_mw: number | null
          minimum_demand_mw: number | null
          rate_schedule: Json
          seasonal_adjustments: Json | null
          tariff_code: string
          tariff_name: string
          time_of_use_rates: Json | null
          updated_at: string
          utility_id: string
        }
        Insert: {
          created_at?: string
          demand_charge_per_kw?: number | null
          effective_date: string
          expiration_date?: string | null
          id?: string
          maximum_demand_mw?: number | null
          minimum_demand_mw?: number | null
          rate_schedule: Json
          seasonal_adjustments?: Json | null
          tariff_code: string
          tariff_name: string
          time_of_use_rates?: Json | null
          updated_at?: string
          utility_id: string
        }
        Update: {
          created_at?: string
          demand_charge_per_kw?: number | null
          effective_date?: string
          expiration_date?: string | null
          id?: string
          maximum_demand_mw?: number | null
          minimum_demand_mw?: number | null
          rate_schedule?: Json
          seasonal_adjustments?: Json | null
          tariff_code?: string
          tariff_name?: string
          time_of_use_rates?: Json | null
          updated_at?: string
          utility_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_tariffs_utility_id_fkey"
            columns: ["utility_id"]
            isOneToOne: false
            referencedRelation: "utility_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      verified_heavy_power_sites: {
        Row: {
          address: string
          business_status: string | null
          capacity_utilization: number | null
          city: string
          confidence_level: string | null
          confidence_score: number | null
          coordinates: unknown | null
          created_at: string
          created_by: string | null
          data_sources: Json | null
          deleted_at: string | null
          discovery_method: string | null
          environmental_permits: Json | null
          estimated_current_mw: number | null
          estimated_free_mw: number | null
          facility_type: string | null
          historical_peak_mw: number | null
          id: string
          idle_score: number | null
          industry_type: string
          jurisdiction: string
          last_scan_at: string | null
          last_verified_at: string | null
          listing_price: number | null
          lot_size_acres: number | null
          market_data: Json | null
          naics_code: string | null
          name: string
          power_potential: string | null
          price_per_sqft: number | null
          property_type: string | null
          regulatory_status: Json | null
          risk_factors: Json | null
          satellite_analysis: Json | null
          satellite_image_url: string | null
          scan_id: string | null
          square_footage: number | null
          state: string
          substation_distance_km: number | null
          transmission_access: boolean | null
          updated_at: string
          validation_status: string | null
          verified_sources_count: number | null
          visual_status: string | null
          year_built: number | null
          zip_code: string | null
          zoning: string | null
        }
        Insert: {
          address: string
          business_status?: string | null
          capacity_utilization?: number | null
          city: string
          confidence_level?: string | null
          confidence_score?: number | null
          coordinates?: unknown | null
          created_at?: string
          created_by?: string | null
          data_sources?: Json | null
          deleted_at?: string | null
          discovery_method?: string | null
          environmental_permits?: Json | null
          estimated_current_mw?: number | null
          estimated_free_mw?: number | null
          facility_type?: string | null
          historical_peak_mw?: number | null
          id?: string
          idle_score?: number | null
          industry_type: string
          jurisdiction: string
          last_scan_at?: string | null
          last_verified_at?: string | null
          listing_price?: number | null
          lot_size_acres?: number | null
          market_data?: Json | null
          naics_code?: string | null
          name: string
          power_potential?: string | null
          price_per_sqft?: number | null
          property_type?: string | null
          regulatory_status?: Json | null
          risk_factors?: Json | null
          satellite_analysis?: Json | null
          satellite_image_url?: string | null
          scan_id?: string | null
          square_footage?: number | null
          state: string
          substation_distance_km?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          validation_status?: string | null
          verified_sources_count?: number | null
          visual_status?: string | null
          year_built?: number | null
          zip_code?: string | null
          zoning?: string | null
        }
        Update: {
          address?: string
          business_status?: string | null
          capacity_utilization?: number | null
          city?: string
          confidence_level?: string | null
          confidence_score?: number | null
          coordinates?: unknown | null
          created_at?: string
          created_by?: string | null
          data_sources?: Json | null
          deleted_at?: string | null
          discovery_method?: string | null
          environmental_permits?: Json | null
          estimated_current_mw?: number | null
          estimated_free_mw?: number | null
          facility_type?: string | null
          historical_peak_mw?: number | null
          id?: string
          idle_score?: number | null
          industry_type?: string
          jurisdiction?: string
          last_scan_at?: string | null
          last_verified_at?: string | null
          listing_price?: number | null
          lot_size_acres?: number | null
          market_data?: Json | null
          naics_code?: string | null
          name?: string
          power_potential?: string | null
          price_per_sqft?: number | null
          property_type?: string | null
          regulatory_status?: Json | null
          risk_factors?: Json | null
          satellite_analysis?: Json | null
          satellite_image_url?: string | null
          scan_id?: string | null
          square_footage?: number | null
          state?: string
          substation_distance_km?: number | null
          transmission_access?: boolean | null
          updated_at?: string
          validation_status?: string | null
          verified_sources_count?: number | null
          visual_status?: string | null
          year_built?: number | null
          zip_code?: string | null
          zoning?: string | null
        }
        Relationships: []
      }
      volt_scores: {
        Row: {
          calculated_at: string
          calculation_details: Json | null
          created_at: string
          financial_score: number
          id: string
          infrastructure_score: number
          location_score: number
          overall_score: number
          power_score: number
          property_id: string
          risk_score: number
        }
        Insert: {
          calculated_at?: string
          calculation_details?: Json | null
          created_at?: string
          financial_score: number
          id?: string
          infrastructure_score: number
          location_score: number
          overall_score: number
          power_score: number
          property_id: string
          risk_score: number
        }
        Update: {
          calculated_at?: string
          calculation_details?: Json | null
          created_at?: string
          financial_score?: number
          id?: string
          infrastructure_score?: number
          location_score?: number
          overall_score?: number
          power_score?: number
          property_id?: string
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "volt_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_analytics: {
        Row: {
          created_at: string | null
          date_recorded: string | null
          id: string
          metric_type: string
          metric_value: Json
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_type: string
          metric_value: Json
        }
        Update: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_type?: string
          metric_value?: Json
        }
        Relationships: []
      }
      voltmarket_conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          listing_id: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_buyer"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_private: boolean | null
          listing_id: string
          uploader_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_private?: boolean | null
          listing_id: string
          uploader_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_private?: boolean | null
          listing_id?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_documents_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_documents_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_due_diligence_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          is_confidential: boolean | null
          listing_id: string
          requires_nda: boolean | null
          sort_order: number | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          is_confidential?: boolean | null
          listing_id: string
          requires_nda?: boolean | null
          sort_order?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          is_confidential?: boolean | null
          listing_id?: string
          requires_nda?: boolean | null
          sort_order?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      voltmarket_email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      voltmarket_listing_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          listing_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          listing_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          listing_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_listings: {
        Row: {
          asking_price: number | null
          available_power_mw: number | null
          brand: string | null
          cooling_type: string | null
          created_at: string | null
          description: string | null
          equipment_condition:
            | Database["public"]["Enums"]["voltmarket_equipment_condition"]
            | null
          equipment_type:
            | Database["public"]["Enums"]["voltmarket_equipment_type"]
            | null
          facility_tier: string | null
          hosting_types: string[] | null
          id: string
          is_featured: boolean | null
          is_location_confidential: boolean | null
          latitude: number | null
          lease_rate: number | null
          listing_type: Database["public"]["Enums"]["voltmarket_listing_type"]
          location: string
          longitude: number | null
          manufacture_year: number | null
          minimum_commitment_months: number | null
          model: string | null
          power_capacity_mw: number | null
          power_rate_per_kw: number | null
          property_type:
            | Database["public"]["Enums"]["voltmarket_property_type"]
            | null
          quantity: number | null
          seller_id: string
          shipping_terms: string | null
          specs: Json | null
          square_footage: number | null
          status:
            | Database["public"]["Enums"]["voltmarket_listing_status"]
            | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          asking_price?: number | null
          available_power_mw?: number | null
          brand?: string | null
          cooling_type?: string | null
          created_at?: string | null
          description?: string | null
          equipment_condition?:
            | Database["public"]["Enums"]["voltmarket_equipment_condition"]
            | null
          equipment_type?:
            | Database["public"]["Enums"]["voltmarket_equipment_type"]
            | null
          facility_tier?: string | null
          hosting_types?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_location_confidential?: boolean | null
          latitude?: number | null
          lease_rate?: number | null
          listing_type: Database["public"]["Enums"]["voltmarket_listing_type"]
          location: string
          longitude?: number | null
          manufacture_year?: number | null
          minimum_commitment_months?: number | null
          model?: string | null
          power_capacity_mw?: number | null
          power_rate_per_kw?: number | null
          property_type?:
            | Database["public"]["Enums"]["voltmarket_property_type"]
            | null
          quantity?: number | null
          seller_id: string
          shipping_terms?: string | null
          specs?: Json | null
          square_footage?: number | null
          status?:
            | Database["public"]["Enums"]["voltmarket_listing_status"]
            | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          asking_price?: number | null
          available_power_mw?: number | null
          brand?: string | null
          cooling_type?: string | null
          created_at?: string | null
          description?: string | null
          equipment_condition?:
            | Database["public"]["Enums"]["voltmarket_equipment_condition"]
            | null
          equipment_type?:
            | Database["public"]["Enums"]["voltmarket_equipment_type"]
            | null
          facility_tier?: string | null
          hosting_types?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_location_confidential?: boolean | null
          latitude?: number | null
          lease_rate?: number | null
          listing_type?: Database["public"]["Enums"]["voltmarket_listing_type"]
          location?: string
          longitude?: number | null
          manufacture_year?: number | null
          minimum_commitment_months?: number | null
          model?: string | null
          power_capacity_mw?: number | null
          power_rate_per_kw?: number | null
          property_type?:
            | Database["public"]["Enums"]["voltmarket_property_type"]
            | null
          quantity?: number | null
          seller_id?: string
          shipping_terms?: string | null
          specs?: Json | null
          square_footage?: number | null
          status?:
            | Database["public"]["Enums"]["voltmarket_listing_status"]
            | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_lois: {
        Row: {
          buyer_id: string
          conditions: string | null
          custom_loi_url: string | null
          deposit_amount: number | null
          id: string
          listing_id: string
          offered_price: number | null
          responded_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["voltmarket_loi_status"] | null
          submitted_at: string | null
          timeline_days: number | null
        }
        Insert: {
          buyer_id: string
          conditions?: string | null
          custom_loi_url?: string | null
          deposit_amount?: number | null
          id?: string
          listing_id: string
          offered_price?: number | null
          responded_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["voltmarket_loi_status"] | null
          submitted_at?: string | null
          timeline_days?: number | null
        }
        Update: {
          buyer_id?: string
          conditions?: string | null
          custom_loi_url?: string | null
          deposit_amount?: number | null
          id?: string
          listing_id?: string
          offered_price?: number | null
          responded_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["voltmarket_loi_status"] | null
          submitted_at?: string | null
          timeline_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_lois_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_lois_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_lois_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          listing_id: string
          message: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          listing_id: string
          message: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          listing_id?: string
          message?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_nda_requests: {
        Row: {
          approved_at: string | null
          created_at: string | null
          id: string
          listing_id: string
          nda_document_url: string | null
          requester_id: string
          seller_id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["voltmarket_nda_status"] | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          listing_id: string
          nda_document_url?: string | null
          requester_id: string
          seller_id: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["voltmarket_nda_status"] | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string
          nda_document_url?: string | null
          requester_id?: string
          seller_id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["voltmarket_nda_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_nda_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_nda_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_nda_requests_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_notifications: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          created_at: string | null
          id: string
          is_email_verified: boolean | null
          is_id_verified: boolean | null
          linkedin_url: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["voltmarket_user_role"]
          seller_type:
            | Database["public"]["Enums"]["voltmarket_seller_type"]
            | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_id_verified?: boolean | null
          linkedin_url?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role: Database["public"]["Enums"]["voltmarket_user_role"]
          seller_type?:
            | Database["public"]["Enums"]["voltmarket_seller_type"]
            | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_email_verified?: boolean | null
          is_id_verified?: boolean | null
          linkedin_url?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["voltmarket_user_role"]
          seller_type?:
            | Database["public"]["Enums"]["voltmarket_seller_type"]
            | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      voltmarket_reviews: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          rating: number
          review_text: string | null
          reviewed_user_id: string
          reviewer_id: string
          transaction_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          rating: number
          review_text?: string | null
          reviewed_user_id: string
          reviewer_id: string
          transaction_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          rating?: number
          review_text?: string | null
          reviewed_user_id?: string
          reviewer_id?: string
          transaction_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_reviews_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_saved_searches: {
        Row: {
          created_at: string | null
          id: string
          notification_enabled: boolean | null
          search_criteria: Json
          search_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_enabled?: boolean | null
          search_criteria: Json
          search_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_enabled?: boolean | null
          search_criteria?: Json
          search_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string | null
          id: string
          listing_id: string
          payment_method: string | null
          seller_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          transaction_fee: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id: string
          payment_method?: string | null
          seller_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id?: string
          payment_method?: string | null
          seller_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_verifications: {
        Row: {
          created_at: string | null
          document_url: string
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_url: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_watchlist: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_watchlist_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_delete_verified_sites: {
        Args: { site_ids: string[] }
        Returns: number
      }
      restore_verified_site: {
        Args: { site_id: string }
        Returns: boolean
      }
      soft_delete_verified_site: {
        Args: { site_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_type:
        | "new_property"
        | "price_change"
        | "status_change"
        | "high_voltscore"
      property_status:
        | "available"
        | "under_contract"
        | "sold"
        | "off_market"
        | "analyzing"
      property_type:
        | "industrial"
        | "warehouse"
        | "manufacturing"
        | "data_center"
        | "logistics"
        | "flex_space"
        | "other"
      user_role: "admin" | "analyst" | "viewer"
      voltmarket_equipment_condition: "new" | "used" | "refurbished"
      voltmarket_equipment_type:
        | "asic"
        | "gpu"
        | "cooling"
        | "generator"
        | "ups"
        | "transformer"
        | "other"
      voltmarket_listing_status:
        | "active"
        | "under_loi"
        | "sold"
        | "leased"
        | "inactive"
      voltmarket_listing_type:
        | "site_sale"
        | "site_lease"
        | "hosting"
        | "equipment"
      voltmarket_loi_status: "pending" | "accepted" | "rejected" | "withdrawn"
      voltmarket_nda_status: "pending" | "approved" | "rejected"
      voltmarket_property_type:
        | "data_center"
        | "industrial"
        | "warehouse"
        | "land"
        | "office"
        | "other"
      voltmarket_seller_type:
        | "site_owner"
        | "broker"
        | "realtor"
        | "equipment_vendor"
      voltmarket_user_role: "buyer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: [
        "new_property",
        "price_change",
        "status_change",
        "high_voltscore",
      ],
      property_status: [
        "available",
        "under_contract",
        "sold",
        "off_market",
        "analyzing",
      ],
      property_type: [
        "industrial",
        "warehouse",
        "manufacturing",
        "data_center",
        "logistics",
        "flex_space",
        "other",
      ],
      user_role: ["admin", "analyst", "viewer"],
      voltmarket_equipment_condition: ["new", "used", "refurbished"],
      voltmarket_equipment_type: [
        "asic",
        "gpu",
        "cooling",
        "generator",
        "ups",
        "transformer",
        "other",
      ],
      voltmarket_listing_status: [
        "active",
        "under_loi",
        "sold",
        "leased",
        "inactive",
      ],
      voltmarket_listing_type: [
        "site_sale",
        "site_lease",
        "hosting",
        "equipment",
      ],
      voltmarket_loi_status: ["pending", "accepted", "rejected", "withdrawn"],
      voltmarket_nda_status: ["pending", "approved", "rejected"],
      voltmarket_property_type: [
        "data_center",
        "industrial",
        "warehouse",
        "land",
        "office",
        "other",
      ],
      voltmarket_seller_type: [
        "site_owner",
        "broker",
        "realtor",
        "equipment_vendor",
      ],
      voltmarket_user_role: ["buyer", "seller", "admin"],
    },
  },
} as const
