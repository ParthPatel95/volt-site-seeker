export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'risk' | 'operations' | 'analytics';
  icon: string;
  widgets: Array<{
    dataSource: string;
    widgetType: string;
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    data_filters: any;
    customization?: any;
  }>;
  layoutPresets?: {
    desktop: any[];
    mobile: any[];
    presentation: any[];
  };
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'day-trader',
    name: 'Day Trader',
    description: 'Real-time monitoring for intraday trading with price alerts and predictions',
    category: 'trading',
    icon: 'TrendingUp',
    widgets: [
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'Current Pool Price',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        data_filters: { timeRange: '24hours' },
        customization: {
          colorScheme: { primary: '#10b981', secondary: '#059669', accent: '#14b8a6' },
          thresholds: { warning: 100, danger: 200 },
        },
      },
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'System Marginal Price',
        x: 3,
        y: 0,
        w: 3,
        h: 2,
        data_filters: { timeRange: '24hours' },
        customization: {
          colorScheme: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#3b82f6' },
        },
      },
      {
        dataSource: 'historical_pricing',
        widgetType: 'line_chart',
        title: 'Price Trend (24h)',
        x: 6,
        y: 0,
        w: 6,
        h: 4,
        data_filters: { timeRange: '24hours', aggregation: 'hourly' },
        customization: {
          annotations: [
            { text: 'Trading Hours', position: 'top' },
          ],
        },
      },
      {
        dataSource: 'predictions',
        widgetType: 'area_chart',
        title: 'Price Predictions',
        x: 0,
        y: 2,
        w: 6,
        h: 4,
        data_filters: { timeRange: '24hours' },
        customization: {
          colorScheme: { primary: '#a855f7', secondary: '#8b5cf6', accent: '#6366f1' },
        },
      },
      {
        dataSource: 'market_data',
        widgetType: 'table',
        title: 'Live Pool Prices',
        x: 0,
        y: 6,
        w: 12,
        h: 3,
        data_filters: { limit: 15 },
      },
    ],
    layoutPresets: {
      desktop: [],
      mobile: [],
      presentation: [],
    },
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    description: 'Comprehensive risk monitoring with volatility tracking and market regime analysis',
    category: 'risk',
    icon: 'Shield',
    widgets: [
      {
        dataSource: 'analytics',
        widgetType: 'gauge',
        title: 'Risk Score',
        x: 0,
        y: 0,
        w: 3,
        h: 3,
        data_filters: {},
        customization: {
          colorScheme: { primary: '#ef4444', secondary: '#dc2626', accent: '#b91c1c' },
          thresholds: { warning: 50, danger: 75 },
        },
      },
      {
        dataSource: 'historical_pricing',
        widgetType: 'stat_card',
        title: 'Price Volatility',
        x: 3,
        y: 0,
        w: 3,
        h: 2,
        data_filters: { timeRange: '30days' },
        customization: {
          thresholds: { warning: 30, danger: 50 },
        },
      },
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'Current Exposure',
        x: 6,
        y: 0,
        w: 3,
        h: 2,
        data_filters: {},
      },
      {
        dataSource: 'analytics',
        widgetType: 'stat_card',
        title: 'Market Regime',
        x: 9,
        y: 0,
        w: 3,
        h: 2,
        data_filters: {},
      },
      {
        dataSource: 'historical_pricing',
        widgetType: 'bar_chart',
        title: 'Price Distribution',
        x: 0,
        y: 3,
        w: 6,
        h: 4,
        data_filters: { timeRange: '30days' },
        customization: {
          colorScheme: { primary: '#f59e0b', secondary: '#f97316', accent: '#ef4444' },
        },
      },
      {
        dataSource: 'predictions',
        widgetType: 'line_chart',
        title: 'Prediction Accuracy',
        x: 6,
        y: 3,
        w: 6,
        h: 4,
        data_filters: { timeRange: '30days' },
      },
      {
        dataSource: 'generation',
        widgetType: 'pie_chart',
        title: 'Generation Mix',
        x: 0,
        y: 7,
        w: 6,
        h: 4,
        data_filters: {},
        customization: {
          notes: 'Monitor renewable penetration for volatility risk',
        },
      },
      {
        dataSource: 'weather',
        widgetType: 'line_chart',
        title: 'Weather Impact',
        x: 6,
        y: 7,
        w: 6,
        h: 4,
        data_filters: { timeRange: '7days' },
      },
    ],
  },
  {
    id: 'grid-operator',
    name: 'Grid Operator',
    description: 'System monitoring with generation mix, reserves, and load forecasts',
    category: 'operations',
    icon: 'Zap',
    widgets: [
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'Current Load (MW)',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        data_filters: {},
        customization: {
          colorScheme: { primary: '#3b82f6', secondary: '#2563eb', accent: '#1d4ed8' },
        },
      },
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'Peak Forecast',
        x: 3,
        y: 0,
        w: 3,
        h: 2,
        data_filters: {},
      },
      {
        dataSource: 'market_data',
        widgetType: 'stat_card',
        title: 'Reserve Margin',
        x: 6,
        y: 0,
        w: 3,
        h: 2,
        data_filters: {},
        customization: {
          thresholds: { danger: 10, warning: 15, success: 20 },
        },
      },
      {
        dataSource: 'generation',
        widgetType: 'pie_chart',
        title: 'Real-time Generation Mix',
        x: 9,
        y: 0,
        w: 3,
        h: 4,
        data_filters: {},
      },
      {
        dataSource: 'historical_pricing',
        widgetType: 'area_chart',
        title: 'Load Profile',
        x: 0,
        y: 2,
        w: 9,
        h: 4,
        data_filters: { timeRange: '24hours' },
        customization: {
          annotations: [
            { text: 'Morning Ramp', position: 'top' },
            { text: 'Evening Peak', position: 'top' },
          ],
        },
      },
      {
        dataSource: 'market_data',
        widgetType: 'line_chart',
        title: 'Interchange Flows',
        x: 0,
        y: 6,
        w: 6,
        h: 3,
        data_filters: { timeRange: '24hours' },
      },
      {
        dataSource: 'analytics',
        widgetType: 'bar_chart',
        title: 'Operating Reserves',
        x: 6,
        y: 6,
        w: 6,
        h: 3,
        data_filters: {},
        customization: {
          notes: 'Monitor spinning and supplemental reserves',
        },
      },
      {
        dataSource: 'weather',
        widgetType: 'line_chart',
        title: 'Weather Conditions',
        x: 0,
        y: 9,
        w: 12,
        h: 3,
        data_filters: { timeRange: '24hours' },
      },
    ],
  },
  {
    id: 'market-analytics',
    name: 'Market Analytics',
    description: 'Deep analysis with model performance, regime detection, and historical trends',
    category: 'analytics',
    icon: 'BarChart3',
    widgets: [
      {
        dataSource: 'analytics',
        widgetType: 'line_chart',
        title: 'Model Performance Trends',
        x: 0,
        y: 0,
        w: 8,
        h: 4,
        data_filters: { timeRange: '30days' },
        customization: {
          colorScheme: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#6d28d9' },
        },
      },
      {
        dataSource: 'analytics',
        widgetType: 'stat_card',
        title: 'Prediction Accuracy',
        x: 8,
        y: 0,
        w: 4,
        h: 2,
        data_filters: {},
        customization: {
          thresholds: { success: 90, warning: 80 },
        },
      },
      {
        dataSource: 'analytics',
        widgetType: 'stat_card',
        title: 'Model Confidence',
        x: 8,
        y: 2,
        w: 4,
        h: 2,
        data_filters: {},
      },
      {
        dataSource: 'historical_pricing',
        widgetType: 'bar_chart',
        title: 'Monthly Price Statistics',
        x: 0,
        y: 4,
        w: 6,
        h: 4,
        data_filters: { timeRange: '12months', aggregation: 'monthly' },
      },
      {
        dataSource: 'analytics',
        widgetType: 'line_chart',
        title: 'Market Regime Analysis',
        x: 6,
        y: 4,
        w: 6,
        h: 4,
        data_filters: { timeRange: '30days' },
        customization: {
          annotations: [
            { text: 'Regime Change', position: 'top' },
          ],
        },
      },
      {
        dataSource: 'predictions',
        widgetType: 'table',
        title: 'Prediction History',
        x: 0,
        y: 8,
        w: 12,
        h: 4,
        data_filters: { limit: 20 },
      },
    ],
  },
];

export const getTemplateById = (id: string): DashboardTemplate | undefined => {
  return DASHBOARD_TEMPLATES.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): DashboardTemplate[] => {
  return DASHBOARD_TEMPLATES.filter(t => t.category === category);
};
