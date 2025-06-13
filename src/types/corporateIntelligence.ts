
export interface Company {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  sector: string;
  market_cap?: number;
  financial_health_score?: number;
  distress_signals?: string[];
  power_usage_estimate?: number;
  locations?: any;
  analyzed_at: string;
  debt_to_equity?: number;
  current_ratio?: number;
  revenue_growth?: number;
  profit_margin?: number;
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

export interface LoadingStates {
  analyzing: boolean;
  scanning: boolean;
  detecting: boolean;
  monitoring: boolean;
}
