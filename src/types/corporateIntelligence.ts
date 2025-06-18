
export interface Company {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  sector: string;
  market_cap?: number;
  revenue_growth?: number;
  profit_margin?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  financial_health_score?: number;
  power_usage_estimate?: number;
  distress_signals?: string[];
  locations?: any;
  analyzed_at: string;
  created_at: string;
  updated_at: string;
  // Additional properties for corporate intelligence
  incorporation_date?: string;
  company_status?: string;
  jurisdiction?: string;
  registered_address?: string;
  recent_news?: Array<{
    title: string;
    source: string;
    url?: string;
    published_at?: string;
  }>;
  // Real estate assets from SEC filings
  real_estate_assets?: Array<{
    id: string;
    company_ticker?: string;
    company_name: string;
    property_type: 'Office' | 'Data Center' | 'Industrial' | 'Other Industrial Asset';
    location_description: string;
    coordinates?: [number, number] | null;
    source: string;
    raw_text?: string;
    created_at: string;
  }>;
  // Data quality information
  data_quality?: {
    sources_used: number;
    has_financial_data: boolean;
    has_corporate_data: boolean;
    has_recent_news: boolean;
  };
  data_sources?: {
    sec?: boolean;
    alpha_vantage?: boolean;
    yahoo_finance?: boolean;
    open_corporates?: boolean;
    news_api?: boolean;
  };
}

export interface LoadingStates {
  analyzing: boolean;
  scanning: boolean;
  detecting: boolean;
  monitoring: boolean;
}

export interface DistressAlert {
  id: string;
  company_name: string;
  alert_type: string;
  distress_level: number;
  signals: string[];
  power_capacity: number;
  potential_value: number;
  created_at: string;
}
