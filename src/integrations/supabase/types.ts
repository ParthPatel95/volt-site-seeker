export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      acquisition_targets: {
        Row: {
          acquisition_readiness_score: number | null
          company_name: string
          created_at: string
          distress_signals: Json | null
          financial_metrics: Json | null
          id: string
          industry: string | null
          last_updated: string
          market_cap: number | null
        }
        Insert: {
          acquisition_readiness_score?: number | null
          company_name: string
          created_at?: string
          distress_signals?: Json | null
          financial_metrics?: Json | null
          id?: string
          industry?: string | null
          last_updated?: string
          market_cap?: number | null
        }
        Update: {
          acquisition_readiness_score?: number | null
          company_name?: string
          created_at?: string
          distress_signals?: Json | null
          financial_metrics?: Json | null
          id?: string
          industry?: string | null
          last_updated?: string
          market_cap?: number | null
        }
        Relationships: []
      }
      aeso_custom_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          dashboard_name: string
          description: string | null
          id: string
          is_template: boolean | null
          layout_config: Json | null
          thumbnail_url: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dashboard_name: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          layout_config?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dashboard_name?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          layout_config?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      aeso_cv_folds: {
        Row: {
          created_at: string | null
          fold_number: number
          id: string
          mae: number | null
          mape: number | null
          model_version: string | null
          rmse: number | null
          smape: number | null
          train_end_date: string
          train_start_date: string
          validation_end_date: string
          validation_start_date: string
        }
        Insert: {
          created_at?: string | null
          fold_number: number
          id?: string
          mae?: number | null
          mape?: number | null
          model_version?: string | null
          rmse?: number | null
          smape?: number | null
          train_end_date: string
          train_start_date: string
          validation_end_date: string
          validation_start_date: string
        }
        Update: {
          created_at?: string | null
          fold_number?: number
          id?: string
          mae?: number | null
          mape?: number | null
          model_version?: string | null
          rmse?: number | null
          smape?: number | null
          train_end_date?: string
          train_start_date?: string
          validation_end_date?: string
          validation_start_date?: string
        }
        Relationships: []
      }
      aeso_dashboard_views: {
        Row: {
          id: string
          session_duration: number | null
          shared_dashboard_id: string
          user_agent: string | null
          viewed_at: string
          viewer_email: string | null
          viewer_ip: string | null
          viewer_name: string | null
        }
        Insert: {
          id?: string
          session_duration?: number | null
          shared_dashboard_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_email?: string | null
          viewer_ip?: string | null
          viewer_name?: string | null
        }
        Update: {
          id?: string
          session_duration?: number | null
          shared_dashboard_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_email?: string | null
          viewer_ip?: string | null
          viewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aeso_dashboard_views_shared_dashboard_id_fkey"
            columns: ["shared_dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_shared_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      aeso_dashboard_widgets: {
        Row: {
          created_at: string
          dashboard_id: string
          data_filters: Json | null
          data_source: string
          height: number
          id: string
          position_x: number
          position_y: number
          updated_at: string
          widget_config: Json
          widget_type: string
          width: number
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          data_filters?: Json | null
          data_source: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          widget_config?: Json
          widget_type: string
          width?: number
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          data_filters?: Json | null
          data_source?: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          widget_config?: Json
          widget_type?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "aeso_dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      aeso_data_quality_reports: {
        Row: {
          created_at: string
          enhanced_feature_coverage: Json | null
          id: string
          missing_data_analysis: Json | null
          outlier_count: number | null
          price_statistics: Json | null
          quality_factors: Json | null
          quality_score: number
          recent_completeness: number | null
          recommendations: string[] | null
          report_date: string
          temporal_gaps: number | null
          total_records: number
        }
        Insert: {
          created_at?: string
          enhanced_feature_coverage?: Json | null
          id?: string
          missing_data_analysis?: Json | null
          outlier_count?: number | null
          price_statistics?: Json | null
          quality_factors?: Json | null
          quality_score: number
          recent_completeness?: number | null
          recommendations?: string[] | null
          report_date?: string
          temporal_gaps?: number | null
          total_records: number
        }
        Update: {
          created_at?: string
          enhanced_feature_coverage?: Json | null
          id?: string
          missing_data_analysis?: Json | null
          outlier_count?: number | null
          price_statistics?: Json | null
          quality_factors?: Json | null
          quality_score?: number
          recent_completeness?: number | null
          recommendations?: string[] | null
          report_date?: string
          temporal_gaps?: number | null
          total_records?: number
        }
        Relationships: []
      }
      aeso_enhanced_features: {
        Row: {
          created_at: string
          id: string
          natural_gas_price: number | null
          natural_gas_price_lag_1d: number | null
          natural_gas_price_lag_30d: number | null
          natural_gas_price_lag_7d: number | null
          net_imports: number | null
          price_momentum_3h: number | null
          price_volatility_1h: number | null
          price_volatility_24h: number | null
          renewable_curtailment: number | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          natural_gas_price?: number | null
          natural_gas_price_lag_1d?: number | null
          natural_gas_price_lag_30d?: number | null
          natural_gas_price_lag_7d?: number | null
          net_imports?: number | null
          price_momentum_3h?: number | null
          price_volatility_1h?: number | null
          price_volatility_24h?: number | null
          renewable_curtailment?: number | null
          timestamp: string
        }
        Update: {
          created_at?: string
          id?: string
          natural_gas_price?: number | null
          natural_gas_price_lag_1d?: number | null
          natural_gas_price_lag_30d?: number | null
          natural_gas_price_lag_7d?: number | null
          net_imports?: number | null
          price_momentum_3h?: number | null
          price_volatility_1h?: number | null
          price_volatility_24h?: number | null
          renewable_curtailment?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      aeso_ensemble_predictions: {
        Row: {
          actual_price: number | null
          arima_price: number | null
          arima_weight: number | null
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string | null
          ensemble_error: number | null
          ensemble_price: number
          ensemble_smape: number | null
          id: string
          ma_weight: number | null
          ml_predictor_price: number | null
          ml_weight: number | null
          model_version: string | null
          moving_average_price: number | null
          prediction_std: number | null
          prediction_timestamp: string | null
          seasonal_price: number | null
          seasonal_weight: number | null
          target_timestamp: string
        }
        Insert: {
          actual_price?: number | null
          arima_price?: number | null
          arima_weight?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          ensemble_error?: number | null
          ensemble_price: number
          ensemble_smape?: number | null
          id?: string
          ma_weight?: number | null
          ml_predictor_price?: number | null
          ml_weight?: number | null
          model_version?: string | null
          moving_average_price?: number | null
          prediction_std?: number | null
          prediction_timestamp?: string | null
          seasonal_price?: number | null
          seasonal_weight?: number | null
          target_timestamp: string
        }
        Update: {
          actual_price?: number | null
          arima_price?: number | null
          arima_weight?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          ensemble_error?: number | null
          ensemble_price?: number
          ensemble_smape?: number | null
          id?: string
          ma_weight?: number | null
          ml_predictor_price?: number | null
          ml_weight?: number | null
          model_version?: string | null
          moving_average_price?: number | null
          prediction_std?: number | null
          prediction_timestamp?: string | null
          seasonal_price?: number | null
          seasonal_weight?: number | null
          target_timestamp?: string
        }
        Relationships: []
      }
      aeso_grid_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          description: string | null
          guid: string | null
          id: string
          link: string | null
          published_at: string
          source: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          guid?: string | null
          id?: string
          link?: string | null
          published_at: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          guid?: string | null
          id?: string
          link?: string | null
          published_at?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      aeso_hyperparameter_trials: {
        Row: {
          created_at: string
          hyperparameters: Json
          id: string
          is_best_trial: boolean | null
          model_version: string
          performance_metrics: Json
          training_duration_seconds: number | null
          trial_number: number
        }
        Insert: {
          created_at?: string
          hyperparameters: Json
          id?: string
          is_best_trial?: boolean | null
          model_version: string
          performance_metrics: Json
          training_duration_seconds?: number | null
          trial_number: number
        }
        Update: {
          created_at?: string
          hyperparameters?: Json
          id?: string
          is_best_trial?: boolean | null
          model_version?: string
          performance_metrics?: Json
          training_duration_seconds?: number | null
          trial_number?: number
        }
        Relationships: []
      }
      aeso_market_regimes: {
        Row: {
          avg_load_24h: number
          avg_price_24h: number
          confidence: number
          created_at: string | null
          id: string
          price_volatility_24h: number
          regime: string
          renewable_percentage: number
          timestamp: string
        }
        Insert: {
          avg_load_24h: number
          avg_price_24h: number
          confidence: number
          created_at?: string | null
          id?: string
          price_volatility_24h: number
          regime: string
          renewable_percentage: number
          timestamp: string
        }
        Update: {
          avg_load_24h?: number
          avg_price_24h?: number
          confidence?: number
          created_at?: string | null
          id?: string
          price_volatility_24h?: number
          regime?: string
          renewable_percentage?: number
          timestamp?: string
        }
        Relationships: []
      }
      aeso_model_parameters: {
        Row: {
          created_at: string
          ensemble_config: Json | null
          feature_correlations: Json | null
          feature_scaling: Json | null
          feature_statistics: Json | null
          hyperparameters: Json | null
          id: string
          learning_rate: number | null
          max_depth: number | null
          min_samples_split: number | null
          model_version: string
          n_estimators: number | null
          optimization_history: Json | null
          parameter_name: string
          parameter_type: string
          parameter_value: number
          subsample: number | null
          training_samples: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          ensemble_config?: Json | null
          feature_correlations?: Json | null
          feature_scaling?: Json | null
          feature_statistics?: Json | null
          hyperparameters?: Json | null
          id?: string
          learning_rate?: number | null
          max_depth?: number | null
          min_samples_split?: number | null
          model_version: string
          n_estimators?: number | null
          optimization_history?: Json | null
          parameter_name: string
          parameter_type: string
          parameter_value: number
          subsample?: number | null
          training_samples: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          ensemble_config?: Json | null
          feature_correlations?: Json | null
          feature_scaling?: Json | null
          feature_statistics?: Json | null
          hyperparameters?: Json | null
          id?: string
          learning_rate?: number | null
          max_depth?: number | null
          min_samples_split?: number | null
          model_version?: string
          n_estimators?: number | null
          optimization_history?: Json | null
          parameter_name?: string
          parameter_type?: string
          parameter_value?: number
          subsample?: number | null
          training_samples?: number
          updated_at?: string
        }
        Relationships: []
      }
      aeso_model_performance: {
        Row: {
          created_at: string | null
          drift_metrics: Json | null
          evaluation_date: string | null
          feature_importance: Json | null
          id: string
          mae: number | null
          mape: number | null
          metadata: Json | null
          model_version: string
          prediction_interval_80: number | null
          prediction_interval_95: number | null
          predictions_evaluated: number | null
          r_squared: number | null
          regime_performance: Json | null
          residual_std_dev: number | null
          rmse: number | null
          smape: number | null
          training_period_end: string | null
          training_period_start: string | null
          training_quality_score: number | null
          training_records: number | null
        }
        Insert: {
          created_at?: string | null
          drift_metrics?: Json | null
          evaluation_date?: string | null
          feature_importance?: Json | null
          id?: string
          mae?: number | null
          mape?: number | null
          metadata?: Json | null
          model_version: string
          prediction_interval_80?: number | null
          prediction_interval_95?: number | null
          predictions_evaluated?: number | null
          r_squared?: number | null
          regime_performance?: Json | null
          residual_std_dev?: number | null
          rmse?: number | null
          smape?: number | null
          training_period_end?: string | null
          training_period_start?: string | null
          training_quality_score?: number | null
          training_records?: number | null
        }
        Update: {
          created_at?: string | null
          drift_metrics?: Json | null
          evaluation_date?: string | null
          feature_importance?: Json | null
          id?: string
          mae?: number | null
          mape?: number | null
          metadata?: Json | null
          model_version?: string
          prediction_interval_80?: number | null
          prediction_interval_95?: number | null
          predictions_evaluated?: number | null
          r_squared?: number | null
          regime_performance?: Json | null
          residual_std_dev?: number | null
          rmse?: number | null
          smape?: number | null
          training_period_end?: string | null
          training_period_start?: string | null
          training_quality_score?: number | null
          training_records?: number | null
        }
        Relationships: []
      }
      aeso_model_versions: {
        Row: {
          created_at: string | null
          deployed_at: string | null
          description: string | null
          hyperparameters: Json | null
          id: string
          is_active: boolean | null
          model_type: string
          performance_metrics: Json | null
          training_config: Json | null
          version_name: string
        }
        Insert: {
          created_at?: string | null
          deployed_at?: string | null
          description?: string | null
          hyperparameters?: Json | null
          id?: string
          is_active?: boolean | null
          model_type: string
          performance_metrics?: Json | null
          training_config?: Json | null
          version_name: string
        }
        Update: {
          created_at?: string | null
          deployed_at?: string | null
          description?: string | null
          hyperparameters?: Json | null
          id?: string
          is_active?: boolean | null
          model_type?: string
          performance_metrics?: Json | null
          training_config?: Json | null
          version_name?: string
        }
        Relationships: []
      }
      aeso_model_weights: {
        Row: {
          arima_recent_smape: number | null
          arima_weight: number
          created_at: string | null
          effective_date: string
          evaluation_period_days: number | null
          id: string
          ma_recent_smape: number | null
          ma_weight: number
          ml_recent_smape: number | null
          ml_weight: number
          seasonal_recent_smape: number | null
          seasonal_weight: number
        }
        Insert: {
          arima_recent_smape?: number | null
          arima_weight: number
          created_at?: string | null
          effective_date: string
          evaluation_period_days?: number | null
          id?: string
          ma_recent_smape?: number | null
          ma_weight: number
          ml_recent_smape?: number | null
          ml_weight: number
          seasonal_recent_smape?: number | null
          seasonal_weight: number
        }
        Update: {
          arima_recent_smape?: number | null
          arima_weight?: number
          created_at?: string | null
          effective_date?: string
          evaluation_period_days?: number | null
          id?: string
          ma_recent_smape?: number | null
          ma_weight?: number
          ml_recent_smape?: number | null
          ml_weight?: number
          seasonal_recent_smape?: number | null
          seasonal_weight?: number
        }
        Relationships: []
      }
      aeso_natural_gas_prices: {
        Row: {
          created_at: string
          id: string
          market: string
          price: number
          source: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          market?: string
          price: number
          source?: string
          timestamp: string
        }
        Update: {
          created_at?: string
          id?: string
          market?: string
          price?: number
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      aeso_prediction_accuracy: {
        Row: {
          absolute_error: number
          actual_price: number
          actual_regime: string | null
          created_at: string
          horizon_hours: number
          id: string
          model_version: string | null
          percent_error: number
          predicted_price: number
          predicted_regime: string | null
          prediction_id: string | null
          spike_risk: number | null
          symmetric_percent_error: number | null
          target_timestamp: string
          validated_at: string | null
          within_confidence: boolean | null
        }
        Insert: {
          absolute_error: number
          actual_price: number
          actual_regime?: string | null
          created_at?: string
          horizon_hours: number
          id?: string
          model_version?: string | null
          percent_error: number
          predicted_price: number
          predicted_regime?: string | null
          prediction_id?: string | null
          spike_risk?: number | null
          symmetric_percent_error?: number | null
          target_timestamp: string
          validated_at?: string | null
          within_confidence?: boolean | null
        }
        Update: {
          absolute_error?: number
          actual_price?: number
          actual_regime?: string | null
          created_at?: string
          horizon_hours?: number
          id?: string
          model_version?: string | null
          percent_error?: number
          predicted_price?: number
          predicted_regime?: string | null
          prediction_id?: string | null
          spike_risk?: number | null
          symmetric_percent_error?: number | null
          target_timestamp?: string
          validated_at?: string | null
          within_confidence?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "aeso_prediction_accuracy_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "aeso_price_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      aeso_prediction_explanations: {
        Row: {
          confidence_breakdown: Json
          created_at: string
          explanation_text: string
          feature_contributions: Json
          id: string
          key_drivers: Json
          model_version: string
          predicted_price: number
          prediction_id: string
          sensitivity_analysis: Json
          target_timestamp: string
          updated_at: string
        }
        Insert: {
          confidence_breakdown: Json
          created_at?: string
          explanation_text: string
          feature_contributions: Json
          id?: string
          key_drivers: Json
          model_version: string
          predicted_price: number
          prediction_id: string
          sensitivity_analysis: Json
          target_timestamp: string
          updated_at?: string
        }
        Update: {
          confidence_breakdown?: Json
          created_at?: string
          explanation_text?: string
          feature_contributions?: Json
          id?: string
          key_drivers?: Json
          model_version?: string
          predicted_price?: number
          prediction_id?: string
          sensitivity_analysis?: Json
          target_timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      aeso_prediction_performance: {
        Row: {
          cache_hit_count: number
          cache_hit_rate: number
          cache_miss_count: number
          created_at: string
          horizon_hours: number
          id: string
          metadata: Json | null
          predictions_generated: number
          request_timestamp: string
          total_duration_ms: number
        }
        Insert: {
          cache_hit_count?: number
          cache_hit_rate?: number
          cache_miss_count?: number
          created_at?: string
          horizon_hours: number
          id?: string
          metadata?: Json | null
          predictions_generated?: number
          request_timestamp?: string
          total_duration_ms: number
        }
        Update: {
          cache_hit_count?: number
          cache_hit_rate?: number
          cache_miss_count?: number
          created_at?: string
          horizon_hours?: number
          id?: string
          metadata?: Json | null
          predictions_generated?: number
          request_timestamp?: string
          total_duration_ms?: number
        }
        Relationships: []
      }
      aeso_predictions: {
        Row: {
          absolute_error: number | null
          actual_price: number | null
          confidence: number | null
          created_at: string | null
          hours_ahead: number
          id: string
          individual_predictions: Json | null
          model_version: string
          percent_error: number | null
          predicted_at: string
          predicted_price: number
          prediction_error: number | null
          prediction_method: string | null
          target_timestamp: string
        }
        Insert: {
          absolute_error?: number | null
          actual_price?: number | null
          confidence?: number | null
          created_at?: string | null
          hours_ahead: number
          id?: string
          individual_predictions?: Json | null
          model_version: string
          percent_error?: number | null
          predicted_at: string
          predicted_price: number
          prediction_error?: number | null
          prediction_method?: string | null
          target_timestamp: string
        }
        Update: {
          absolute_error?: number | null
          actual_price?: number | null
          confidence?: number | null
          created_at?: string | null
          hours_ahead?: number
          id?: string
          individual_predictions?: Json | null
          model_version?: string
          percent_error?: number | null
          predicted_at?: string
          predicted_price?: number
          prediction_error?: number | null
          prediction_method?: string | null
          target_timestamp?: string
        }
        Relationships: []
      }
      aeso_price_predictions: {
        Row: {
          absolute_error: number | null
          actual_price: number | null
          confidence_lower: number | null
          confidence_score: number | null
          confidence_upper: number | null
          created_at: string | null
          features_used: Json | null
          horizon_hours: number
          id: string
          model_version: string | null
          percent_error: number | null
          predicted_price: number
          prediction_timestamp: string
          symmetric_percent_error: number | null
          target_timestamp: string
          validated_at: string | null
        }
        Insert: {
          absolute_error?: number | null
          actual_price?: number | null
          confidence_lower?: number | null
          confidence_score?: number | null
          confidence_upper?: number | null
          created_at?: string | null
          features_used?: Json | null
          horizon_hours: number
          id?: string
          model_version?: string | null
          percent_error?: number | null
          predicted_price: number
          prediction_timestamp: string
          symmetric_percent_error?: number | null
          target_timestamp: string
          validated_at?: string | null
        }
        Update: {
          absolute_error?: number | null
          actual_price?: number | null
          confidence_lower?: number | null
          confidence_score?: number | null
          confidence_upper?: number | null
          created_at?: string | null
          features_used?: Json | null
          horizon_hours?: number
          id?: string
          model_version?: string | null
          percent_error?: number | null
          predicted_price?: number
          prediction_timestamp?: string
          symmetric_percent_error?: number | null
          target_timestamp?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      aeso_report_translations: {
        Row: {
          created_at: string | null
          id: string
          report_id: string | null
          target_language: string
          translated_content: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          target_language: string
          translated_content: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          report_id?: string | null
          target_language?: string
          translated_content?: Json
        }
        Relationships: [
          {
            foreignKeyName: "aeso_report_translations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "shared_aeso_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      aeso_retraining_history: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          improvement: number | null
          performance_after: number | null
          performance_before: number | null
          reason: string
          training_records_after: number | null
          training_records_before: number | null
          triggered: boolean
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          improvement?: number | null
          performance_after?: number | null
          performance_before?: number | null
          reason: string
          training_records_after?: number | null
          training_records_before?: number | null
          triggered?: boolean
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          improvement?: number | null
          performance_after?: number | null
          performance_before?: number | null
          reason?: string
          training_records_after?: number | null
          training_records_before?: number | null
          triggered?: boolean
        }
        Relationships: []
      }
      aeso_retraining_schedule: {
        Row: {
          created_at: string
          id: string
          model_version: string
          performance_after: Json | null
          performance_before: Json | null
          scheduled_at: string
          status: string
          training_completed_at: string | null
          training_started_at: string | null
          trigger_reason: string | null
          triggered_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_version: string
          performance_after?: Json | null
          performance_before?: Json | null
          scheduled_at: string
          status?: string
          training_completed_at?: string | null
          training_started_at?: string | null
          trigger_reason?: string | null
          triggered_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_version?: string
          performance_after?: Json | null
          performance_before?: Json | null
          scheduled_at?: string
          status?: string
          training_completed_at?: string | null
          training_started_at?: string | null
          trigger_reason?: string | null
          triggered_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      aeso_scheduled_tasks: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          last_run: string | null
          next_run: string | null
          result: Json | null
          status: string | null
          task_name: string
          task_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          last_run?: string | null
          next_run?: string | null
          result?: Json | null
          status?: string | null
          task_name: string
          task_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          last_run?: string | null
          next_run?: string | null
          result?: Json | null
          status?: string | null
          task_name?: string
          task_type?: string
        }
        Relationships: []
      }
      aeso_shared_dashboards: {
        Row: {
          access_level: string
          allowed_domains: string[] | null
          allowed_ips: string[] | null
          created_at: string
          created_by: string | null
          current_views: number | null
          custom_branding: Json | null
          dashboard_id: string
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          max_views: number | null
          password_hash: string | null
          recipient_email: string | null
          recipient_name: string | null
          require_otp: boolean | null
          share_token: string
          status: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          allowed_domains?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string
          created_by?: string | null
          current_views?: number | null
          custom_branding?: Json | null
          dashboard_id: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          require_otp?: boolean | null
          share_token: string
          status?: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          allowed_domains?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string
          created_by?: string | null
          current_views?: number | null
          custom_branding?: Json | null
          dashboard_id?: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          max_views?: number | null
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          require_otp?: boolean | null
          share_token?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aeso_shared_dashboards_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      aeso_training_data: {
        Row: {
          ail_mw: number | null
          available_capacity_mw: number | null
          cloud_cover: number | null
          cooling_degree_days: number | null
          created_at: string | null
          day_of_week: number | null
          day_type: number | null
          demand_bin: number | null
          demand_forecast_error: number | null
          demand_lag_3h: number | null
          demand_lag_6h: number | null
          demand_quantile_90th_24h: number | null
          demand_ramp_rate: number | null
          demand_squared: number | null
          demand_volatility_6h: number | null
          fourier_annual_cos_1: number | null
          fourier_annual_cos_2: number | null
          fourier_annual_sin_1: number | null
          fourier_annual_sin_2: number | null
          fourier_daily_cos_1: number | null
          fourier_daily_cos_2: number | null
          fourier_daily_sin_1: number | null
          fourier_daily_sin_2: number | null
          fourier_weekly_cos: number | null
          fourier_weekly_sin: number | null
          gas_demand_interaction: number | null
          gas_generation_ratio: number | null
          gas_price_aeco: number | null
          gas_price_demand_cross: number | null
          gas_price_lag_24h: number | null
          gas_price_ma_7d: number | null
          gas_price_momentum: number | null
          gas_temp_interaction: number | null
          gas_wind_interaction: number | null
          generation_coal: number | null
          generation_gas: number | null
          generation_hydro: number | null
          generation_outages_mw: number | null
          generation_solar: number | null
          generation_wind: number | null
          grid_stress_score: number | null
          heating_degree_days: number | null
          hour_of_day: number | null
          hour_of_week: number | null
          id: string
          interchange_net: number | null
          intertie_bc_flow: number | null
          intertie_montana_flow: number | null
          intertie_sask_flow: number | null
          is_evening_peak: number | null
          is_holiday: boolean | null
          is_morning_ramp: number | null
          is_overnight: number | null
          is_valid_record: boolean | null
          is_weekend: boolean | null
          load_forecast_1h: number | null
          load_forecast_24h: number | null
          load_forecast_3h: number | null
          market_stress_score: number | null
          month: number | null
          net_demand: number | null
          operating_reserve: number | null
          operating_reserve_price: number | null
          outage_capacity_mw: number | null
          pool_price: number
          pool_price_forecast_1h: number | null
          pool_price_forecast_24h: number | null
          pool_price_forecast_3h: number | null
          price_acceleration: number | null
          price_bin: number | null
          price_cubed: number | null
          price_demand_cross: number | null
          price_demand_ratio: number | null
          price_lag_12h: number | null
          price_lag_168h: number | null
          price_lag_1h: number | null
          price_lag_24h: number | null
          price_lag_2h: number | null
          price_lag_3h: number | null
          price_lag_48h: number | null
          price_lag_6h: number | null
          price_lag_72h: number | null
          price_momentum_1h: number | null
          price_momentum_3h: number | null
          price_per_mw_demand: number | null
          price_quantile_10th_24h: number | null
          price_quantile_50th_24h: number | null
          price_quantile_90th_24h: number | null
          price_ramp_rate: number | null
          price_rolling_avg_24h: number | null
          price_rolling_std_24h: number | null
          price_spike_probability: number | null
          price_squared: number | null
          price_to_ma_ratio: number | null
          price_volatility_12h: number | null
          price_volatility_3h: number | null
          price_volatility_6h: number | null
          renewable_bin: number | null
          renewable_capacity_factor: number | null
          renewable_penetration: number | null
          renewable_price_cross: number | null
          renewable_ratio: number | null
          renewable_volatility: number | null
          reserve_margin_percent: number | null
          season: string | null
          smp_pool_price_spread: number | null
          solar_forecast_1h: number | null
          solar_forecast_24h: number | null
          solar_forecast_3h: number | null
          solar_irradiance: number | null
          spinning_reserve_mw: number | null
          supplemental_reserve_mw: number | null
          supply_cushion: number | null
          system_marginal_price: number | null
          temp_demand_hour_interaction: number | null
          temp_demand_interaction: number | null
          temp_extreme_cold: number | null
          temp_extreme_hot: number | null
          temperature_calgary: number | null
          temperature_demand_cross: number | null
          temperature_edmonton: number | null
          time_bin: number | null
          timestamp: string
          total_interchange_flow: number | null
          transmission_constraint_hours: number | null
          transmission_outages_count: number | null
          volatility_trend: number | null
          weekend_demand_factor: number | null
          wind_forecast_1h: number | null
          wind_forecast_24h: number | null
          wind_forecast_3h: number | null
          wind_generation_squared: number | null
          wind_hour_interaction: number | null
          wind_lag_3h: number | null
          wind_lag_6h: number | null
          wind_ramp_rate: number | null
          wind_solar_demand_interaction: number | null
          wind_speed: number | null
          wind_speed_generation_cross: number | null
          wind_volatility_6h: number | null
        }
        Insert: {
          ail_mw?: number | null
          available_capacity_mw?: number | null
          cloud_cover?: number | null
          cooling_degree_days?: number | null
          created_at?: string | null
          day_of_week?: number | null
          day_type?: number | null
          demand_bin?: number | null
          demand_forecast_error?: number | null
          demand_lag_3h?: number | null
          demand_lag_6h?: number | null
          demand_quantile_90th_24h?: number | null
          demand_ramp_rate?: number | null
          demand_squared?: number | null
          demand_volatility_6h?: number | null
          fourier_annual_cos_1?: number | null
          fourier_annual_cos_2?: number | null
          fourier_annual_sin_1?: number | null
          fourier_annual_sin_2?: number | null
          fourier_daily_cos_1?: number | null
          fourier_daily_cos_2?: number | null
          fourier_daily_sin_1?: number | null
          fourier_daily_sin_2?: number | null
          fourier_weekly_cos?: number | null
          fourier_weekly_sin?: number | null
          gas_demand_interaction?: number | null
          gas_generation_ratio?: number | null
          gas_price_aeco?: number | null
          gas_price_demand_cross?: number | null
          gas_price_lag_24h?: number | null
          gas_price_ma_7d?: number | null
          gas_price_momentum?: number | null
          gas_temp_interaction?: number | null
          gas_wind_interaction?: number | null
          generation_coal?: number | null
          generation_gas?: number | null
          generation_hydro?: number | null
          generation_outages_mw?: number | null
          generation_solar?: number | null
          generation_wind?: number | null
          grid_stress_score?: number | null
          heating_degree_days?: number | null
          hour_of_day?: number | null
          hour_of_week?: number | null
          id?: string
          interchange_net?: number | null
          intertie_bc_flow?: number | null
          intertie_montana_flow?: number | null
          intertie_sask_flow?: number | null
          is_evening_peak?: number | null
          is_holiday?: boolean | null
          is_morning_ramp?: number | null
          is_overnight?: number | null
          is_valid_record?: boolean | null
          is_weekend?: boolean | null
          load_forecast_1h?: number | null
          load_forecast_24h?: number | null
          load_forecast_3h?: number | null
          market_stress_score?: number | null
          month?: number | null
          net_demand?: number | null
          operating_reserve?: number | null
          operating_reserve_price?: number | null
          outage_capacity_mw?: number | null
          pool_price: number
          pool_price_forecast_1h?: number | null
          pool_price_forecast_24h?: number | null
          pool_price_forecast_3h?: number | null
          price_acceleration?: number | null
          price_bin?: number | null
          price_cubed?: number | null
          price_demand_cross?: number | null
          price_demand_ratio?: number | null
          price_lag_12h?: number | null
          price_lag_168h?: number | null
          price_lag_1h?: number | null
          price_lag_24h?: number | null
          price_lag_2h?: number | null
          price_lag_3h?: number | null
          price_lag_48h?: number | null
          price_lag_6h?: number | null
          price_lag_72h?: number | null
          price_momentum_1h?: number | null
          price_momentum_3h?: number | null
          price_per_mw_demand?: number | null
          price_quantile_10th_24h?: number | null
          price_quantile_50th_24h?: number | null
          price_quantile_90th_24h?: number | null
          price_ramp_rate?: number | null
          price_rolling_avg_24h?: number | null
          price_rolling_std_24h?: number | null
          price_spike_probability?: number | null
          price_squared?: number | null
          price_to_ma_ratio?: number | null
          price_volatility_12h?: number | null
          price_volatility_3h?: number | null
          price_volatility_6h?: number | null
          renewable_bin?: number | null
          renewable_capacity_factor?: number | null
          renewable_penetration?: number | null
          renewable_price_cross?: number | null
          renewable_ratio?: number | null
          renewable_volatility?: number | null
          reserve_margin_percent?: number | null
          season?: string | null
          smp_pool_price_spread?: number | null
          solar_forecast_1h?: number | null
          solar_forecast_24h?: number | null
          solar_forecast_3h?: number | null
          solar_irradiance?: number | null
          spinning_reserve_mw?: number | null
          supplemental_reserve_mw?: number | null
          supply_cushion?: number | null
          system_marginal_price?: number | null
          temp_demand_hour_interaction?: number | null
          temp_demand_interaction?: number | null
          temp_extreme_cold?: number | null
          temp_extreme_hot?: number | null
          temperature_calgary?: number | null
          temperature_demand_cross?: number | null
          temperature_edmonton?: number | null
          time_bin?: number | null
          timestamp: string
          total_interchange_flow?: number | null
          transmission_constraint_hours?: number | null
          transmission_outages_count?: number | null
          volatility_trend?: number | null
          weekend_demand_factor?: number | null
          wind_forecast_1h?: number | null
          wind_forecast_24h?: number | null
          wind_forecast_3h?: number | null
          wind_generation_squared?: number | null
          wind_hour_interaction?: number | null
          wind_lag_3h?: number | null
          wind_lag_6h?: number | null
          wind_ramp_rate?: number | null
          wind_solar_demand_interaction?: number | null
          wind_speed?: number | null
          wind_speed_generation_cross?: number | null
          wind_volatility_6h?: number | null
        }
        Update: {
          ail_mw?: number | null
          available_capacity_mw?: number | null
          cloud_cover?: number | null
          cooling_degree_days?: number | null
          created_at?: string | null
          day_of_week?: number | null
          day_type?: number | null
          demand_bin?: number | null
          demand_forecast_error?: number | null
          demand_lag_3h?: number | null
          demand_lag_6h?: number | null
          demand_quantile_90th_24h?: number | null
          demand_ramp_rate?: number | null
          demand_squared?: number | null
          demand_volatility_6h?: number | null
          fourier_annual_cos_1?: number | null
          fourier_annual_cos_2?: number | null
          fourier_annual_sin_1?: number | null
          fourier_annual_sin_2?: number | null
          fourier_daily_cos_1?: number | null
          fourier_daily_cos_2?: number | null
          fourier_daily_sin_1?: number | null
          fourier_daily_sin_2?: number | null
          fourier_weekly_cos?: number | null
          fourier_weekly_sin?: number | null
          gas_demand_interaction?: number | null
          gas_generation_ratio?: number | null
          gas_price_aeco?: number | null
          gas_price_demand_cross?: number | null
          gas_price_lag_24h?: number | null
          gas_price_ma_7d?: number | null
          gas_price_momentum?: number | null
          gas_temp_interaction?: number | null
          gas_wind_interaction?: number | null
          generation_coal?: number | null
          generation_gas?: number | null
          generation_hydro?: number | null
          generation_outages_mw?: number | null
          generation_solar?: number | null
          generation_wind?: number | null
          grid_stress_score?: number | null
          heating_degree_days?: number | null
          hour_of_day?: number | null
          hour_of_week?: number | null
          id?: string
          interchange_net?: number | null
          intertie_bc_flow?: number | null
          intertie_montana_flow?: number | null
          intertie_sask_flow?: number | null
          is_evening_peak?: number | null
          is_holiday?: boolean | null
          is_morning_ramp?: number | null
          is_overnight?: number | null
          is_valid_record?: boolean | null
          is_weekend?: boolean | null
          load_forecast_1h?: number | null
          load_forecast_24h?: number | null
          load_forecast_3h?: number | null
          market_stress_score?: number | null
          month?: number | null
          net_demand?: number | null
          operating_reserve?: number | null
          operating_reserve_price?: number | null
          outage_capacity_mw?: number | null
          pool_price?: number
          pool_price_forecast_1h?: number | null
          pool_price_forecast_24h?: number | null
          pool_price_forecast_3h?: number | null
          price_acceleration?: number | null
          price_bin?: number | null
          price_cubed?: number | null
          price_demand_cross?: number | null
          price_demand_ratio?: number | null
          price_lag_12h?: number | null
          price_lag_168h?: number | null
          price_lag_1h?: number | null
          price_lag_24h?: number | null
          price_lag_2h?: number | null
          price_lag_3h?: number | null
          price_lag_48h?: number | null
          price_lag_6h?: number | null
          price_lag_72h?: number | null
          price_momentum_1h?: number | null
          price_momentum_3h?: number | null
          price_per_mw_demand?: number | null
          price_quantile_10th_24h?: number | null
          price_quantile_50th_24h?: number | null
          price_quantile_90th_24h?: number | null
          price_ramp_rate?: number | null
          price_rolling_avg_24h?: number | null
          price_rolling_std_24h?: number | null
          price_spike_probability?: number | null
          price_squared?: number | null
          price_to_ma_ratio?: number | null
          price_volatility_12h?: number | null
          price_volatility_3h?: number | null
          price_volatility_6h?: number | null
          renewable_bin?: number | null
          renewable_capacity_factor?: number | null
          renewable_penetration?: number | null
          renewable_price_cross?: number | null
          renewable_ratio?: number | null
          renewable_volatility?: number | null
          reserve_margin_percent?: number | null
          season?: string | null
          smp_pool_price_spread?: number | null
          solar_forecast_1h?: number | null
          solar_forecast_24h?: number | null
          solar_forecast_3h?: number | null
          solar_irradiance?: number | null
          spinning_reserve_mw?: number | null
          supplemental_reserve_mw?: number | null
          supply_cushion?: number | null
          system_marginal_price?: number | null
          temp_demand_hour_interaction?: number | null
          temp_demand_interaction?: number | null
          temp_extreme_cold?: number | null
          temp_extreme_hot?: number | null
          temperature_calgary?: number | null
          temperature_demand_cross?: number | null
          temperature_edmonton?: number | null
          time_bin?: number | null
          timestamp?: string
          total_interchange_flow?: number | null
          transmission_constraint_hours?: number | null
          transmission_outages_count?: number | null
          volatility_trend?: number | null
          weekend_demand_factor?: number | null
          wind_forecast_1h?: number | null
          wind_forecast_24h?: number | null
          wind_forecast_3h?: number | null
          wind_generation_squared?: number | null
          wind_hour_interaction?: number | null
          wind_lag_3h?: number | null
          wind_lag_6h?: number | null
          wind_ramp_rate?: number | null
          wind_solar_demand_interaction?: number | null
          wind_speed?: number | null
          wind_speed_generation_cross?: number | null
          wind_volatility_6h?: number | null
        }
        Relationships: []
      }
      aeso_weather_forecasts: {
        Row: {
          cloud_cover: number | null
          created_at: string | null
          forecast_timestamp: string
          id: string
          location: string | null
          precipitation_probability: number | null
          target_timestamp: string
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          cloud_cover?: number | null
          created_at?: string | null
          forecast_timestamp: string
          id?: string
          location?: string | null
          precipitation_probability?: number | null
          target_timestamp: string
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          cloud_cover?: number | null
          created_at?: string | null
          forecast_timestamp?: string
          id?: string
          location?: string | null
          precipitation_probability?: number | null
          target_timestamp?: string
          temperature?: number | null
          wind_speed?: number | null
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
      ai_trading_advisories: {
        Row: {
          advisory_type: string
          confidence: number
          created_at: string
          generated_at: string
          id: string
          key_insights: Json
          market: string
          model_performance_snapshot: Json | null
          opportunities: Json | null
          outlook: string
          predictions_analyzed: number
          price_targets: Json | null
          recommendations: Json
          risk_assessment: Json
          summary: string
        }
        Insert: {
          advisory_type?: string
          confidence: number
          created_at?: string
          generated_at?: string
          id?: string
          key_insights: Json
          market: string
          model_performance_snapshot?: Json | null
          opportunities?: Json | null
          outlook: string
          predictions_analyzed?: number
          price_targets?: Json | null
          recommendations: Json
          risk_assessment: Json
          summary: string
        }
        Update: {
          advisory_type?: string
          confidence?: number
          created_at?: string
          generated_at?: string
          id?: string
          key_insights?: Json
          market?: string
          model_performance_snapshot?: Json | null
          opportunities?: Json | null
          outlook?: string
          predictions_analyzed?: number
          price_targets?: Json | null
          recommendations?: Json
          risk_assessment?: Json
          summary?: string
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
      arbitrage_opportunities: {
        Row: {
          created_at: string
          execution_window_end: string | null
          execution_window_start: string | null
          id: string
          market_from: string
          market_to: string
          price_spread: number | null
          profit_potential: number | null
          risk_adjusted_return: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          execution_window_end?: string | null
          execution_window_start?: string | null
          id?: string
          market_from: string
          market_to: string
          price_spread?: number | null
          profit_potential?: number | null
          risk_adjusted_return?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          execution_window_end?: string | null
          execution_window_start?: string | null
          id?: string
          market_from?: string
          market_to?: string
          price_spread?: number | null
          profit_potential?: number | null
          risk_adjusted_return?: number | null
          status?: string | null
        }
        Relationships: []
      }
      asic_miners: {
        Row: {
          algorithm: string
          cooling_type: string
          created_at: string
          efficiency_jth: number
          generation: string
          hashrate_th: number
          id: string
          is_available: boolean
          manufacturer: string
          market_price_usd: number | null
          model: string
          msrp_usd: number | null
          notes: string | null
          power_watts: number
          release_date: string | null
          updated_at: string
        }
        Insert: {
          algorithm?: string
          cooling_type?: string
          created_at?: string
          efficiency_jth: number
          generation?: string
          hashrate_th: number
          id?: string
          is_available?: boolean
          manufacturer: string
          market_price_usd?: number | null
          model: string
          msrp_usd?: number | null
          notes?: string | null
          power_watts: number
          release_date?: string | null
          updated_at?: string
        }
        Update: {
          algorithm?: string
          cooling_type?: string
          created_at?: string
          efficiency_jth?: number
          generation?: string
          hashrate_th?: number
          id?: string
          is_available?: boolean
          manufacturer?: string
          market_price_usd?: number | null
          model?: string
          msrp_usd?: number | null
          notes?: string | null
          power_watts?: number
          release_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      automated_due_diligence: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          recommendations: Json | null
          report_data: Json | null
          report_type: string
          risk_score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          recommendations?: Json | null
          report_data?: Json | null
          report_type: string
          risk_score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          recommendations?: Json | null
          report_data?: Json | null
          report_type?: string
          risk_score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      bundle_documents: {
        Row: {
          bundle_id: string
          created_at: string | null
          display_order: number | null
          document_id: string
          folder_path: string | null
          id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string | null
          display_order?: number | null
          document_id: string
          folder_path?: string | null
          id?: string
        }
        Update: {
          bundle_id?: string
          created_at?: string | null
          display_order?: number | null
          document_id?: string
          folder_path?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_documents_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "document_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "secure_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_annotations: {
        Row: {
          annotation_type: string
          created_at: string | null
          data: Json
          id: string
          is_visible: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          annotation_type: string
          created_at?: string | null
          data: Json
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          annotation_type?: string
          created_at?: string | null
          data?: Json
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id?: string | null
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
          coordinates: unknown
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
          coordinates?: unknown
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
          coordinates?: unknown
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
      crypto_details_cache: {
        Row: {
          created_at: string
          data: Json
          id: string
          last_updated: string
          symbol: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          last_updated?: string
          symbol: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          last_updated?: string
          symbol?: string
        }
        Relationships: []
      }
      dashboard_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          dashboard_id: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          dashboard_id: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          dashboard_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_activity_log_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_collaborators: {
        Row: {
          added_at: string
          added_by: string
          dashboard_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          dashboard_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          dashboard_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_collaborators_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_comments: {
        Row: {
          comment_text: string
          created_at: string
          dashboard_id: string
          id: string
          is_resolved: boolean | null
          mentioned_users: string[] | null
          parent_comment_id: string | null
          updated_at: string
          user_id: string
          widget_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string
          dashboard_id: string
          id?: string
          is_resolved?: boolean | null
          mentioned_users?: string[] | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
          widget_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string
          dashboard_id?: string
          id?: string
          is_resolved?: boolean | null
          mentioned_users?: string[] | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_comments_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "dashboard_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stars: {
        Row: {
          created_at: string
          dashboard_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_stars_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_tags: {
        Row: {
          created_at: string
          dashboard_id: string
          id: string
          tag: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          id?: string
          tag: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_tags_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_versions: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          dashboard_id: string
          dashboard_snapshot: Json
          id: string
          version_number: number
          widgets_snapshot: Json
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          created_by: string
          dashboard_id: string
          dashboard_snapshot: Json
          id?: string
          version_number: number
          widgets_snapshot: Json
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string
          dashboard_id?: string
          dashboard_snapshot?: Json
          id?: string
          version_number?: number
          widgets_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_versions_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_view_logs: {
        Row: {
          dashboard_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          dashboard_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          dashboard_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_view_logs_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "aeso_custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      datacenter_automation_log: {
        Row: {
          action_type: string
          actual_savings_cad: number | null
          affected_pdu_count: number | null
          affected_pdus: string[] | null
          ai_prediction_price: number | null
          completed_at: string | null
          created_at: string | null
          decision_confidence: number | null
          duration_seconds: number | null
          error_message: string | null
          estimated_savings_cad: number | null
          executed_at: string | null
          executed_by: string | null
          grid_stress_level: string | null
          id: string
          market_regime: string | null
          metadata: Json | null
          rule_id: string | null
          status: string | null
          threshold_price: number | null
          total_load_affected_kw: number | null
          trigger_price: number | null
        }
        Insert: {
          action_type: string
          actual_savings_cad?: number | null
          affected_pdu_count?: number | null
          affected_pdus?: string[] | null
          ai_prediction_price?: number | null
          completed_at?: string | null
          created_at?: string | null
          decision_confidence?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          estimated_savings_cad?: number | null
          executed_at?: string | null
          executed_by?: string | null
          grid_stress_level?: string | null
          id?: string
          market_regime?: string | null
          metadata?: Json | null
          rule_id?: string | null
          status?: string | null
          threshold_price?: number | null
          total_load_affected_kw?: number | null
          trigger_price?: number | null
        }
        Update: {
          action_type?: string
          actual_savings_cad?: number | null
          affected_pdu_count?: number | null
          affected_pdus?: string[] | null
          ai_prediction_price?: number | null
          completed_at?: string | null
          created_at?: string | null
          decision_confidence?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          estimated_savings_cad?: number | null
          executed_at?: string | null
          executed_by?: string | null
          grid_stress_level?: string | null
          id?: string
          market_regime?: string | null
          metadata?: Json | null
          rule_id?: string | null
          status?: string | null
          threshold_price?: number | null
          total_load_affected_kw?: number | null
          trigger_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "datacenter_automation_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "datacenter_shutdown_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      datacenter_cost_savings: {
        Row: {
          average_price_avoided_cad: number | null
          created_at: string | null
          false_positive_count: number | null
          id: string
          peak_price_avoided_cad: number | null
          period_end: string
          period_start: string
          resume_count: number | null
          shutdown_count: number | null
          total_curtailment_hours: number | null
          total_energy_avoided_kwh: number | null
          total_savings_cad: number | null
          uptime_percentage: number | null
        }
        Insert: {
          average_price_avoided_cad?: number | null
          created_at?: string | null
          false_positive_count?: number | null
          id?: string
          peak_price_avoided_cad?: number | null
          period_end: string
          period_start: string
          resume_count?: number | null
          shutdown_count?: number | null
          total_curtailment_hours?: number | null
          total_energy_avoided_kwh?: number | null
          total_savings_cad?: number | null
          uptime_percentage?: number | null
        }
        Update: {
          average_price_avoided_cad?: number | null
          created_at?: string | null
          false_positive_count?: number | null
          id?: string
          peak_price_avoided_cad?: number | null
          period_end?: string
          period_start?: string
          resume_count?: number | null
          shutdown_count?: number | null
          total_curtailment_hours?: number | null
          total_energy_avoided_kwh?: number | null
          total_savings_cad?: number | null
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      datacenter_notification_settings: {
        Row: {
          channel: string
          created_at: string | null
          delay_minutes: number | null
          destination: string | null
          id: string
          is_active: boolean | null
          notify_on_resume: boolean | null
          notify_on_shutdown: boolean | null
          notify_on_warning: boolean | null
          rule_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          delay_minutes?: number | null
          destination?: string | null
          id?: string
          is_active?: boolean | null
          notify_on_resume?: boolean | null
          notify_on_shutdown?: boolean | null
          notify_on_warning?: boolean | null
          rule_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          delay_minutes?: number | null
          destination?: string | null
          id?: string
          is_active?: boolean | null
          notify_on_resume?: boolean | null
          notify_on_shutdown?: boolean | null
          notify_on_warning?: boolean | null
          rule_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "datacenter_notification_settings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "datacenter_shutdown_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      datacenter_shutdown_rules: {
        Row: {
          affected_priority_groups: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_threshold_minutes: number | null
          grace_period_seconds: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          notification_channels: string[] | null
          price_ceiling_cad: number
          price_floor_cad: number
          soft_ceiling_cad: number | null
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          affected_priority_groups?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_threshold_minutes?: number | null
          grace_period_seconds?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          notification_channels?: string[] | null
          price_ceiling_cad: number
          price_floor_cad: number
          soft_ceiling_cad?: number | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          affected_priority_groups?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_threshold_minutes?: number | null
          grace_period_seconds?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          notification_channels?: string[] | null
          price_ceiling_cad?: number
          price_floor_cad?: number
          soft_ceiling_cad?: number | null
          trigger_count?: number | null
          updated_at?: string | null
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
      document_bundles: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          folder_structure: Json | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          folder_structure?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          folder_structure?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_permissions: {
        Row: {
          document_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          permission_level: Database["public"]["Enums"]["permission_level"]
          user_id: string
        }
        Insert: {
          document_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          permission_level: Database["public"]["Enums"]["permission_level"]
          user_id: string
        }
        Update: {
          document_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_translations: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          original_text: string | null
          page_number: number
          source_language: string
          target_language: string
          text_hash: string
          translated_text: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          original_text?: string | null
          page_number: number
          source_language?: string
          target_language: string
          text_hash: string
          translated_text: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          original_text?: string | null
          page_number?: number
          source_language?: string
          target_language?: string
          text_hash?: string
          translated_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_translations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "secure_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"] | null
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          folder_id: string | null
          id: string
          is_private: boolean | null
          name: string
          owner_id: string
          tags: string[] | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"] | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder_id?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          owner_id: string
          tags?: string[] | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"] | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder_id?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          owner_id?: string
          tags?: string[] | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_reports: {
        Row: {
          company_id: string | null
          created_at: string
          executive_summary: string | null
          financial_analysis: Json | null
          generated_by: string | null
          id: string
          listing_id: string | null
          power_infrastructure_assessment: Json | null
          recommendations: string[] | null
          report_data: Json | null
          report_type: string
          risk_assessment: Json | null
          updated_at: string
          valuation_analysis: Json | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          executive_summary?: string | null
          financial_analysis?: Json | null
          generated_by?: string | null
          id?: string
          listing_id?: string | null
          power_infrastructure_assessment?: Json | null
          recommendations?: string[] | null
          report_data?: Json | null
          report_type: string
          risk_assessment?: Json | null
          updated_at?: string
          valuation_analysis?: Json | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          executive_summary?: string | null
          financial_analysis?: Json | null
          generated_by?: string | null
          id?: string
          listing_id?: string | null
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
          {
            foreignKeyName: "due_diligence_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing: {
        Row: {
          asset_id: string | null
          asset_type: string
          base_price: number | null
          created_at: string
          dynamic_price: number | null
          id: string
          market_conditions: Json | null
          pricing_factors: Json | null
          valid_until: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_type: string
          base_price?: number | null
          created_at?: string
          dynamic_price?: number | null
          id?: string
          market_conditions?: Json | null
          pricing_factors?: Json | null
          valid_until?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_type?: string
          base_price?: number | null
          created_at?: string
          dynamic_price?: number | null
          id?: string
          market_conditions?: Json | null
          pricing_factors?: Json | null
          valid_until?: string | null
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
      generated_reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          file_url: string | null
          generated_by: string
          id: string
          name: string
          parameters: Json | null
          report_data: Json
          status: string | null
          template_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          generated_by: string
          id?: string
          name: string
          parameters?: Json | null
          report_data: Json
          status?: string | null
          template_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          generated_by?: string
          id?: string
          name?: string
          parameters?: Json | null
          report_data?: Json
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      gridbazaar_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          created_at: string
          id: string
          is_email_verified: boolean
          is_id_verified: boolean
          linkedin_url: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: string
          seller_type: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          is_email_verified?: boolean
          is_id_verified?: boolean
          linkedin_url?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          seller_type?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          is_email_verified?: boolean
          is_id_verified?: boolean
          linkedin_url?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          seller_type?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      industry_intel_results: {
        Row: {
          address: string | null
          ai_insights: string | null
          city: string | null
          coordinates: unknown
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
          coordinates?: unknown
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
          coordinates?: unknown
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
      intelligence_hub_alert_preferences: {
        Row: {
          created_at: string
          enable_distress_signal_alerts: boolean
          enable_email_notifications: boolean
          enable_new_opportunity_alerts: boolean
          enable_price_change_alerts: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enable_distress_signal_alerts?: boolean
          enable_email_notifications?: boolean
          enable_new_opportunity_alerts?: boolean
          enable_price_change_alerts?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enable_distress_signal_alerts?: boolean
          enable_email_notifications?: boolean
          enable_new_opportunity_alerts?: boolean
          enable_price_change_alerts?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_hub_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          opportunity_id: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          opportunity_id?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          opportunity_id?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_hub_saved_opportunities: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          opportunity_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_hub_scan_history: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          results_count: number
          scan_config: Json
          status: string
          total_mw: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          results_count?: number
          scan_config: Json
          status?: string
          total_mw?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          results_count?: number
          scan_config?: Json
          status?: string
          total_mw?: number | null
          user_id?: string
        }
        Relationships: []
      }
      intelligence_hub_watchlist: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          opportunity_name: string
          opportunity_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          opportunity_name: string
          opportunity_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          opportunity_name?: string
          opportunity_type?: string
          user_id?: string
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
      market_configurations: {
        Row: {
          created_at: string
          currency: string
          features: Json | null
          id: string
          market_code: string
          market_name: string
          metadata: Json | null
          predictor_available: boolean
          region: string
          spike_threshold: number | null
          status: string
          typical_price_max: number | null
          typical_price_min: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          market_code: string
          market_name: string
          metadata?: Json | null
          predictor_available?: boolean
          region: string
          spike_threshold?: number | null
          status?: string
          typical_price_max?: number | null
          typical_price_min?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          market_code?: string
          market_name?: string
          metadata?: Json | null
          predictor_available?: boolean
          region?: string
          spike_threshold?: number | null
          status?: string
          typical_price_max?: number | null
          typical_price_min?: number | null
          unit?: string
          updated_at?: string
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
      multi_market_requests: {
        Row: {
          comparison_enabled: boolean
          created_at: string
          horizon_hours: number
          id: string
          predictions_count: number
          primary_market: string
          request_timestamp: string
        }
        Insert: {
          comparison_enabled?: boolean
          created_at?: string
          horizon_hours: number
          id?: string
          predictions_count?: number
          primary_market: string
          request_timestamp?: string
        }
        Update: {
          comparison_enabled?: boolean
          created_at?: string
          horizon_hours?: number
          id?: string
          predictions_count?: number
          primary_market?: string
          request_timestamp?: string
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          priority: string
          read: boolean | null
          source: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          priority?: string
          read?: boolean | null
          source: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          priority?: string
          read?: boolean | null
          source?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ocr_extractions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          document_id: string
          extracted_text: string
          id: string
          ocr_method: string
          page_number: number
          processing_time_ms: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          document_id: string
          extracted_text: string
          id?: string
          ocr_method: string
          page_number: number
          processing_time_ms?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string
          extracted_text?: string
          id?: string
          ocr_method?: string
          page_number?: number
          processing_time_ms?: number | null
        }
        Relationships: []
      }
      pdu_devices: {
        Row: {
          active_outlets: number | null
          api_endpoint: string | null
          api_key_encrypted: string | null
          created_at: string | null
          created_by: string | null
          current_load_kw: number | null
          current_status: string
          id: string
          ip_address: string | null
          last_status_check: string | null
          location: string | null
          max_capacity_kw: number | null
          metadata: Json | null
          name: string
          priority_group: string
          protocol: string
          total_outlets: number | null
          updated_at: string | null
        }
        Insert: {
          active_outlets?: number | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          current_load_kw?: number | null
          current_status?: string
          id?: string
          ip_address?: string | null
          last_status_check?: string | null
          location?: string | null
          max_capacity_kw?: number | null
          metadata?: Json | null
          name: string
          priority_group?: string
          protocol?: string
          total_outlets?: number | null
          updated_at?: string | null
        }
        Update: {
          active_outlets?: number | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          current_load_kw?: number | null
          current_status?: string
          id?: string
          ip_address?: string | null
          last_status_check?: string | null
          location?: string | null
          max_capacity_kw?: number | null
          metadata?: Json | null
          name?: string
          priority_group?: string
          protocol?: string
          total_outlets?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pdu_power_readings: {
        Row: {
          created_at: string | null
          current_amps: number | null
          energy_kwh: number | null
          id: string
          outlet_states: Json | null
          pdu_id: string
          power_factor: number | null
          power_kw: number
          temperature_celsius: number | null
          timestamp: string | null
          voltage: number | null
        }
        Insert: {
          created_at?: string | null
          current_amps?: number | null
          energy_kwh?: number | null
          id?: string
          outlet_states?: Json | null
          pdu_id: string
          power_factor?: number | null
          power_kw: number
          temperature_celsius?: number | null
          timestamp?: string | null
          voltage?: number | null
        }
        Update: {
          created_at?: string | null
          current_amps?: number | null
          energy_kwh?: number | null
          id?: string
          outlet_states?: Json | null
          pdu_id?: string
          power_factor?: number | null
          power_kw?: number
          temperature_celsius?: number | null
          timestamp?: string | null
          voltage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdu_power_readings_pdu_id_fkey"
            columns: ["pdu_id"]
            isOneToOne: false
            referencedRelation: "pdu_devices"
            referencedColumns: ["id"]
          },
        ]
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
      predictive_models: {
        Row: {
          confidence_score: number | null
          created_at: string
          expires_at: string
          id: string
          market: string
          model_type: string
          predictions: Json
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          expires_at: string
          id?: string
          market: string
          model_type: string
          predictions: Json
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          market?: string
          model_type?: string
          predictions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          alert_type: string
          condition: string
          created_at: string
          id: string
          is_active: boolean
          notification_method: string
          threshold_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          condition: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_method?: string
          threshold_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          condition?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_method?: string
          threshold_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_ceiling_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_log_id: string | null
          alert_type: string
          auto_action_taken: boolean | null
          created_at: string | null
          current_price: number
          forecast_breach_hours: number | null
          grid_stress_level: string | null
          id: string
          is_active: boolean | null
          price_direction: string | null
          rule_id: string | null
          threshold_price: number
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_log_id?: string | null
          alert_type: string
          auto_action_taken?: boolean | null
          created_at?: string | null
          current_price: number
          forecast_breach_hours?: number | null
          grid_stress_level?: string | null
          id?: string
          is_active?: boolean | null
          price_direction?: string | null
          rule_id?: string | null
          threshold_price: number
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_log_id?: string | null
          alert_type?: string
          auto_action_taken?: boolean | null
          created_at?: string | null
          current_price?: number
          forecast_breach_hours?: number | null
          grid_stress_level?: string | null
          id?: string
          is_active?: boolean | null
          price_direction?: string | null
          rule_id?: string | null
          threshold_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_ceiling_alerts_action_log_id_fkey"
            columns: ["action_log_id"]
            isOneToOne: false
            referencedRelation: "datacenter_automation_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_ceiling_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "datacenter_shutdown_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          phone?: string | null
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
      regulatory_updates: {
        Row: {
          affected_sectors: string[] | null
          agency: string
          created_at: string
          description: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          impact_level: string | null
          jurisdiction: string
          title: string
          update_type: string | null
        }
        Insert: {
          affected_sectors?: string[] | null
          agency: string
          created_at?: string
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string | null
          jurisdiction: string
          title: string
          update_type?: string | null
        }
        Update: {
          affected_sectors?: string[] | null
          agency?: string
          created_at?: string
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string | null
          jurisdiction?: string
          title?: string
          update_type?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_config: Json
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_config: Json
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_config?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          id: string
          recommendations: Json | null
          risk_metrics: Json
          risk_score: number | null
          scenario_analysis: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_type: string
          created_at?: string
          id?: string
          recommendations?: Json | null
          risk_metrics: Json
          risk_score?: number | null
          scenario_analysis?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          id?: string
          recommendations?: Json | null
          risk_metrics?: Json
          risk_score?: number | null
          scenario_analysis?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_energy_calculations: {
        Row: {
          calculation_name: string
          created_at: string
          id: string
          input_data: Json
          results_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_name: string
          created_at?: string
          id?: string
          input_data: Json
          results_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_name?: string
          created_at?: string
          id?: string
          input_data?: Json
          results_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      secure_documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string | null
          created_by: string
          description: string | null
          file_hash: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          folder_id: string | null
          id: string
          is_active: boolean | null
          page_count: number | null
          site_id: string | null
          storage_path: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by: string
          description?: string | null
          file_hash?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          site_id?: string | null
          storage_path: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          created_by?: string
          description?: string | null
          file_hash?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          site_id?: string | null
          storage_path?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "secure_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "secure_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_links: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          allowed_domains: string[] | null
          allowed_ips: string[] | null
          bundle_id: string | null
          created_at: string | null
          created_by: string
          current_views: number | null
          custom_branding: Json | null
          document_id: string | null
          expires_at: string | null
          folder_id: string | null
          id: string
          last_accessed_at: string | null
          link_name: string | null
          link_token: string
          max_views: number | null
          nda_required: boolean | null
          nda_signed_at: string | null
          password_hash: string | null
          recipient_email: string | null
          recipient_name: string | null
          require_otp: boolean | null
          status: Database["public"]["Enums"]["link_status"] | null
          updated_at: string | null
          watermark_enabled: boolean | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          allowed_domains?: string[] | null
          allowed_ips?: string[] | null
          bundle_id?: string | null
          created_at?: string | null
          created_by: string
          current_views?: number | null
          custom_branding?: Json | null
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          id?: string
          last_accessed_at?: string | null
          link_name?: string | null
          link_token: string
          max_views?: number | null
          nda_required?: boolean | null
          nda_signed_at?: string | null
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          require_otp?: boolean | null
          status?: Database["public"]["Enums"]["link_status"] | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          allowed_domains?: string[] | null
          allowed_ips?: string[] | null
          bundle_id?: string | null
          created_at?: string | null
          created_by?: string
          current_views?: number | null
          custom_branding?: Json | null
          document_id?: string | null
          expires_at?: string | null
          folder_id?: string | null
          id?: string
          last_accessed_at?: string | null
          link_name?: string | null
          link_token?: string
          max_views?: number | null
          nda_required?: boolean | null
          nda_signed_at?: string | null
          password_hash?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          require_otp?: boolean | null
          status?: Database["public"]["Enums"]["link_status"] | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_links_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "document_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "secure_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_links_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "secure_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_aeso_report_views: {
        Row: {
          id: string
          report_id: string | null
          viewed_at: string | null
          viewer_email: string
          viewer_ip: string | null
          viewer_name: string
          viewer_user_agent: string | null
        }
        Insert: {
          id?: string
          report_id?: string | null
          viewed_at?: string | null
          viewer_email: string
          viewer_ip?: string | null
          viewer_name: string
          viewer_user_agent?: string | null
        }
        Update: {
          id?: string
          report_id?: string | null
          viewed_at?: string | null
          viewer_email?: string
          viewer_ip?: string | null
          viewer_name?: string
          viewer_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_aeso_report_views_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "shared_aeso_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_aeso_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_views: number | null
          expires_at: string | null
          id: string
          max_views: number | null
          password_hash: string | null
          report_config: Json
          report_data: Json
          report_html: string | null
          report_type: string | null
          share_token: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_views?: number | null
          expires_at?: string | null
          id?: string
          max_views?: number | null
          password_hash?: string | null
          report_config: Json
          report_data: Json
          report_html?: string | null
          report_type?: string | null
          share_token: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_views?: number | null
          expires_at?: string | null
          id?: string
          max_views?: number | null
          password_hash?: string | null
          report_config?: Json
          report_data?: Json
          report_html?: string | null
          report_type?: string | null
          share_token?: string
          status?: string | null
          title?: string
          updated_at?: string | null
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
      site_recommendations: {
        Row: {
          analysis_factors: Json | null
          created_at: string
          criteria_weights: Json | null
          id: string
          location_lat: number | null
          location_lng: number | null
          recommendation_reason: string | null
          recommendation_score: number | null
          user_id: string
        }
        Insert: {
          analysis_factors?: Json | null
          created_at?: string
          criteria_weights?: Json | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          recommendation_reason?: string | null
          recommendation_score?: number | null
          user_id: string
        }
        Update: {
          analysis_factors?: Json | null
          created_at?: string
          criteria_weights?: Json | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          recommendation_reason?: string | null
          recommendation_score?: number | null
          user_id?: string
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
      trading_signals: {
        Row: {
          asset: string
          confidence: number | null
          created_at: string
          id: string
          market: string
          metadata: Json | null
          price_target: number | null
          risk_level: string | null
          signal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          confidence?: number | null
          created_at?: string
          id?: string
          market: string
          metadata?: Json | null
          price_target?: number | null
          risk_level?: string | null
          signal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          confidence?: number | null
          created_at?: string
          id?: string
          market?: string
          metadata?: Json | null
          price_target?: number | null
          risk_level?: string | null
          signal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_api_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          service_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          service_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          service_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feature_usage: {
        Row: {
          action_type: string
          created_at: string
          feature_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          feature_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          feature_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_usage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_page_visits: {
        Row: {
          created_at: string
          id: string
          page_path: string
          page_title: string | null
          session_id: string | null
          time_spent_seconds: number | null
          user_id: string
          visit_timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          page_title?: string | null
          session_id?: string | null
          time_spent_seconds?: number | null
          user_id: string
          visit_timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          page_title?: string | null
          session_id?: string | null
          time_spent_seconds?: number | null
          user_id?: string
          visit_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_visits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          notification_settings: Json | null
          ui_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          ip_address: string | null
          session_end: string | null
          session_start: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
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
          coordinates: unknown
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
          coordinates?: unknown
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
          coordinates?: unknown
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
      viewer_activity: {
        Row: {
          browser: string | null
          closed_at: string | null
          device_type: string | null
          document_id: string
          engagement_score: number | null
          id: string
          last_activity_at: string | null
          link_id: string
          metadata: Json | null
          opened_at: string | null
          pages_viewed: Json | null
          scroll_depth: Json | null
          total_time_seconds: number | null
          viewer_email: string | null
          viewer_ip: string | null
          viewer_location: string | null
          viewer_name: string | null
        }
        Insert: {
          browser?: string | null
          closed_at?: string | null
          device_type?: string | null
          document_id: string
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          link_id: string
          metadata?: Json | null
          opened_at?: string | null
          pages_viewed?: Json | null
          scroll_depth?: Json | null
          total_time_seconds?: number | null
          viewer_email?: string | null
          viewer_ip?: string | null
          viewer_location?: string | null
          viewer_name?: string | null
        }
        Update: {
          browser?: string | null
          closed_at?: string | null
          device_type?: string | null
          document_id?: string
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          link_id?: string
          metadata?: Json | null
          opened_at?: string | null
          pages_viewed?: Json | null
          scroll_depth?: Json | null
          total_time_seconds?: number | null
          viewer_email?: string | null
          viewer_ip?: string | null
          viewer_location?: string | null
          viewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewer_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "secure_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewer_activity_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "secure_links"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_search_logs: {
        Row: {
          audio_duration_ms: number | null
          created_at: string
          id: string
          search_query: string
          search_results: Json | null
          search_type: string | null
          user_id: string | null
        }
        Insert: {
          audio_duration_ms?: number | null
          created_at?: string
          id?: string
          search_query: string
          search_results?: Json | null
          search_type?: string | null
          user_id?: string | null
        }
        Update: {
          audio_duration_ms?: number | null
          created_at?: string
          id?: string
          search_query?: string
          search_results?: Json | null
          search_type?: string | null
          user_id?: string | null
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
      voltmarket_access_requests: {
        Row: {
          company_name: string | null
          company_type: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          status: string | null
        }
        Insert: {
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: string
          status?: string | null
        }
        Update: {
          company_name?: string | null
          company_type?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
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
      voltmarket_contact_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          listing_id: string
          listing_owner_id: string
          message: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id: string
          listing_owner_id: string
          message: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id?: string
          listing_owner_id?: string
          message?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_contact_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
        ]
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
      voltmarket_document_permissions: {
        Row: {
          document_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          permission_type: string
          user_id: string
        }
        Insert: {
          document_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          permission_type: string
          user_id: string
        }
        Update: {
          document_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          permission_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_documents"
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
          listing_id: string | null
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
          listing_id?: string | null
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
          listing_id?: string | null
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
      voltmarket_due_diligence_tasks: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          listing_id: string
          priority: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          listing_id: string
          priority?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          listing_id?: string
          priority?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_due_diligence_tasks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
        ]
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
      voltmarket_email_verification_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
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
      voltmarket_loi_documents: {
        Row: {
          document_type: string
          file_path: string
          filename: string
          id: string
          loi_id: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          document_type: string
          file_path: string
          filename: string
          id?: string
          loi_id: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          document_type?: string
          file_path?: string
          filename?: string
          id?: string
          loi_id?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_loi_documents_loi_id_fkey"
            columns: ["loi_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_lois"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_lois: {
        Row: {
          additional_notes: string | null
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
          additional_notes?: string | null
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
          additional_notes?: string | null
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
      voltmarket_market_analytics: {
        Row: {
          analysis_period: string
          confidence_score: number | null
          data_sources: string[] | null
          expires_at: string | null
          forecasts: Json | null
          generated_at: string | null
          id: string
          metrics: Json
          period_end: string
          period_start: string
          property_type: string
          region: string
          trends: Json | null
        }
        Insert: {
          analysis_period: string
          confidence_score?: number | null
          data_sources?: string[] | null
          expires_at?: string | null
          forecasts?: Json | null
          generated_at?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          property_type: string
          region: string
          trends?: Json | null
        }
        Update: {
          analysis_period?: string
          confidence_score?: number | null
          data_sources?: string[] | null
          expires_at?: string | null
          forecasts?: Json | null
          generated_at?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          property_type?: string
          region?: string
          trends?: Json | null
        }
        Relationships: []
      }
      voltmarket_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          listing_id: string
          message: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          listing_id: string
          message: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string | null
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
            foreignKeyName: "voltmarket_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_conversations"
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
      voltmarket_portfolio_items: {
        Row: {
          acquisition_date: string | null
          acquisition_price: number | null
          added_at: string | null
          current_value: number | null
          id: string
          item_type: string
          listing_id: string | null
          metadata: Json | null
          name: string
          notes: string | null
          portfolio_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_price?: number | null
          added_at?: string | null
          current_value?: number | null
          id?: string
          item_type: string
          listing_id?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          portfolio_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_date?: string | null
          acquisition_price?: number | null
          added_at?: string | null
          current_value?: number | null
          id?: string
          item_type?: string
          listing_id?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          portfolio_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_portfolio_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voltmarket_portfolio_items_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          portfolio_type: string | null
          risk_tolerance: string | null
          target_allocation: Json | null
          total_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          portfolio_type?: string | null
          risk_tolerance?: string | null
          target_allocation?: Json | null
          total_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          portfolio_type?: string | null
          risk_tolerance?: string | null
          target_allocation?: Json | null
          total_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      voltmarket_search_filters: {
        Row: {
          advanced_filters: Json
          alert_frequency: string | null
          base_criteria: Json
          created_at: string | null
          financial_filters: Json | null
          geographic_filters: Json | null
          id: string
          infrastructure_filters: Json | null
          is_active: boolean | null
          is_alert_enabled: boolean | null
          last_run_at: string | null
          name: string
          results_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advanced_filters?: Json
          alert_frequency?: string | null
          base_criteria?: Json
          created_at?: string | null
          financial_filters?: Json | null
          geographic_filters?: Json | null
          id?: string
          infrastructure_filters?: Json | null
          is_active?: boolean | null
          is_alert_enabled?: boolean | null
          last_run_at?: string | null
          name: string
          results_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advanced_filters?: Json
          alert_frequency?: string | null
          base_criteria?: Json
          created_at?: string | null
          financial_filters?: Json | null
          geographic_filters?: Json | null
          id?: string
          infrastructure_filters?: Json | null
          is_active?: boolean | null
          is_alert_enabled?: boolean | null
          last_run_at?: string | null
          name?: string
          results_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
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
      voltmarket_user_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          listing_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          listing_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          listing_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_user_analytics_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      voltmarket_verification_documents: {
        Row: {
          document_type: string
          file_path: string
          filename: string
          id: string
          uploaded_at: string | null
          verification_id: string
        }
        Insert: {
          document_type: string
          file_path: string
          filename: string
          id?: string
          uploaded_at?: string | null
          verification_id: string
        }
        Update: {
          document_type?: string
          file_path?: string
          filename?: string
          id?: string
          uploaded_at?: string | null
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voltmarket_verification_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "voltmarket_verifications"
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
      voltscout_approved_users: {
        Row: {
          approved_at: string
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      aeso_data_quality_summary: {
        Row: {
          latest_timestamp: string | null
          oldest_recent: string | null
          total_records: number | null
          valid_percentage: number | null
          valid_records: number | null
          with_lag_features: number | null
          with_net_demand: number | null
          with_renewable_pen: number | null
        }
        Relationships: []
      }
      aeso_model_status: {
        Row: {
          available_training_records: number | null
          mae: number | null
          model_quality: string | null
          model_version: string | null
          predictions_evaluated: number | null
          r_squared: number | null
          records_with_features: number | null
          rmse: number | null
          smape: number | null
          trained_at: string | null
          training_records: number | null
        }
        Insert: {
          available_training_records?: never
          mae?: number | null
          model_quality?: never
          model_version?: string | null
          predictions_evaluated?: number | null
          r_squared?: number | null
          records_with_features?: never
          rmse?: number | null
          smape?: never
          trained_at?: string | null
          training_records?: number | null
        }
        Update: {
          available_training_records?: never
          mae?: number | null
          model_quality?: never
          model_version?: string | null
          predictions_evaluated?: number | null
          r_squared?: number | null
          records_with_features?: never
          rmse?: number | null
          smape?: never
          trained_at?: string | null
          training_records?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      bulk_delete_verified_sites: {
        Args: { site_ids: string[] }
        Returns: number
      }
      calculate_enhanced_features_batch: {
        Args: never
        Returns: {
          batch_timestamp: string
          records_processed: number
          success: boolean
        }[]
      }
      calculate_phase2_features_batch: {
        Args: never
        Returns: {
          batch_timestamp: string
          success: boolean
          total_records: number
        }[]
      }
      clean_expired_verification_tokens: { Args: never; Returns: undefined }
      generate_time_series_cv_folds: {
        Args: { num_folds?: number; validation_window_hours?: number }
        Returns: {
          fold_number: number
          train_end: string
          train_start: string
          validation_end: string
          validation_start: string
        }[]
      }
      get_all_users_with_details: {
        Args: never
        Returns: {
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_login: string
          permissions: string[]
          phone: string
          roles: string[]
          updated_at: string
        }[]
      }
      get_user_analytics_summary: {
        Args: { target_user_id: string }
        Returns: {
          avg_session_duration_minutes: number
          last_login: string
          most_used_features: Json
          most_visited_pages: Json
          total_feature_uses: number
          total_login_count: number
          total_page_visits: number
          total_sessions: number
          unique_features_used: number
          unique_pages_visited: number
        }[]
      }
      get_user_details: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_login: string
          permissions: string[]
          phone: string
          roles: string[]
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_voltscout_approved: { Args: { user_id: string }; Returns: boolean }
      restore_verified_site: { Args: { site_id: string }; Returns: boolean }
      soft_delete_verified_site: { Args: { site_id: string }; Returns: boolean }
      update_prediction_actuals: {
        Args: never
        Returns: {
          updated_count: number
        }[]
      }
    }
    Enums: {
      access_level: "view_only" | "download" | "no_download"
      alert_type:
        | "new_property"
        | "price_change"
        | "status_change"
        | "high_voltscore"
      app_role: "admin" | "moderator" | "user" | "viewer"
      document_category:
        | "contract"
        | "report"
        | "technical"
        | "financial"
        | "legal"
        | "marketing"
        | "other"
        | "investor_deck"
        | "energy_bill"
        | "loi"
        | "ppa"
        | "land_title"
      link_status: "active" | "expired" | "revoked" | "pending"
      permission_level: "read" | "write" | "admin"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["view_only", "download", "no_download"],
      alert_type: [
        "new_property",
        "price_change",
        "status_change",
        "high_voltscore",
      ],
      app_role: ["admin", "moderator", "user", "viewer"],
      document_category: [
        "contract",
        "report",
        "technical",
        "financial",
        "legal",
        "marketing",
        "other",
        "investor_deck",
        "energy_bill",
        "loi",
        "ppa",
        "land_title",
      ],
      link_status: ["active", "expired", "revoked", "pending"],
      permission_level: ["read", "write", "admin"],
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
