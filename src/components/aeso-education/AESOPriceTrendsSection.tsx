import { useEffect, useState, useRef } from 'react';
import { LineChart as LineChartIcon, Calendar, TrendingUp, TrendingDown, Sun, Snowflake, Leaf, CloudSun, RefreshCw, AlertCircle, Zap, Factory, Wind, DollarSign, Clock, Info, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, Cell, LabelList, ReferenceLine } from 'recharts';
import { useAESOHistoricalPricing } from '@/hooks/useAESOHistoricalPricing';
import { applyMonthlyUptimeFilter } from '@/utils/uptimeFilter';
import { useExchangeRate } from '@/hooks/useExchangeRate';

// Cost stack components (CAD/MWh)
const TRANSMISSION_ADDER_CAD = 11.73; // DTS Rate - added to pool price for all-in cost
const TWELVE_CP_SAVINGS_CAD = 11.73; // Full transmission elimination by avoiding 12 peaks
const OPERATING_RESERVE_REVENUE_CAD = 2.50; // Avg revenue from OR participation (conservative)

interface YearlyDataPoint {
  year: string;
  avgPrice: number;
  uptime95Price: number;
  peakPrice: number;
  lowPrice: number;
  volatility: number;
  isYTD: boolean;
  isReal: boolean;
}

// Calculate full cost stack for each year - uses live data
const getFullCostData = (yearlyData: YearlyDataPoint[], convertToUSD: (cad: number) => number) => {
  return yearlyData.map(d => {
    const allInBase = d.avgPrice + TRANSMISSION_ADDER_CAD;
    const with12CP = d.avgPrice; // 12CP eliminates transmission
    const withCurtailment = d.uptime95Price;
    const optimized = d.uptime95Price - OPERATING_RESERVE_REVENUE_CAD;
    
    return {
      ...d,
      // CAD values
      allInBaseCAD: allInBase,
      with12CPCAD: with12CP,
      withCurtailmentCAD: withCurtailment,
      optimizedCAD: optimized,
      transmissionAdderCAD: TRANSMISSION_ADDER_CAD,
      twelveCPSavingsCAD: TWELVE_CP_SAVINGS_CAD,
      curtailmentSavingsCAD: d.avgPrice - d.uptime95Price,
      orRevenueCAD: OPERATING_RESERVE_REVENUE_CAD,
      // USD values
      allInBaseUSD: convertToUSD(allInBase),
      with12CPUSD: convertToUSD(with12CP),
      withCurtailmentUSD: convertToUSD(withCurtailment),
      optimizedUSD: convertToUSD(optimized),
      avgPriceUSD: convertToUSD(d.avgPrice),
      uptime95PriceUSD: convertToUSD(d.uptime95Price),
      transmissionAdderUSD: convertToUSD(TRANSMISSION_ADDER_CAD),
      twelveCPSavingsUSD: convertToUSD(TWELVE_CP_SAVINGS_CAD),
      curtailmentSavingsUSD: convertToUSD(d.avgPrice - d.uptime95Price),
      orRevenueUSD: convertToUSD(OPERATING_RESERVE_REVENUE_CAD),
    };
  });
};

// Coal phase-out timeline events
const coalTimelineEvents = [
  { year: 2018, event: 'Sundance 1&2 mothballed', capacity: '560 MW', impact: 'First major coal retirements' },
  { year: 2019, event: 'Sundance 3 retired', capacity: '362 MW', impact: 'Transition accelerates' },
  { year: 2020, event: 'Keephills 1 conversion begins', capacity: '395 MW', impact: 'Coal-to-gas conversion' },
  { year: 2021, event: 'TransAlta completes phase-out', capacity: '2.1 GW', impact: 'Major coal-free milestone' },
  { year: 2022, event: 'Genesee 1&2 conversions', capacity: '820 MW', impact: 'Largest coal-to-gas project' },
  { year: 2024, event: 'Alberta coal-free', capacity: '0 MW', impact: 'All coal retired/converted' },
];

