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
      social_intelligence: {
        Row: {
          author: string | null
          content: string
          discovered_at: string
          id: string
          keywords: string[] | null
          platform: string
          posted_at: string | null
          source: string
          url: string | null
        }
        Insert: {
          author?: string | null
          content: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          platform: string
          posted_at?: string | null
          source: string
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          discovered_at?: string
          id?: string
          keywords?: string[] | null
          platform?: string
          posted_at?: string | null
          source?: string
          url?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    },
  },
} as const