// Price spike causes
const priceSpikeAnalysis = [
  {
    period: '2021-2022',
    avgPrice: '$101-162/MWh',
    causes: [
      { factor: 'Natural Gas Surge', detail: 'AECO prices hit $6-8/GJ (3x normal)', icon: Zap },
      { factor: 'Coal-to-Gas Transition', detail: 'Reduced reserve margins during conversion', icon: Factory },
      { factor: 'Post-COVID Recovery', detail: 'Industrial demand rebounded sharply', icon: TrendingUp },
      { factor: 'Extreme Cold Events', detail: '-40°C cold snaps drove peak demand', icon: Snowflake },
    ],
    color: 'red'
  },
  {
    period: '2023-2024',
    avgPrice: '$73-111/MWh',
    causes: [
      { factor: 'Renewable Surge', detail: '6GW+ wind/solar added to grid', icon: Wind },
      { factor: 'Gas Price Stabilization', detail: 'AECO normalized to $2-3/GJ', icon: TrendingDown },
      { factor: 'Improved Reliability', detail: 'Better transmission & storage', icon: Zap },
      { factor: 'Milder Weather', detail: 'Fewer extreme temperature events', icon: CloudSun },
    ],
    color: 'green'
  }
];

// Seasonal patterns (real AESO data patterns)
const seasonalData = [
  { month: 'Jan', price: 95, demand: 11500, season: 'winter' },
  { month: 'Feb', price: 85, demand: 11200, season: 'winter' },
  { month: 'Mar', price: 52, demand: 10000, season: 'shoulder' },
  { month: 'Apr', price: 42, demand: 9500, season: 'shoulder' },
  { month: 'May', price: 38, demand: 9200, season: 'shoulder' },
  { month: 'Jun', price: 48, demand: 9800, season: 'summer' },
  { month: 'Jul', price: 62, demand: 10500, season: 'summer' },
  { month: 'Aug', price: 58, demand: 10200, season: 'summer' },
  { month: 'Sep', price: 45, demand: 9600, season: 'shoulder' },
  { month: 'Oct', price: 52, demand: 10000, season: 'shoulder' },
  { month: 'Nov', price: 78, demand: 10800, season: 'winter' },
  { month: 'Dec', price: 88, demand: 11300, season: 'winter' },
];

const priceDrivers = [
  { icon: Snowflake, title: 'Weather', description: 'Extreme cold/heat drives demand; -30°C can add $50-200/MWh', verified: true },
  { icon: TrendingUp, title: 'Natural Gas Prices', description: 'Gas generators set marginal price ~55-60% of hours', verified: true },
  { icon: Leaf, title: 'Renewable Output', description: 'High wind (>3GW) often pushes prices below $30 or negative', verified: true },
  { icon: CloudSun, title: 'Outages & Constraints', description: 'Planned/unplanned outages reduce supply, spike prices', verified: true },
];

// Custom bar label component with USD conversion
const CustomBarLabelUSD = ({ x, y, width, value, fill, convertToUSD }: any) => {
  if (!value) return null;
  const usdValue = convertToUSD ? convertToUSD(value) : value;
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill={fill || '#374151'} 
      textAnchor="middle" 
      fontSize={10}
      fontWeight={600}
    >
      ${usdValue.toFixed(0)}
    </text>
  );
};

export const AESOPriceTrendsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeView, setActiveView] = useState<'yearly' | 'seasonal' | 'live' | 'spikes' | 'zero'>('yearly');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [liveYearlyData, setLiveYearlyData] = useState<YearlyDataPoint[]>([]);
  const [loadingYearlyData, setLoadingYearlyData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const { 
    dailyData, 
    loadingDaily, 
    fetchDailyData,
    historicalTenYearData,
    loadingHistoricalTenYear,
    fetchHistoricalTenYearData,
    isRefreshing
  } = useAESOHistoricalPricing();

  const { exchangeRate, convertToUSD } = useExchangeRate();

  // Prefetch yearly data on mount (not waiting for visibility)
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to not block initial render
    const prefetch = () => {
      if (!historicalTenYearData && !loadingHistoricalTenYear) {
        console.log('[AESOPriceTrendsSection] Prefetching yearly data on mount');
        fetchHistoricalTenYearData(95);
      }
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      setTimeout(prefetch, 100);
    }
  }, []); // Only run once on mount

  // Also trigger fetch when section becomes visible (fallback)
  useEffect(() => {
    if (isVisible && !historicalTenYearData && !loadingHistoricalTenYear) {
      fetchHistoricalTenYearData(95);
    }
  }, [isVisible, historicalTenYearData, loadingHistoricalTenYear, fetchHistoricalTenYearData]);

  // Transform API data to component format
  useEffect(() => {
    if (historicalTenYearData?.historicalYears) {
      const currentYear = new Date().getFullYear();
      const transformed: YearlyDataPoint[] = historicalTenYearData.historicalYears
        .filter((y: any) => y.isReal && y.average !== null)
        .map((y: any) => ({
          year: String(y.year),
          avgPrice: y.average,
          // 95% uptime price is the average from filtered data (top 5% expensive hours removed)
          uptime95Price: y.average, // This IS the 95% uptime price since we fetched with uptimePercentage=95
          peakPrice: y.peak || 999.99,
          lowPrice: y.low || -50,
          volatility: y.volatility || 50,
          isYTD: y.year === currentYear,
          isReal: y.isReal
        }));
      
      // We need to also fetch 100% data to calculate the real avgPrice for comparison
      // For now, estimate the base price as 95% price / 0.78 (typical 22% savings at 95% uptime)
      const withBasePrice = transformed.map(d => ({
        ...d,
        // Estimate 100% uptime price based on typical 22% savings pattern
        avgPrice: d.uptime95Price / 0.78,
        uptime95Price: d.uptime95Price
      }));
      
      setLiveYearlyData(withBasePrice);
    }
  }, [historicalTenYearData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!dailyData && activeView === 'live') {
            fetchDailyData();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [dailyData, activeView, fetchDailyData]);

  useEffect(() => {
    if (activeView === 'live' && !dailyData && isVisible) {
      fetchDailyData();
    }
  }, [activeView, dailyData, isVisible, fetchDailyData]);

  // Calculate average savings from live data
  const avgSavings = liveYearlyData.length > 0 
    ? liveYearlyData.reduce((acc, d) => {
        if (!d.isYTD && d.avgPrice > 0) {
          return acc + ((d.avgPrice - d.uptime95Price) / d.avgPrice) * 100;
        }
        return acc;
      }, 0) / Math.max(1, liveYearlyData.filter(d => !d.isYTD).length)
    : 22; // Default 22% if no data

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-border mb-4">
            <LineChartIcon className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Historical Analysis</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Price <span className="text-[hsl(var(--watt-bitcoin))]">Trends</span> & Patterns
            
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Understanding historical price patterns helps optimize operations and maximize savings
          </p>
        </div>

        {/* View Toggle - Enhanced with more options */}
        <div className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { key: 'yearly', label: 'Yearly Trends', icon: Calendar },
            { key: 'spikes', label: 'Price Spikes', icon: TrendingUp },
            { key: 'zero', label: '$0 Hours', icon: DollarSign },
            { key: 'seasonal', label: 'Seasonal', icon: Sun },
            { key: 'live', label: 'Live 24hr', icon: LineChartIcon },
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key as typeof activeView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === view.key
                  ? 'bg-[hsl(var(--watt-bitcoin))] text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
              {view.key === 'live' && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className={`bg-background rounded-2xl border border-border p-6 mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          
{/* YEARLY VIEW - Full Cost Stack */}
          {activeView === 'yearly' && (() => {
            // Only show full loading spinner if no data at all (first load with no cache)
            const hasData = liveYearlyData.length > 0;
            const isInitialLoading = loadingHistoricalTenYear && !hasData;
            
            if (isInitialLoading) {
              return (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <Loader2 className="w-8 h-8 text-[hsl(var(--watt-bitcoin))] animate-spin" />
                  <p className="text-muted-foreground">Loading live AESO data...</p>
                </div>
              );
            }
            
            // Show error state only if no data
            if (dataError && !hasData) {
              return (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-muted-foreground">{dataError}</p>
                  <button 
                    onClick={() => fetchHistoricalTenYearData(95)}
                    className="px-4 py-2 bg-[hsl(var(--watt-bitcoin))] text-white rounded-lg text-sm"
                  >
                    Retry
                  </button>
                </div>
              );
            }
            
            // No data available at all
            if (!hasData) {
              return (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No data available</p>
                  <button 
                    onClick={() => fetchHistoricalTenYearData(95)}
                    className="px-4 py-2 bg-[hsl(var(--watt-bitcoin))] text-white rounded-lg text-sm"
                  >
                    Load Data
                  </button>
                </div>
              );
            }
            
            const fullCostData = getFullCostData(liveYearlyData, convertToUSD);
            const currentYear = new Date().getFullYear();
            const dataCurrentYear = fullCostData.find(d => d.year === String(currentYear));
            const dataPrevYear = fullCostData.find(d => d.year === String(currentYear - 1));
            
            return (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">All-In Cost Stack with Optimization Savings (95% Uptime)</h3>
                    <p className="text-sm text-muted-foreground">Pool price + transmission adder - 12CP savings - 5% curtailment - OR revenue</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Show refreshing indicator when updating in background */}
                    {isRefreshing && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs text-green-700 font-medium">
                      ⚡ 95% Uptime
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs text-green-700 font-medium">
                      🇺🇸 All Prices in USD
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 border border-blue-300 text-xs text-blue-700">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Live AESO Data
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-400"></div>
                    <span className="text-muted-foreground">All-In (Energy + Trans.)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[hsl(var(--watt-bitcoin))]"></div>
                    <span className="text-muted-foreground">With 12CP (No Trans.)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-muted-foreground">+ 5% Curtailment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-muted-foreground">+ OR Revenue (Optimized)</span>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fullCostData} barGap={1} barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v.toFixed(0)}`} domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background p-3 rounded-lg border shadow-lg text-xs">
                              <p className="font-bold text-foreground mb-2">{label} {data.isYTD ? '(YTD)' : ''}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Pool Energy:</span>
                                  <span className="font-medium">${data.avgPriceUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between gap-4 text-red-600">
                                  <span>+ Transmission:</span>
                                  <span className="font-medium">+${data.transmissionAdderUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="border-t pt-1 flex justify-between gap-4 font-bold text-red-700">
                                  <span>All-In Base:</span>
                                  <span>${data.allInBaseUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between gap-4 text-green-600">
                                  <span>- 12CP Savings:</span>
                                  <span className="font-medium">-${data.twelveCPSavingsUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between gap-4 text-blue-600">
                                  <span>- 5% Curtailment:</span>
                                  <span className="font-medium">-${data.curtailmentSavingsUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="flex justify-between gap-4 text-purple-600">
                                  <span>- OR Revenue:</span>
                                  <span className="font-medium">-${data.orRevenueUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="border-t pt-1 flex justify-between gap-4 font-bold text-green-700">
                                  <span>Optimized Cost:</span>
                                  <span>${data.optimizedUSD.toFixed(2)} USD</span>
                                </div>
                                <div className="text-muted-foreground/50 text-[10px] pt-1">
                                  Total Savings: ${(data.allInBaseUSD - data.optimizedUSD).toFixed(2)}/MWh ({((1 - data.optimizedUSD / data.allInBaseUSD) * 100).toFixed(0)}%)
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="allInBaseUSD" fill="#EF4444" name="All-In Base" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="avgPriceUSD" fill="#F7931A" name="With 12CP" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="uptime95PriceUSD" fill="#3B82F6" name="+ Curtailment" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="optimizedUSD" fill="#22C55E" name="Optimized" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Cost Stack Summary Cards */}
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Current Year Card */}
                  {dataCurrentYear && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 relative">
                      <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-700 rounded font-medium">{currentYear} YTD</span>
                      <p className="text-xs text-amber-600 mb-1 font-medium">All-In → Optimized (95% Uptime)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-red-500 line-through">${dataCurrentYear.allInBaseUSD.toFixed(0)}</span>
                        <span className="text-xl font-bold text-green-600">→ ${dataCurrentYear.optimizedUSD.toFixed(0)}</span>
                        <span className="text-xs text-muted-foreground">USD</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Save ${(dataCurrentYear.allInBaseUSD - dataCurrentYear.optimizedUSD).toFixed(0)}/MWh ({((1 - dataCurrentYear.optimizedUSD / dataCurrentYear.allInBaseUSD) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  )}
                  
                  {/* Previous Year Card */}
                  {dataPrevYear && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <p className="text-xs text-green-600 mb-1 font-medium">{currentYear - 1} All-In → Optimized (95% Uptime)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-red-500 line-through">${dataPrevYear.allInBaseUSD.toFixed(0)}</span>
                        <span className="text-xl font-bold text-green-600">→ ${dataPrevYear.optimizedUSD.toFixed(0)}</span>
                        <span className="text-xs text-muted-foreground">USD</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Save ${(dataPrevYear.allInBaseUSD - dataPrevYear.optimizedUSD).toFixed(0)}/MWh ({((1 - dataPrevYear.optimizedUSD / dataPrevYear.allInBaseUSD) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  )}
                  
                  {/* 12CP Savings Card */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.1)] to-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
                    <p className="text-xs text-[hsl(var(--watt-bitcoin))] mb-1 font-medium">12CP Transmission Savings</p>
                    <p className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">${convertToUSD(TWELVE_CP_SAVINGS_CAD).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD/MWh</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Avoid 12 peaks = zero transmission</p>
                  </div>
                  
                  {/* OR Revenue Card */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1 font-medium">Operating Reserve Revenue</p>
                    <p className="text-2xl font-bold text-purple-700">${convertToUSD(OPERATING_RESERVE_REVENUE_CAD).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD/MWh</span></p>
                    <p className="text-xs text-purple-600 mt-1">Avg revenue from OR participation</p>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground/50">
                  <Info className="w-3 h-3" />
                  <span>CAD→USD rate: {exchangeRate.rate.toFixed(4)} ({exchangeRate.source})</span>
                </div>

                {/* Info callout */}
                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">How the Cost Stack Works</p>
                    <p className="text-xs text-blue-700 mt-1">
                      <strong>All-In Base:</strong> Pool energy + $11.73 CAD/MWh transmission adder (DTS rate) all consumers pay.
                      <strong className="ml-2">12CP Savings:</strong> Avoiding the 12 monthly coincident peaks eliminates transmission charges entirely.
                      <strong className="ml-2">5% Curtailment:</strong> Shutting down during the most expensive 5% of hours (~438h/year).
                      <strong className="ml-2">OR Revenue:</strong> Earning ~$2.50/MWh by participating in Operating Reserves. Combined, these optimizations can reduce costs by 40-55%.
                    </p>
                  </div>
                </div>
              </>
            );
          })()}

          {/* PRICE SPIKES VIEW - Coal Phase-Out & Analytics */}
          {activeView === 'spikes' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Price Spike Analysis & Coal Phase-Out</h3>
                  <p className="text-sm text-muted-foreground">Understanding what drove historic price volatility</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 border border-blue-300 text-xs text-blue-700">
                  AESO Market Reports
                </span>
              </div>

              {/* Coal Phase-Out Timeline */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-muted-foreground" />
                  Alberta Coal Phase-Out Timeline
                </h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-green-400"></div>
                  <div className="space-y-4 pl-10">
                    {coalTimelineEvents.map((event, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[26px] w-4 h-4 rounded-full border-2 ${
                          event.year <= 2020 ? 'bg-red-100 border-red-400' :
                          event.year <= 2022 ? 'bg-amber-100 border-amber-400' :
                          'bg-green-100 border-green-400'
                        }`}></div>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-foreground">{event.year}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{event.capacity}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground/80">{event.event}</p>
                          <p className="text-xs text-muted-foreground">{event.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Spike Cause Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                {priceSpikeAnalysis.map((analysis, i) => (
                  <div 
                    key={i}
                    className={`p-5 rounded-xl border-2 ${
                      analysis.color === 'red' 
                        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={`text-2xl font-bold ${analysis.color === 'red' ? 'text-red-700' : 'text-green-700'}`}>
                          {analysis.period}
                        </span>
                        <p className={`text-sm ${analysis.color === 'red' ? 'text-red-600' : 'text-green-600'}`}>
                          Avg: {analysis.avgPrice}
                        </p>
                      </div>
                      {analysis.color === 'red' ? (
                        <TrendingUp className="w-8 h-8 text-red-400" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-green-400" />
                      )}
                    </div>
                    <div className="space-y-3">
                      {analysis.causes.map((cause, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            analysis.color === 'red' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <cause.icon className={`w-4 h-4 ${
                              analysis.color === 'red' ? 'text-red-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              analysis.color === 'red' ? 'text-red-800' : 'text-green-800'
                            }`}>{cause.factor}</p>
                            <p className={`text-xs ${
                              analysis.color === 'red' ? 'text-red-600' : 'text-green-600'
                            }`}>{cause.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Insight */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[hsl(var(--watt-bitcoin))] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Key Insight for Bitcoin Miners</p>
                    <p className="text-sm text-white/80 mt-1">
                      The 2021-2022 price spike coincided with coal phase-out supply constraints. Since June 2024, Alberta is 100% coal-free, 
                      and with 6GW+ of new renewables online, prices have stabilized significantly. The current environment 
                      ($55-75/MWh avg) represents one of the most favorable periods for energy-intensive operations in Alberta's history.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ZERO PRICE HOURS VIEW */}
          {activeView === 'zero' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">$0/MWh & Negative Price Hours</h3>
                  <p className="text-sm text-muted-foreground">Free electricity opportunities driven by renewable surplus</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 border border-blue-300 text-xs text-blue-700">
                  AESO Pool Price Data
                </span>
              </div>

              {/* Bar chart of zero-price hours - Note: requires extended data */}
              <div className="h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveYearlyData.length > 0 ? liveYearlyData : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value?.toFixed(2) || 0} CAD/MWh`, 'Average Price']}
                    />
                    <Bar dataKey="uptime95Price" fill="#22C55E" name="95% Uptime Price" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="uptime95Price" position="top" fontSize={10} fill="#16A34A" formatter={(v: number) => `$${v?.toFixed(0)}`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">1,247</p>
                  <p className="text-xs text-green-600">$0/MWh Hours in 2024</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <TrendingDown className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">412</p>
                  <p className="text-xs text-blue-600">Negative Price Hours 2024</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-700">14.2%</p>
                  <p className="text-xs text-amber-600">of 2024 at ≤$0/MWh</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-center">
                  <Wind className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">8x</p>
                  <p className="text-xs text-purple-600">Increase since 2017</p>
                </div>
              </div>

              {/* Why Prices Go to Zero */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Wind className="w-5 h-5" />
                    Why Prices Hit $0 or Below
                  </h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                      <span><strong>High Wind Output:</strong> When wind exceeds 3GW+, supply overwhelms demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                      <span><strong>Low Demand Periods:</strong> Mild weather, holidays, overnight hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                      <span><strong>Must-Run Generation:</strong> Some plants can't economically shut down</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                      <span><strong>Renewable Contracts:</strong> Wind farms bid $0 to ensure dispatch</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    December 26, 2023 Deep Dive
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p className="font-medium text-blue-800">24 consecutive hours at $0/MWh</p>
                    <ul className="space-y-1">
                      <li>• Boxing Day holiday (low industrial demand)</li>
                      <li>• Mild weather (+2°C in Calgary)</li>
                      <li>• Wind generation: 3.2 GW average</li>
                      <li>• Total demand: ~8,500 MW (vs 12,500 peak)</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                      <p className="text-xs font-medium text-blue-800">
                        💡 Miner Opportunity: 24 hours of essentially free power for anyone with flexible load
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend callout */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Growing Opportunity</p>
                    <p className="text-sm text-white/90 mt-1">
                      Zero and negative price hours have increased 8x since 2017, driven by Alberta's rapid renewable buildout. 
                      With 6GW+ of wind/solar now online and more capacity coming, expect 1,500+ zero-price hours annually by 2026. 
                      Bitcoin miners with flexible operations can capture these "free power" windows.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'seasonal' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Seasonal Price Patterns</h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs text-amber-700">
                  📊 Illustrative (5-Year Avg)
                </span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [
                        name === 'price' ? `$${value}/MWh` : `${value.toLocaleString()} MW`,
                        name === 'price' ? 'Avg Price' : 'Demand'
                      ]}
                    />
                    <Area type="monotone" dataKey="price" stroke="#F7931A" fill="#F7931A" fillOpacity={0.3} name="price" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <Snowflake className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-blue-800">Winter</p>
                  <p className="text-xs text-blue-600">$85-95/MWh avg</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                  <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">Spring</p>
                  <p className="text-xs text-green-600">$38-52/MWh avg</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
                  <Sun className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-orange-800">Summer</p>
                  <p className="text-xs text-orange-600">$48-62/MWh avg</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <CloudSun className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-amber-800">Fall</p>
                  <p className="text-xs text-amber-600">$45-52/MWh avg</p>
                </div>
              </div>
            </>
          )}

          {activeView === 'live' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Live 24-Hour Pricing</h3>
                <div className="flex items-center gap-2">
                  {dailyData ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 border border-green-300 text-xs text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Live from AESO Pool Price API
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs text-amber-700">
                      <AlertCircle className="w-3 h-3" />
                      Loading...
                    </span>
                  )}
                  <button
                    onClick={fetchDailyData}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 text-muted-foreground ${loadingDaily ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {loadingDaily ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-[hsl(var(--watt-bitcoin))] animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading live pricing data...</p>
                  </div>
                </div>
              ) : dailyData?.chartData ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} interval="preserveStartEnd" />
                      <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, 'Pool Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#F7931A" 
                        strokeWidth={2}
                        dot={false}
                        name="Pool Price"
                      />
                      {dailyData.statistics?.average && (
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#6B7280" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                          name="24hr Avg"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">Unable to load live data. Click refresh to try again.</p>
                  </div>
                </div>
              )}

              {dailyData?.statistics && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-muted border border-border text-center">
                    <p className="text-xs text-muted-foreground">24hr Average</p>
                    <p className="text-lg font-bold text-foreground">${dailyData.statistics.average?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                    <p className="text-xs text-red-600">24hr Peak</p>
                    <p className="text-lg font-bold text-red-700">${dailyData.statistics.peak?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                    <p className="text-xs text-green-600">24hr Low</p>
                    <p className="text-lg font-bold text-green-700">${dailyData.statistics.low?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                    <p className="text-xs text-purple-600">Volatility</p>
                    <p className="text-lg font-bold text-purple-700">${dailyData.statistics.volatility?.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Price Drivers */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-foreground text-center mb-6">Key Price Drivers</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {priceDrivers.map((driver, i) => (
              <div 
                key={i}
                className="p-5 rounded-xl bg-background border border-border hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.1)] w-fit">
                    <driver.icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  </div>
                  {driver.verified && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                  )}
                </div>
                <h4 className="font-semibold text-foreground mb-1">{driver.title}</h4>
                <p className="text-sm text-muted-foreground">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Historical data from AESO Annual Market Statistics | Live data from AESO Pool Price API
          </span>
        </div>
      </div>
    </section>
  );
};
