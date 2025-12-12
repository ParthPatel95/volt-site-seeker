import React, { useState, useEffect, useMemo } from 'react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  Calculator,
  CloudRain,
  PieChart,
  Activity,
  Clock,
  Target,
  Download,
  FileText,
  Loader2,
  Link,
  Share2,
  Coins
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAESOHistoricalPricing } from '@/hooks/useAESOHistoricalPricing';
import { PriceAlertsPanel } from './PriceAlertsPanel';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { LoadScheduleOptimizer } from './LoadScheduleOptimizer';
import { CostBenefitCalculator } from './CostBenefitCalculator';
import { WeatherAnalysis } from '@/components/weather/WeatherAnalysis';
import { AdvancedAnalytics } from '@/components/historical/AdvancedAnalytics';
import { ShareReportDialog } from './ShareReportDialog';
import { SharedAESOReportsTab } from './SharedAESOReportsTab';
import { TwelveCPAnalyticsTab } from './TwelveCPAnalyticsTab';
import { useEnergyCredits, CreditSettings, defaultCreditSettings } from '@/hooks/useEnergyCredits';
import { CreditSettingsPanel } from './CreditSettingsPanel';
import { CreditSummaryCard } from './CreditSummaryCard';

const OVERVIEW_CREDIT_SETTINGS_KEY = 'aeso-overview-credit-settings';

export function AESOHistoricalPricing() {
  const { convertCADtoUSD, formatCurrency: formatCurrencyUSD, exchangeRate: liveExchangeRate } = useCurrencyConversion();
  const { 
    dailyData,
    monthlyData, 
    yearlyData, 
    peakAnalysis,
    historicalTenYearData,
    customPeriodData,
    loadingDaily,
    loadingMonthly, 
    loadingYearly, 
    loadingPeakAnalysis,
    loadingHistoricalTenYear,
    loadingCustomPeriod,
    fetchDailyData,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
    fetchHistoricalTenYearData,
    fetchCustomPeriodData
  } = useAESOHistoricalPricing();

  const { toast } = useToast();
  
  const [uptimePercentage, setUptimePercentage] = useState('95');
  const [timePeriod, setTimePeriod] = useState<'30' | '90' | '180' | '365' | '730' | '1095' | '1460'>('30');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'daily' | 'monthly' | 'yearly' | 'historical'>('monthly');
  const [transmissionAdder, setTransmissionAdder] = useState('11.63');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [customAnalysisResult, setCustomAnalysisResult] = useState<any>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingComprehensive, setExportingComprehensive] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareReportType, setShareReportType] = useState<'single' | 'comprehensive'>('single');

  // Credit settings state with localStorage persistence
  const [creditSettings, setCreditSettings] = useState<CreditSettings>(() => {
    try {
      const saved = localStorage.getItem(OVERVIEW_CREDIT_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultCreditSettings;
    } catch {
      return defaultCreditSettings;
    }
  });

  // Save credit settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem(OVERVIEW_CREDIT_SETTINGS_KEY, JSON.stringify(creditSettings));
  }, [creditSettings]);

  // Get current raw hourly data based on selected time period
  const currentRawData = useMemo(() => {
    const data = selectedTimePeriod === 'daily' ? dailyData 
              : selectedTimePeriod === 'monthly' ? monthlyData 
              : selectedTimePeriod === 'yearly' ? yearlyData 
              : historicalTenYearData;
    return data?.rawHourlyData || [];
  }, [selectedTimePeriod, dailyData, monthlyData, yearlyData, historicalTenYearData]);

  // Apply energy credits to current data
  const { adjustedData, creditSummary } = useEnergyCredits(currentRawData, creditSettings);

  useEffect(() => {
    fetchDailyData();
    fetchMonthlyData();
    fetchYearlyData();
    fetchExchangeRate();
    fetchCustomPeriodData(parseInt(timePeriod)); // Initial load for current time period
  }, []);

  // Re-fetch 8-year data when uptime percentage changes
  useEffect(() => {
    if (historicalTenYearData) {
      fetchRealHistoricalData();
    }
  }, [uptimePercentage]);

  // Fetch custom period data when time period changes
  useEffect(() => {
    console.log(`[QA] Time period changed to: ${timePeriod} days`);
    fetchCustomPeriodData(parseInt(timePeriod));
  }, [timePeriod]);

  // Re-run analysis when time period data or uptime changes
  useEffect(() => {
    if (customAnalysisResult && (customPeriodData || monthlyData)) {
      console.log('[QA] Auto-recalculating analysis due to data/uptime change');
      console.log('[QA] customPeriodData available:', !!customPeriodData);
      console.log('[QA] monthlyData available:', !!monthlyData);
      const result = calculateUptimeOptimization();
      setCustomAnalysisResult(result);
    }
  }, [customPeriodData, uptimePercentage]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.io/v4/latest/CAD');
      const data = await response.json();
      if (data.rates?.USD) {
        setExchangeRate(data.rates.USD);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(0.73); // Fallback rate
    }
  };

  const fetchRealHistoricalData = async () => {
    // Call the real API to fetch 8-year historical data with uptime filter
    await fetchHistoricalTenYearData(parseFloat(uptimePercentage));
  };


  const handleUptimeAnalysis = () => {
    try {
      // Validate uptime percentage before calculation
      const uptime = parseFloat(uptimePercentage);
      if (isNaN(uptime) || uptime > 100) {
        console.warn('[QA] Invalid uptime percentage:', uptimePercentage);
        toast({
          title: "Invalid Uptime Target",
          description: "Uptime must be between 50% and 100%.",
          variant: "destructive"
        });
        return;
      }
      if (uptime < 50) {
        console.warn('[QA] Uptime too low:', uptimePercentage);
        toast({
          title: "Invalid Uptime Target",
          description: "Uptime must be at least 50% for realistic operational analysis.",
          variant: "destructive"
        });
        return;
      }

      console.log('[QA] ========================================');
      console.log('[QA] Manual "Calculate Uptime Optimized" button clicked');
      console.log('[QA] Current time period:', timePeriod, 'days');
      console.log('[QA] Current uptime target:', uptimePercentage, '%');
      console.log('[QA] customPeriodData available:', !!customPeriodData);
      console.log('[QA] customPeriodData.rawHourlyData:', customPeriodData?.rawHourlyData?.length || 0);
      console.log('[QA] monthlyData available:', !!monthlyData);
      console.log('[QA] monthlyData.rawHourlyData:', monthlyData?.rawHourlyData?.length || 0);
      console.log('[QA] yearlyData available:', !!yearlyData);
      console.log('[QA] yearlyData.rawHourlyData:', yearlyData?.rawHourlyData?.length || 0);
      console.log('[QA] ========================================');
      
      const result = calculateUptimeOptimization();
      console.log('[QA] Uptime optimization result:', result);
      
      if (result === null) {
        toast({
          title: "Calculation not possible",
          description: "No optimization available at this uptime level. Try a lower uptime percentage or wait for data to load.",
          variant: "destructive"
        });
      }
      
      setCustomAnalysisResult(result);
    } catch (error) {
      console.error('[QA] Error in uptime analysis:', error);
      toast({
        title: "Calculation Error",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive"
      });
      setCustomAnalysisResult(null);
    }
  };

  // Export analysis to PDF - Direct download using html2pdf
  const exportToPDF = async () => {
    if (!currentAnalysis) {
      toast({
        title: "No Analysis Available",
        description: "Please run an uptime optimization analysis first.",
        variant: "destructive"
      });
      return;
    }

    setExportingPDF(true);
    let container: HTMLDivElement | null = null;
    
    try {
      const { data, error } = await supabase.functions.invoke('aeso-analysis-export', {
        body: {
          analysisData: currentAnalysis,
          config: {
            uptimePercentage,
            timePeriod,
            transmissionAdder,
            exchangeRate: liveExchangeRate || 0.73
          }
        }
      });

      if (error) throw error;

      if (data?.htmlContent) {
        // Decode base64 HTML content
        const htmlContent = decodeURIComponent(escape(atob(data.htmlContent)));
        
        // Create container for rendering - use visibility:hidden instead of opacity:0
        // visibility:hidden keeps element in render tree for html2canvas capture
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1100px';
        container.style.height = 'auto';
        container.style.minHeight = '100vh';
        container.style.overflow = 'visible';
        container.style.background = 'white';
        container.style.visibility = 'hidden';
        container.style.pointerEvents = 'none';
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Force layout calculation and wait for render
        container.getBoundingClientRect();
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dynamic import html2pdf
        const html2pdf = (await import('html2pdf.js')).default;
        
        // Generate PDF with settings optimized for CSS rendering
        const opt = {
          margin: 10,
          filename: `AESO_Analysis_${uptimePercentage}pct_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 1100,
            width: 1100,
            scrollX: 0,
            scrollY: 0,
            foreignObjectRendering: false
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape',
            compress: true
          },
          pagebreak: { mode: 'avoid-all' }
        };
        
        await html2pdf().set(opt).from(container).save();

        toast({
          title: "PDF Downloaded",
          description: "Your analysis report has been downloaded.",
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate the PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Always clean up
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setExportingPDF(false);
    }
  };

  // Calculate analysis for a specific uptime percentage (for multi-scenario export)
  const calculateUptimeForScenario = (targetUptimePercent: number) => {
    const daysInPeriod = parseInt(timePeriod);
    
    // Use appropriate data source
    let sourceData;
    if (daysInPeriod === 30) {
      sourceData = monthlyData;
    } else if (customPeriodData) {
      sourceData = customPeriodData;
    } else if (daysInPeriod > 180) {
      sourceData = yearlyData;
    } else {
      sourceData = monthlyData;
    }
    
    if (!sourceData || !sourceData.rawHourlyData) {
      return null;
    }
    
    // Filter to exact time period
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysInPeriod);
    
    const filteredHourlyData = sourceData.rawHourlyData.filter(hour => {
      const hourDate = new Date(hour.datetime || hour.date);
      return hourDate >= startDate && hourDate <= now;
    });
    
    const hourlyData = filteredHourlyData.length > 0 ? filteredHourlyData : sourceData.rawHourlyData;
    
    // Handle 100% uptime as baseline (no shutdowns)
    if (targetUptimePercent === 100) {
      const originalTotalCost = hourlyData.reduce((sum, hour) => sum + hour.price, 0);
      const originalAvgPrice = originalTotalCost / hourlyData.length;
      const transmissionAdderValue = parseFloat(transmissionAdder);
      
      return {
        totalShutdowns: 0,
        totalHours: 0,
        downtimePercentage: 0,
        totalSavings: 0,
        totalAllInSavings: 0,
        newAveragePrice: originalAvgPrice,
        originalAverage: originalAvgPrice,
        events: []
      };
    }
    
    // Calculate uptime/downtime parameters
    const targetUptime = targetUptimePercent / 100;
    const totalHours = hourlyData.length;
    const allowedDowntimeHours = Math.floor(totalHours * (1 - targetUptime));
    
    // Sort all hours by price (highest first)
    const sortedHours = [...hourlyData].sort((a, b) => b.price - a.price);
    const hoursToShutdown = sortedHours.slice(0, allowedDowntimeHours);
    const hoursToKeepRunning = sortedHours.slice(allowedDowntimeHours);
    
    // Calculate metrics
    const originalTotalCost = hourlyData.reduce((sum, hour) => sum + hour.price, 0);
    const originalAvgPrice = originalTotalCost / totalHours;
    const optimizedTotalCost = hoursToKeepRunning.reduce((sum, hour) => sum + hour.price, 0);
    const optimizedAvgPrice = hoursToKeepRunning.length > 0 ? optimizedTotalCost / hoursToKeepRunning.length : originalAvgPrice;
    const totalSavings = hoursToShutdown.reduce((sum, hour) => sum + hour.price, 0);
    const transmissionAdderValue = parseFloat(transmissionAdder);
    const totalAllInSavings = hoursToShutdown.reduce((sum, hour) => sum + hour.price + transmissionAdderValue, 0);
    
    // Format events
    const events = hoursToShutdown.map((hour) => ({
      date: hour.date,
      time: `${hour.hour.toString().padStart(2, '0')}:00`,
      price: hour.price,
      allInPrice: hour.price + transmissionAdderValue,
      duration: 1,
      savings: hour.price,
      allInSavings: hour.price + transmissionAdderValue
    }));
    
    return {
      totalShutdowns: allowedDowntimeHours,
      totalHours: allowedDowntimeHours,
      downtimePercentage: ((allowedDowntimeHours / totalHours) * 100),
      totalSavings,
      totalAllInSavings,
      newAveragePrice: optimizedAvgPrice,
      originalAverage: originalAvgPrice,
      events
    };
  };

  // Export comprehensive multi-scenario PDF - Direct download using html2pdf
  const exportComprehensivePDF = async () => {
    if (!monthlyData && !customPeriodData) {
      toast({
        title: "No Data Available",
        description: "Please wait for data to load before exporting.",
        variant: "destructive"
      });
      return;
    }

    setExportingComprehensive(true);
    try {
      // Calculate all uptime scenarios
      const uptimeLevels = [100, 97, 96, 95, 90, 85, 80];
      const scenarios = uptimeLevels.map(uptime => {
        const analysis = calculateUptimeForScenario(uptime);
        return {
          uptimePercentage: uptime,
          analysis: analysis || {
            totalShutdowns: 0,
            totalHours: 0,
            totalSavings: 0,
            totalAllInSavings: 0,
            originalAverage: 0,
            newAveragePrice: 0,
            events: []
          }
        };
      }).filter(s => s.analysis !== null);

      console.log('[Export] Generating comprehensive report with', scenarios.length, 'scenarios');

      const { data, error } = await supabase.functions.invoke('aeso-analysis-export', {
        body: {
          analysisData: scenarios[0]?.analysis || {},
          config: {
            uptimePercentage,
            timePeriod,
            transmissionAdder,
            exchangeRate: liveExchangeRate || 0.73,
            exportType: 'comprehensive',
            scenarios
          }
        }
      });

      if (error) throw error;

      if (data?.htmlContent) {
        const htmlContent = decodeURIComponent(escape(atob(data.htmlContent)));
        
        // Create a visible container for rendering (html2pdf needs visible elements)
        let container: HTMLDivElement | null = null;
        container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '1100px';
        container.style.background = 'white';
        container.style.zIndex = '-9999';
        container.style.opacity = '0';
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Dynamic import html2pdf
          const html2pdf = (await import('html2pdf.js')).default;
          
          // Generate PDF with settings optimized for CSS rendering
          const opt = {
            margin: 10,
            filename: `AESO_Comprehensive_Analysis_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
              scale: 2, 
              useCORS: true,
              logging: false,
              allowTaint: true,
              backgroundColor: '#ffffff',
              windowWidth: 1100
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'landscape',
              compress: true
            },
            pagebreak: { mode: 'avoid-all' }
          };
          
          await html2pdf().set(opt).from(container).save();

          toast({
            title: "Comprehensive Report Downloaded",
            description: "Your multi-scenario analysis report has been downloaded.",
          });
        } finally {
          // Always clean up
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }
      }
    } catch (error) {
      console.error('Error exporting comprehensive PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate the comprehensive report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExportingComprehensive(false);
    }
  };

  // Enhanced Formula: Hourly Precision Uptime Analysis with Operational Constraints
  const analyzeUptimeOptimized = (targetUptime: number) => {
    try {
      const daysInPeriod = parseInt(timePeriod);
      
      // Use custom period data if available, otherwise fall back to monthly/yearly
      let sourceData;
      if (customPeriodData && daysInPeriod !== 30) {
        sourceData = customPeriodData;
      } else {
        sourceData = daysInPeriod > 180 ? yearlyData : monthlyData;
      }
      
      if (!sourceData || !sourceData.chartData || sourceData.chartData.length === 0) {
        console.warn('No data available for uptime analysis');
        return null;
      }

      // Enhanced: Operational constraints configuration
      const operationalConstraints = {
        startupCostPerMW: 50, // $/MW startup cost
        shutdownCostPerMW: 25, // $/MW shutdown cost
        minimumShutdownDuration: 2, // minimum 2 hours shutdown
        maximumShutdownsPerWeek: 3, // operational limit
        rampingTimeMins: 30 // time to ramp up/down
      };

      console.log('=== ENHANCED UPTIME ANALYSIS WITH HOURLY PRECISION ===');
      console.log('Target uptime:', targetUptime);
      console.log('Operational constraints:', operationalConstraints);
      
      // Filter data to exact time period
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysInPeriod);
      
      const filteredData = sourceData.chartData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= startDate && dayDate <= now;
      });

      // Enhanced: Convert daily data to synthetic hourly data using intraday curves
      const hourlyData = generateSyntheticHourlyData(filteredData, sourceData.statistics.average);
      
      // Calculate rolling baseline with seasonal/weekly patterns
      const rollingBaseline = calculateRollingBaseline(hourlyData, 30); // 30-day rolling window
      
      const totalHours = daysInPeriod * 24;
      const maxShutdownHours = totalHours * (1 - targetUptime / 100);
      
      console.log('Total hours in period:', totalHours);
      console.log('Max shutdown hours allowed:', maxShutdownHours);
      console.log('Synthetic hourly data points:', hourlyData.length);
      
      // Enhanced: Smart shutdown optimization with operational constraints
      const optimizedShutdowns = optimizeShutdownSchedule(
        hourlyData, 
        maxShutdownHours, 
        operationalConstraints,
        rollingBaseline
      );
      
      console.log('Optimized shutdown events:', optimizedShutdowns.events.length);
      console.log('Total optimized shutdown hours:', optimizedShutdowns.totalHours);
      console.log('Operational constraint violations:', optimizedShutdowns.violations);
      
      // Calculate enhanced savings with operational costs
    const enhancedSavings = calculateEnhancedSavings(
      optimizedShutdowns, 
      rollingBaseline, 
      operationalConstraints
    );
    
    console.log('=== ENHANCED SAVINGS CALCULATION ===');
    console.log('Gross energy savings:', (enhancedSavings.grossSavings || 0).toFixed(3), '¢');
    console.log('Operational costs:', (enhancedSavings.operationalCosts || 0).toFixed(3), '¢');
    console.log('Net savings:', (enhancedSavings.netSavings || 0).toFixed(3), '¢');
    console.log('Risk adjustment:', (enhancedSavings.riskAdjustment || 0).toFixed(3), '¢');
      
      return {
        totalShutdowns: optimizedShutdowns.events.length,
        totalHours: optimizedShutdowns.totalHours,
        averageSavings: optimizedShutdowns.events.length > 0 ? enhancedSavings.netSavings / optimizedShutdowns.events.length : 0,
        events: optimizedShutdowns.events,
        newAveragePrice: enhancedSavings.newAveragePrice,
        totalSavings: enhancedSavings.netSavings,
        totalAllInSavings: enhancedSavings.netAllInSavings,
        originalAverage: rollingBaseline.average,
        actualUptimeAchieved: ((totalHours - optimizedShutdowns.totalHours) / totalHours * 100),
        // Enhanced metrics
        operationalCosts: enhancedSavings.operationalCosts,
        riskAdjustment: enhancedSavings.riskAdjustment,
        confidenceLevel: enhancedSavings.confidenceLevel,
        projectedROI: enhancedSavings.projectedROI
      };
    } catch (error) {
      console.error('Error in enhanced uptime analysis:', error);
      return null;
    }
  };

  // Enhanced: Generate synthetic hourly data using monthly baseline and hourly patterns
  const generateSyntheticHourlyData = (dailyData: any[], monthlyAverage: number) => {
    // Typical AESO hourly price multipliers (based on historical patterns)
    const hourlyMultipliers = [
      0.85, 0.82, 0.80, 0.78, 0.82, 0.90, // 0-5 AM (low demand)
      1.05, 1.15, 1.20, 1.18, 1.12, 1.08, // 6-11 AM (morning ramp)
      1.10, 1.15, 1.18, 1.22, 1.25, 1.35, // 12-5 PM (peak demand)
      1.40, 1.30, 1.15, 1.05, 0.95, 0.88  // 6-11 PM (evening peak then decline)
    ];

    const hourlyData: any[] = [];
    
    console.log(`Generating hourly data using monthly baseline: $${monthlyAverage.toFixed(2)} CAD/MWh`);
    
    dailyData.forEach(day => {
      hourlyMultipliers.forEach((multiplier, hour) => {
        // Use monthly average as baseline, not daily average
        const hourlyPrice = monthlyAverage * multiplier;
        
        hourlyData.push({
          date: day.date,
          hour: hour,
          datetime: new Date(`${day.date}T${hour.toString().padStart(2, '0')}:00:00`),
          price: hourlyPrice,
          dailyBasePrice: monthlyAverage,
          multiplier: multiplier,
          dayOfWeek: new Date(day.date).getDay(),
          isWeekend: [0, 6].includes(new Date(day.date).getDay())
        });
      });
    });
    
    const avgHourlyPrice = hourlyData.reduce((sum, h) => sum + h.price, 0) / hourlyData.length;
    console.log(`Average of generated hourly prices: $${avgHourlyPrice.toFixed(2)} CAD/MWh (should be close to monthly avg)`);
    
    return hourlyData.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  // Enhanced: Calculate rolling baseline with seasonal patterns
  const calculateRollingBaseline = (hourlyData: any[], windowDays: number) => {
    const windowHours = windowDays * 24;
    const rollingAverages: any[] = [];
    
    for (let i = windowHours; i < hourlyData.length; i++) {
      const windowData = hourlyData.slice(i - windowHours, i);
      const average = windowData.reduce((sum, point) => sum + point.price, 0) / windowData.length;
      const volatility = Math.sqrt(windowData.reduce((sum, point) => sum + Math.pow(point.price - average, 2), 0) / windowData.length);
      
      rollingAverages.push({
        datetime: hourlyData[i].datetime,
        average: average,
        volatility: volatility,
        confidence: Math.max(0.6, Math.min(0.95, 1 - (volatility / average)))
      });
    }
    
    const overallAverage = rollingAverages.reduce((sum, point) => sum + point.average, 0) / rollingAverages.length;
    const overallVolatility = Math.sqrt(rollingAverages.reduce((sum, point) => sum + Math.pow(point.average - overallAverage, 2), 0) / rollingAverages.length);
    
    return {
      average: overallAverage,
      volatility: overallVolatility,
      rollingData: rollingAverages,
      confidenceLevel: Math.max(0.7, Math.min(0.95, 1 - (overallVolatility / overallAverage)))
    };
  };

  // Enhanced: Smart shutdown optimization with operational constraints
  const optimizeShutdownSchedule = (hourlyData: any[], maxShutdownHours: number, constraints: any, baseline: any) => {
    // Sort by price premium over rolling baseline
    const priceOpportunities = hourlyData.map(point => {
      const rollingBaseline = baseline.rollingData.find(r => 
        Math.abs(r.datetime.getTime() - point.datetime.getTime()) < 3600000 // within 1 hour
      );
      const baselinePrice = rollingBaseline ? rollingBaseline.average : baseline.average;
      
      return {
        ...point,
        baselinePrice,
        premium: point.price - baselinePrice,
        potentialSavings: (point.price - baselinePrice) * (point.price > baselinePrice ? 1 : 0)
      };
    }).filter(point => point.potentialSavings > 0)
      .sort((a, b) => b.potentialSavings - a.potentialSavings);

    const optimizedEvents: any[] = [];
    let totalShutdownHours = 0;
    let weeklyShutdowns = 0;
    let lastShutdownWeek = -1;
    const violations: string[] = [];

    for (const opportunity of priceOpportunities) {
      if (totalShutdownHours >= maxShutdownHours) break;

      const currentWeek = Math.floor(opportunity.datetime.getTime() / (7 * 24 * 3600 * 1000));
      
      // Reset weekly counter for new week
      if (currentWeek !== lastShutdownWeek) {
        weeklyShutdowns = 0;
        lastShutdownWeek = currentWeek;
      }

      // Check weekly shutdown limit
      if (weeklyShutdowns >= constraints.maximumShutdownsPerWeek) {
        violations.push(`Weekly shutdown limit exceeded in week ${currentWeek}`);
        continue;
      }

      // Find consecutive high-price hours for smart duration
      const shutdownDuration = findOptimalShutdownDuration(
        hourlyData, 
        opportunity, 
        constraints.minimumShutdownDuration,
        baseline
      );

      if (totalShutdownHours + shutdownDuration <= maxShutdownHours) {
        optimizedEvents.push({
          date: opportunity.date,
          startHour: opportunity.hour,
          duration: shutdownDuration,
          price: opportunity.price,
          baselinePrice: opportunity.baselinePrice,
          premium: opportunity.premium,
          savings: opportunity.potentialSavings * shutdownDuration,
          allInSavings: (calculateAllInPrice(opportunity.price) - calculateAllInPrice(opportunity.baselinePrice)) * shutdownDuration,
          operationalCost: (constraints.startupCostPerMW + constraints.shutdownCostPerMW) / 1000 // Convert to ¢/kWh
        });

        totalShutdownHours += shutdownDuration;
        weeklyShutdowns++;
      }
    }

    return {
      events: optimizedEvents,
      totalHours: totalShutdownHours,
      violations
    };
  };

  // Enhanced: Find optimal shutdown duration based on consecutive high prices
  const findOptimalShutdownDuration = (hourlyData: any[], startOpportunity: any, minDuration: number, baseline: any) => {
    const startIndex = hourlyData.findIndex(point => 
      point.datetime.getTime() === startOpportunity.datetime.getTime()
    );
    
    let duration = minDuration;
    let consecutiveHighPriceHours = 0;
    
    // Look ahead for consecutive high prices
    for (let i = startIndex; i < Math.min(startIndex + 12, hourlyData.length); i++) {
      const point = hourlyData[i];
      const rollingBaseline = baseline.rollingData.find(r => 
        Math.abs(r.datetime.getTime() - point.datetime.getTime()) < 3600000
      );
      const baselinePrice = rollingBaseline ? rollingBaseline.average : baseline.average;
      
      if (point.price > baselinePrice * 1.1) { // 10% above baseline
        consecutiveHighPriceHours++;
      } else {
        break;
      }
    }
    
    return Math.max(minDuration, Math.min(8, consecutiveHighPriceHours)); // Max 8 hours
  };

  // Enhanced: Calculate savings with operational costs and risk adjustments
  const calculateEnhancedSavings = (shutdowns: any, baseline: any, constraints: any) => {
    const grossSavings = shutdowns.events.reduce((sum: number, event: any) => sum + event.savings, 0);
    const grossAllInSavings = shutdowns.events.reduce((sum: number, event: any) => sum + event.allInSavings, 0);
    const operationalCosts = shutdowns.events.reduce((sum: number, event: any) => sum + (event.operationalCost || 0), 0);
    
    // Enhanced All-In Cost Modeling: Variable transmission costs based on energy prices
    const transmissionCostVariation = shutdowns.events.reduce((sum: number, event: any) => {
      const priceBasedTransmissionAdder = calculateDynamicTransmissionCost(event.price);
      const standardTransmissionAdder = parseFloat(transmissionAdder);
      return sum + ((priceBasedTransmissionAdder - standardTransmissionAdder) * event.duration);
    }, 0);
    
    // Statistical Validation: Monte Carlo simulation for uncertainty
    const monteCarloResult = runMonteCarloSimulation(shutdowns.events, baseline, 1000);
    
    // Risk adjustment based on baseline confidence and volatility
    const riskAdjustment = grossSavings * (1 - baseline.confidenceLevel) * 0.3; // 30% of uncertain savings
    const volatilityAdjustment = grossSavings * (baseline.volatility || 0.1) * 0.2; // 20% volatility penalty
    
    const netSavings = grossSavings - operationalCosts - riskAdjustment - volatilityAdjustment + transmissionCostVariation;
    const netAllInSavings = grossAllInSavings - operationalCosts - riskAdjustment - volatilityAdjustment;
    
    // Calculate new average price during operational hours
    const operationalHours = (parseInt(timePeriod) * 24) - (shutdowns.totalHours || 0);
    const newAveragePrice = baseline.average * (1 - ((netSavings || 0) / (grossSavings || 1)) * 0.1);
    
    return {
      grossSavings: grossSavings || 0,
      operationalCosts: operationalCosts || 0,
      riskAdjustment: riskAdjustment || 0,
      volatilityAdjustment: volatilityAdjustment || 0,
      transmissionCostVariation: transmissionCostVariation || 0,
      netSavings: netSavings || 0,
      netAllInSavings: netAllInSavings || 0,
      newAveragePrice: newAveragePrice || baseline.average || 0,
      confidenceLevel: baseline.confidenceLevel || 0.5,
      projectedROI: (netSavings || 0) > 0 ? ((netSavings || 0) / (operationalCosts || 1)) * 100 : 0,
      monteCarloConfidenceInterval: monteCarloResult.confidenceInterval,
      probabilityOfProfit: monteCarloResult.probabilityOfProfit || 0,
      expectedValue: monteCarloResult.expectedValue || 0
    };
  };

  // Enhanced All-In Cost Modeling: Dynamic transmission costs based on energy prices
  const calculateDynamicTransmissionCost = (energyPrice: number) => {
    const baseTransmissionAdder = parseFloat(transmissionAdder);
    
    // Transmission costs increase during high-demand periods (when energy prices are high)
    if (energyPrice > 100) { // High price threshold
      return baseTransmissionAdder * 1.3; // 30% increase during peak demand
    } else if (energyPrice > 50) { // Medium price threshold
      return baseTransmissionAdder * 1.15; // 15% increase during moderate demand
    } else if (energyPrice < 10) { // Very low price (possible negative pricing periods)
      return baseTransmissionAdder * 0.8; // 20% decrease during low demand
    }
    
    return baseTransmissionAdder; // Standard transmission cost
  };

  // Statistical Validation: Monte Carlo simulation for uncertainty quantification
  const runMonteCarloSimulation = (events: any[], baseline: any, iterations: number = 1000) => {
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let simulatedSavings = 0;
      
      events.forEach(event => {
        // Add uncertainty to price predictions
        const priceUncertainty = (Math.random() - 0.5) * 2 * 0.2; // ±20% uncertainty
        const baselineUncertainty = (Math.random() - 0.5) * 2 * 0.15; // ±15% uncertainty
        
        const adjustedPrice = event.price * (1 + priceUncertainty);
        const adjustedBaseline = event.baselinePrice * (1 + baselineUncertainty);
        
        // Add operational uncertainty
        const operationalEfficiency = 0.85 + (Math.random() * 0.25); // 85-100% efficiency
        
        simulatedSavings += (adjustedPrice - adjustedBaseline) * event.duration * operationalEfficiency;
      });
      
      results.push(simulatedSavings);
    }
    
    results.sort((a, b) => a - b);
    
    const p5 = results[Math.floor(iterations * 0.05)];
    const p95 = results[Math.floor(iterations * 0.95)];
    const expectedValue = results.reduce((sum, val) => sum + val, 0) / iterations;
    const probabilityOfProfit = results.filter(val => val > 0).length / iterations;
    
    return {
      confidenceInterval: { lower: p5, upper: p95 },
      expectedValue,
      probabilityOfProfit
    };
  };

  // Simplified Uptime Optimization Analysis using REAL AESO data
  const calculateUptimeOptimization = () => {
    const daysInPeriod = parseInt(timePeriod);
    
    // Use appropriate data source based on selected time period
    // Priority: customPeriodData > yearlyData > monthlyData
    let sourceData;
    let dataSourceName;
    
    if (daysInPeriod === 30) {
      sourceData = monthlyData;
      dataSourceName = 'monthlyData (30 days)';
    } else if (customPeriodData) {
      sourceData = customPeriodData;
      dataSourceName = `customPeriodData (${daysInPeriod} days)`;
    } else if (daysInPeriod > 180) {
      sourceData = yearlyData;
      dataSourceName = 'yearlyData (365 days)';
    } else {
      sourceData = monthlyData;
      dataSourceName = 'monthlyData (30 days - fallback)';
    }
    
    if (!sourceData || !sourceData.rawHourlyData) {
      console.warn('No raw hourly data available for optimization');
      return null;
    }
    
    console.log('=== UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===');
    console.log('Days in period requested:', daysInPeriod);
    console.log('Using data source:', dataSourceName);
    console.log('Raw hourly data points available:', sourceData.rawHourlyData.length);
    
    // Use REAL hourly data from AESO (no synthetic generation!)
    // Filter to the exact time period requested
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysInPeriod);
    
    const filteredHourlyData = sourceData.rawHourlyData.filter(hour => {
      const hourDate = new Date(hour.datetime || hour.date);
      return hourDate >= startDate && hourDate <= now;
    });
    
    const hourlyData = filteredHourlyData.length > 0 ? filteredHourlyData : sourceData.rawHourlyData;
    console.log('Total real hourly data points from AESO:', hourlyData.length);
    console.log('Filtered to time period:', filteredHourlyData.length > 0 ? 'yes' : 'no (using all available data)');
    
    // Debug price data
    const zeroPrices = hourlyData.filter(h => (h.price || 0) === 0);
    const validPrices = hourlyData.filter(h => h.price != null && !isNaN(h.price));
    console.log(`Zero price entries: ${zeroPrices.length}`);
    console.log(`Valid price entries: ${validPrices.length}`);
    
    // Calculate uptime/downtime parameters
    const targetUptime = parseFloat(uptimePercentage) / 100;
    const totalHours = hourlyData.length;
    const allowedDowntimeHours = Math.floor(totalHours * (1 - targetUptime));
    
    console.log('Target uptime:', (targetUptime * 100).toFixed(1) + '%');
    console.log('Total hours in period:', totalHours);
    console.log('Allowed downtime hours:', allowedDowntimeHours);
    
    // Sort all hours by price (highest first) and take the top X hours for shutdown
    const sortedHours = [...hourlyData].sort((a, b) => b.price - a.price);
    const hoursToShutdown = sortedHours.slice(0, allowedDowntimeHours);
    const hoursToKeepRunning = sortedHours.slice(allowedDowntimeHours);
    
    console.log('Hours to shutdown (highest prices):', hoursToShutdown.length);
    console.log('Hours to keep running:', hoursToKeepRunning.length);
    
    // Calculate original and optimized metrics using REAL prices
    const originalTotalCost = hourlyData.reduce((sum, hour) => sum + hour.price, 0);
    const originalAvgPrice = originalTotalCost / totalHours;
    
    // Optimized cost is ONLY for the hours we keep running (excluding shutdown hours)
    const optimizedTotalCost = hoursToKeepRunning.reduce((sum, hour) => sum + hour.price, 0);
    const optimizedAvgPrice = optimizedTotalCost / hoursToKeepRunning.length;
    
    // Total energy savings = sum of all shutdown hour prices
    const totalSavings = hoursToShutdown.reduce((sum, hour) => sum + hour.price, 0);
    const actualDowntimePercent = (allowedDowntimeHours / totalHours) * 100;
    
    // Comprehensive logging
    console.log('=== REAL DATA CALCULATION ===');
    console.log(`Total hours: ${totalHours}`);
    console.log(`Hours to shutdown (top ${(100 - targetUptime * 100).toFixed(1)}% highest prices): ${allowedDowntimeHours}`);
    console.log(`Hours to keep running: ${hoursToKeepRunning.length}`);
    console.log(`Original total cost: ${originalTotalCost.toFixed(2)} CAD (sum of all ${totalHours} hours)`);
    console.log(`Original avg price: ${originalAvgPrice.toFixed(2)} CAD/MWh`);
    console.log(`Optimized total cost: ${optimizedTotalCost.toFixed(2)} CAD (sum of ${hoursToKeepRunning.length} running hours)`);
    console.log(`Optimized avg price: ${optimizedAvgPrice.toFixed(2)} CAD/MWh`);
    console.log(`Total savings: ${totalSavings.toFixed(2)} CAD (sum of ${hoursToShutdown.length} shutdown hours)`);
    console.log(`Avg price of shutdown hours: ${(totalSavings / allowedDowntimeHours).toFixed(2)} CAD/MWh`);
    console.log(`Price reduction: ${(originalAvgPrice - optimizedAvgPrice).toFixed(2)} CAD/MWh`);
    console.log(`Percent reduction: ${((1 - optimizedAvgPrice / originalAvgPrice) * 100).toFixed(2)}%`);
    
    // Sanity check - CRITICAL validation
    if (optimizedAvgPrice >= originalAvgPrice) {
      console.error('❌ ERROR: Optimized price is NOT LOWER than original!');
      console.error('This indicates a calculation error. Debugging info:');
      console.error('Top 3 highest prices being shut down:', hoursToShutdown.slice(0, 3).map(h => h.price));
      console.error('Top 3 lowest prices being kept:', hoursToKeepRunning.slice(-3).map(h => h.price));
      return null; // Return null to prevent showing incorrect data
    } else {
      console.log('✅ Validation passed: Optimized price is lower than original');
    }
    
    // Price distribution analysis using REAL data
    const priceRanges = [
      { min: 0, max: 0, label: '$0/MWh' },
      { min: 1, max: 10, label: '$1-$10/MWh' },
      { min: 11, max: 20, label: '$11-$20/MWh' },
      { min: 21, max: 30, label: '$21-$30/MWh' },
      { min: 31, max: 40, label: '$31-$40/MWh' },
      { min: 41, max: 50, label: '$41-$50/MWh' },
      { min: 51, max: 60, label: '$51-$60/MWh' },
      { min: 61, max: 70, label: '$61-$70/MWh' },
      { min: 71, max: 80, label: '$71-$80/MWh' },
      { min: 81, max: 90, label: '$81-$90/MWh' },
      { min: 91, max: 100, label: '$91-$100/MWh' },
      { min: 101, max: 150, label: '$101-$150/MWh' },
      { min: 151, max: 10000, label: '$151+/MWh' }
    ];
    
    const distributionData = priceRanges.map(range => {
      // Ensure we include zero prices correctly
      const hoursInRange = hourlyData.filter(hour => {
        const price = hour.price || 0; // Handle potential undefined/null prices
        return price >= range.min && price <= range.max;
      }).length;
      
      return {
        range: range.label,
        hours: hoursInRange,
        percentage: (hoursInRange / totalHours) * 100
      };
    });
    
    console.log('=== REAL PRICE DISTRIBUTION DEBUG ===');
    console.log(`Total hours for distribution: ${totalHours}`);
    console.log(`Zero price hours: ${hourlyData.filter(h => (h.price || 0) === 0).length}`);
    console.log(`Price range 0-10: ${hourlyData.filter(h => (h.price || 0) >= 0 && (h.price || 0) <= 10).length}`);
    
    distributionData.forEach(d => {
      console.log(`${d.range}: ${d.hours} hours (${d.percentage.toFixed(1)}%)`);
    });
    
    // Calculate all-in savings (including transmission adder)
    const transmissionAdderValue = parseFloat(transmissionAdder);
    const totalAllInSavings = hoursToShutdown.reduce((sum, hour) => {
      const energyWithAdder = hour.price + transmissionAdderValue;
      return sum + energyWithAdder;
    }, 0);
    
    // Format ALL shutdown hours for display (not just first 50)
    const events = hoursToShutdown.map((hour) => ({
      date: hour.date,
      time: `${hour.hour.toString().padStart(2, '0')}:00`,
      price: hour.price,  // Energy price ONLY, no adder
      allInPrice: hour.price + transmissionAdderValue,
      duration: 1,
      savings: hour.price,  // Energy savings only
      allInSavings: hour.price + transmissionAdderValue
    }));
    
    return {
      totalShutdowns: allowedDowntimeHours,
      totalHours: allowedDowntimeHours,
      downtimePercentage: actualDowntimePercent,
      totalSavings: totalSavings,
      totalAllInSavings: totalAllInSavings,
      newAveragePrice: optimizedAvgPrice,
      originalAverage: originalAvgPrice,
      hourlyData: hourlyData,  // Real AESO data
      distributionData: distributionData,
      events: events
    };
  };

  // Enhanced: Smart price spike detection with variable duration
  const detectSmartPriceSpikes = (hourlyData: any[], threshold: number, constraints: any, baseline: any) => {
    const events: any[] = [];
    const violations: string[] = [];
    let totalHours = 0;
    let i = 0;

    // Debug: Check data distribution
    const prices = hourlyData.map(h => h.price);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const p90Price = prices.sort((a, b) => b - a)[Math.floor(prices.length * 0.1)]; // 90th percentile
    
    console.log(`=== SMART SPIKE DETECTION DEBUG ===`);
    console.log(`Threshold: ${threshold} ¢/kWh`);
    console.log(`Data range: ${Math.min(...prices).toFixed(2)} - ${maxPrice.toFixed(2)} ¢/kWh`);
    console.log(`Average price: ${avgPrice.toFixed(2)} ¢/kWh`);
    console.log(`90th percentile: ${p90Price.toFixed(2)} ¢/kWh`);
    
    // Adaptive threshold: if user threshold is too high, use 90th percentile
    const effectiveThreshold = threshold > p90Price ? p90Price : threshold;
    console.log(`Effective threshold: ${effectiveThreshold.toFixed(2)} ¢/kWh`);

    while (i < hourlyData.length) {
      const currentHour = hourlyData[i];
      
      // Check if current hour exceeds effective threshold
      if (currentHour.price >= effectiveThreshold) {
        // Find the end of consecutive high prices
        let duration = 0;
        let peakPrice = currentHour.price;
        let totalSpikeCost = 0;
        let j = i;

        // Extend shutdown duration for consecutive high prices
        while (j < hourlyData.length && 
               (hourlyData[j].price >= effectiveThreshold || 
                (duration > 0 && hourlyData[j].price >= effectiveThreshold * constraints.consecutivePriceThresholdMultiplier))) {
          duration++;
          peakPrice = Math.max(peakPrice, hourlyData[j].price);
          totalSpikeCost += hourlyData[j].price;
          j++;
        }

        console.log(`Found potential event: ${currentHour.date} ${currentHour.hour}:00, duration: ${duration}h, peak: ${peakPrice.toFixed(2)}`);

        // Apply minimum duration constraint (make it more lenient for demonstration)
        const effectiveMinDuration = Math.min(constraints.minimumShutdownDuration, 1); // At least 1 hour
        duration = Math.max(duration, effectiveMinDuration);

        // Check daily shutdown limit (more lenient)
        const dayShutdowns = events.filter(e => e.date === currentHour.date).length;
        if (dayShutdowns >= constraints.maximumShutdownsPerDay) {
          violations.push(`Daily shutdown limit exceeded on ${currentHour.date}`);
          console.log(`Skipping event due to daily limit: ${currentHour.date}, existing events: ${dayShutdowns}`);
          i = j;
          continue;
        }

        if (duration >= effectiveMinDuration) {
          console.log(`Creating event: ${currentHour.date} ${currentHour.hour}:00, duration: ${duration}h`);
          const avgSpikePrice = totalSpikeCost / Math.min(duration, j - i);
          const baselinePrice = baseline.rollingData.find(r => 
            Math.abs(r.datetime.getTime() - currentHour.datetime.getTime()) < 3600000
          )?.average || baseline.average;

          events.push({
            date: currentHour.date,
            startHour: currentHour.hour,
            endHour: Math.min(currentHour.hour + duration - 1, 23),
            duration: duration,
            peakPrice: peakPrice,
            avgPrice: avgSpikePrice,
            baselinePrice: baselinePrice,
            savings: (avgSpikePrice - baselinePrice) * duration,
            allInSavings: (calculateAllInPrice(avgSpikePrice) - calculateAllInPrice(baselinePrice)) * duration,
            operationalCost: (constraints.startupCostPerMW + constraints.shutdownCostPerMW) / 1000
          });

          totalHours += duration;
        }

        i = j;
      } else {
        i++;
      }
    }

    const averageDuration = events.length > 0 ? totalHours / events.length : 0;

    return {
      events,
      totalHours,
      averageDuration,
      violations
    };
  };

  // Enhanced: Calculate strike price savings with operational costs
  const calculateStrikePriceSavings = (spikes: any, baseline: any, constraints: any) => {
    const grossSavings = spikes.events.reduce((sum: number, event: any) => sum + (event.savings || 0), 0);
    const grossAllInSavings = spikes.events.reduce((sum: number, event: any) => sum + (event.allInSavings || 0), 0);
    const operationalCosts = spikes.events.reduce((sum: number, event: any) => sum + (event.operationalCost || 0), 0);
    
    // Run Monte Carlo simulation for strike price analysis
    const monteCarloResult = runMonteCarloSimulation(spikes.events, baseline);
    
    // Risk adjustment based on baseline confidence
    const riskAdjustment = grossSavings * (1 - (baseline.confidenceLevel || 0.5)) * 0.25; // 25% of uncertain savings
    const netSavings = grossSavings - operationalCosts - riskAdjustment;
    const netAllInSavings = grossAllInSavings - operationalCosts - riskAdjustment;
    
    // Calculate new average price
    const totalOperationalHours = (parseInt(timePeriod) * 24) - (spikes.totalHours || 0);
    const savingsRatio = (netSavings || 0) / (grossSavings || 1);
    const newAveragePrice = (baseline.average || 0) * (1 - savingsRatio * 0.15);
    
    return {
      grossSavings: grossSavings || 0,
      operationalCosts: operationalCosts || 0,
      riskAdjustment: riskAdjustment || 0,
      netSavings: netSavings || 0,
      netAllInSavings: netAllInSavings || 0,
      newAveragePrice: newAveragePrice || baseline.average || 0,
      confidenceLevel: baseline.confidenceLevel || 0.5,
      projectedROI: (netSavings || 0) > 0 ? ((netSavings || 0) / (operationalCosts || 1)) * 100 : 0,
      monteCarloConfidenceInterval: monteCarloResult.confidenceInterval || { lower: 0, upper: 0 },
      probabilityOfProfit: monteCarloResult.probabilityOfProfit || 0,
      expectedValue: monteCarloResult.expectedValue || 0
    };
  };

  const calculateAllInPrice = (energyPrice: number) => {
    const adder = parseFloat(transmissionAdder);
    const result = energyPrice + adder;
    console.log(`calculateAllInPrice: ${energyPrice} + ${adder} = ${result}`);
    return result;
  };

  // Helper function for seasonal price adjustments
  const calculateSeasonalMultiplier = (date: Date) => {
    const month = date.getMonth(); // 0-11
    const hour = date.getHours(); // 0-23
    
    // Winter months (Dec, Jan, Feb) have higher prices
    if ([11, 0, 1].includes(month)) {
      return 1.2 + (hour >= 16 && hour <= 20 ? 0.3 : 0); // Extra premium during evening peak
    }
    
    // Summer months (Jun, Jul, Aug) have moderate increases
    if ([5, 6, 7].includes(month)) {
      return 1.1 + (hour >= 14 && hour <= 18 ? 0.2 : 0); // Afternoon AC load
    }
    
    // Spring/Fall have lower baseline
    return 0.9 + (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 0.15 : 0); // Rush hour peaks
  };


  const convertToUSD = (cadPrice: number) => {
    if (!exchangeRate) return 0;
    return cadPrice * exchangeRate;
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (typeof value !== 'number' || isNaN(value)) return 'CA$0.00';
    return `CA$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}/MWh
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get current analysis result
  const getCurrentAnalysis = () => {
    return customAnalysisResult;
  };

  const currentAnalysis = getCurrentAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Historical Pricing Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced pricing analytics and peak shutdown optimization tools
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={fetchMonthlyData} 
            disabled={loadingMonthly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh Monthly</span>
            <span className="sm:hidden">Monthly</span>
          </Button>
          <Button 
            onClick={fetchYearlyData} 
            disabled={loadingYearly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh Yearly</span>
            <span className="sm:hidden">Yearly</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        {/* Time Period Selector + Feature Tabs */}
        <div className="flex flex-col gap-4">
          {/* Time Period Dropdown */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Time Period:</span>
            </div>
            <Select
              value={selectedTimePeriod}
              onValueChange={(value: 'daily' | 'monthly' | 'yearly' | 'historical') => setSelectedTimePeriod(value)}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="daily">Last 24 Hours</SelectItem>
                <SelectItem value="monthly">Last 30 Days</SelectItem>
                <SelectItem value="yearly">Last 12 Months</SelectItem>
                <SelectItem value="historical">8-Year Historical</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto hidden sm:flex">
              {selectedTimePeriod === 'daily' && '24 hours'}
              {selectedTimePeriod === 'monthly' && '30 days'}
              {selectedTimePeriod === 'yearly' && '12 months'}
              {selectedTimePeriod === 'historical' && '8 years'}
            </Badge>
          </div>

          {/* 5 Primary Feature Tabs */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 h-auto p-1.5 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Uptime Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="12cp" 
              className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Target className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">12CP & Reserves</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weather" 
              className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <CloudRain className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Weather</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shared" 
              className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all col-span-2 sm:col-span-1"
            >
              <Share2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Shared Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Consolidated Overview Tab - Shows data based on selectedTimePeriod */}
        <TabsContent value="overview" className="space-y-4">
          {/* Period-specific data header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {selectedTimePeriod === 'daily' && '24-Hour Market Overview'}
                {selectedTimePeriod === 'monthly' && '30-Day Market Overview'}
                {selectedTimePeriod === 'yearly' && '12-Month Market Overview'}
                {selectedTimePeriod === 'historical' && '8-Year Historical Analysis'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedTimePeriod === 'daily' && 'Real-time hourly pricing from AESO'}
                {selectedTimePeriod === 'monthly' && 'Last 30 days of market data'}
                {selectedTimePeriod === 'yearly' && 'Annual pricing trends and patterns'}
                {selectedTimePeriod === 'historical' && 'Long-term historical market analysis'}
              </p>
            </div>
            <Button 
              onClick={() => {
                if (selectedTimePeriod === 'daily') fetchDailyData();
                else if (selectedTimePeriod === 'monthly') fetchMonthlyData();
                else if (selectedTimePeriod === 'yearly') fetchYearlyData();
                else if (selectedTimePeriod === 'historical') fetchRealHistoricalData();
              }}
              disabled={loadingDaily || loadingMonthly || loadingYearly || loadingHistoricalTenYear}
              variant="outline"
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Credit Settings Panel */}
          <CreditSettingsPanel 
            settings={creditSettings}
            onSettingsChange={setCreditSettings}
          />

          {/* Credit Summary Card - Show when credits enabled */}
          {creditSettings.enabled && currentRawData.length > 0 && (
            <CreditSummaryCard summary={creditSummary} unit="mwh" />
          )}

          {/* Statistics Cards - Dynamic based on period */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const data = selectedTimePeriod === 'daily' ? dailyData 
                        : selectedTimePeriod === 'monthly' ? monthlyData 
                        : selectedTimePeriod === 'yearly' ? yearlyData 
                        : historicalTenYearData;
              const loading = selectedTimePeriod === 'daily' ? loadingDaily 
                           : selectedTimePeriod === 'monthly' ? loadingMonthly 
                           : selectedTimePeriod === 'yearly' ? loadingYearly 
                           : loadingHistoricalTenYear;

              if (loading) {
                return Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </CardContent>
                  </Card>
                ));
              }

              const stats = data?.statistics;
              return (
                <>
                  <Card className={`border-l-4 ${creditSettings.enabled ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {creditSettings.enabled ? 'Effective Avg Price' : 'Average Price'}
                          </p>
                          <p className={`text-2xl font-bold ${creditSettings.enabled ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {creditSettings.enabled && creditSummary.effectivePrice > 0
                              ? formatCurrency(creditSummary.effectivePrice)
                              : stats?.average ? formatCurrency(stats.average) : '—'}
                          </p>
                          {creditSettings.enabled && creditSummary.savingsPercentage > 0 && (
                            <p className="text-xs text-emerald-600 font-medium">
                              {creditSummary.savingsPercentage.toFixed(1)}% savings
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">per MWh</p>
                        </div>
                        <Coins className={`w-8 h-8 ${creditSettings.enabled ? 'text-emerald-500' : 'text-blue-500'}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peak Price</p>
                          <p className="text-2xl font-bold text-red-600">
                            {stats?.peak ? formatCurrency(stats.peak) : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">highest recorded</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Low Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            {stats?.low !== undefined ? formatCurrency(stats.low) : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">lowest recorded</p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Volatility</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {stats?.volatility ? `${stats.volatility.toFixed(1)}%` : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">price variation</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>

          {/* Uptime Optimization Quick Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Optimized Pricing by Uptime
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Strategic shutdown during peak prices - showing actual avg cost in CAD & USD
              </p>
            </CardHeader>
            <CardContent>
              {(() => {
                const data = selectedTimePeriod === 'daily' ? dailyData 
                          : selectedTimePeriod === 'monthly' ? monthlyData 
                          : selectedTimePeriod === 'yearly' ? yearlyData 
                          : monthlyData;
                
                if (!data?.rawHourlyData) return <div className="text-sm text-muted-foreground">Loading data...</div>;
                
                const uptimeLevels = [85, 90, 95, 97];
                const transmissionCost = parseFloat(transmissionAdder) || 11.63;
                const hourlyPrices = data.rawHourlyData.map((h: any) => h.price);
                
                // Calculate credit amount when enabled
                const creditAmount = creditSettings.enabled 
                  ? (creditSummary.twelveCPCredit + creditSummary.orCredit) 
                  : 0;
                
                const quickAnalysis = uptimeLevels.map(uptime => {
                  const totalHours = hourlyPrices.length;
                  const operatingHours = Math.floor(totalHours * (uptime / 100));
                  const sortedPrices = [...hourlyPrices].sort((a: number, b: number) => a - b);
                  const operatingPrices = sortedPrices.slice(0, operatingHours);
                  const avgEnergyPrice = operatingPrices.reduce((sum: number, p: number) => sum + p, 0) / operatingHours;
                  const allInPriceBase = avgEnergyPrice + transmissionCost;
                  const allInPriceWithCredits = Math.max(0, allInPriceBase - creditAmount);
                  
                  return {
                    uptime,
                    priceInCentsCAD: (allInPriceWithCredits / 10).toFixed(2),
                    priceInCentsUSD: (convertCADtoUSD(allInPriceWithCredits) / 10).toFixed(2),
                    avgEnergyCAD: avgEnergyPrice.toFixed(2),
                    avgEnergyUSD: convertCADtoUSD(avgEnergyPrice).toFixed(2),
                    creditAmountCAD: creditAmount.toFixed(2),
                    creditAmountUSD: convertCADtoUSD(creditAmount).toFixed(2)
                  };
                });
                
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickAnalysis.map((item) => (
                      <div key={item.uptime} className={`bg-muted/30 rounded-lg p-3 border ${creditSettings.enabled ? 'border-green-300 dark:border-green-700' : 'border-border'}`}>
                        <div className="text-xs text-muted-foreground mb-1">{item.uptime}% Uptime</div>
                        <div className="space-y-1">
                          <div>
                            <div className={`text-lg font-bold ${creditSettings.enabled ? 'text-green-600' : 'text-blue-600'}`}>
                              {item.priceInCentsCAD}¢
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CAD per kWh
                            </div>
                          </div>
                          <div>
                            <div className={`text-lg font-bold ${creditSettings.enabled ? 'text-emerald-600' : 'text-green-600'}`}>
                              {item.priceInCentsUSD}¢
                            </div>
                            <div className="text-xs text-muted-foreground">
                              USD per kWh
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">Energy only:</div>
                          <div className="text-xs font-medium flex flex-wrap gap-x-1 items-center">
                            <span className="text-orange-600 whitespace-nowrap">CA${item.avgEnergyCAD}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-green-600 whitespace-nowrap">US${item.avgEnergyUSD}</span>
                          </div>
                          {creditSettings.enabled && creditAmount > 0 && (
                            <div className="text-xs font-medium text-green-600 mt-1">
                              Credit: -CA${item.creditAmountCAD} / -US${item.creditAmountUSD}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Price Trend
                {creditSettings.enabled && (
                  <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                    Credit-Adjusted View
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {(() => {
                  const data = selectedTimePeriod === 'daily' ? dailyData 
                            : selectedTimePeriod === 'monthly' ? monthlyData 
                            : selectedTimePeriod === 'yearly' ? yearlyData 
                            : historicalTenYearData;
                  const loading = selectedTimePeriod === 'daily' ? loadingDaily 
                               : selectedTimePeriod === 'monthly' ? loadingMonthly 
                               : selectedTimePeriod === 'yearly' ? loadingYearly 
                               : loadingHistoricalTenYear;

                  if (loading) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    );
                  }

                  const originalChartData = data?.chartData || [];
                  if (originalChartData.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No data available</p>
                        </div>
                      </div>
                    );
                  }

                  // Build chart data with credit-adjusted prices
                  const chartData = creditSettings.enabled ? originalChartData.map((point: any, index: number) => {
                    const creditAmount = creditSummary.twelveCPCredit + creditSummary.orCredit;
                    const originalPrice = point.price ?? point.average ?? 0;
                    return {
                      ...point,
                      originalPrice,
                      adjustedPrice: Math.max(0, originalPrice - creditAmount),
                    };
                  }) : originalChartData;

                  const priceKey = selectedTimePeriod === 'yearly' ? 'average' : 'price';

                  if (creditSettings.enabled) {
                    return (
                      <ResponsiveContainer>
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey={selectedTimePeriod === 'yearly' ? 'month' : 'date'} 
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => `$${Math.round(value)}`}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="bg-background border rounded-lg shadow-lg p-3">
                                  <p className="font-medium mb-2">{label}</p>
                                  {payload.map((entry: any, index: number) => (
                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                      {entry.name}: ${entry.value?.toFixed(2)}/MWh
                                    </p>
                                  ))}
                                </div>
                              );
                            }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="originalPrice" 
                            stroke="#94a3b8" 
                            fill="#94a3b820" 
                            name="Pool Price"
                            strokeDasharray="5 5"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="adjustedPrice" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={false}
                            name="Credit-Adjusted"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    );
                  }

                  return (
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey={selectedTimePeriod === 'yearly' ? 'month' : 'date'} 
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => `$${Math.round(value)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey={priceKey} 
                          stroke="#2563eb" 
                          fill="#2563eb20" 
                          name="Price"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Historical-specific content */}
          {selectedTimePeriod === 'historical' && (
            <AdvancedAnalytics />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Average Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {yearlyData?.statistics?.average !== undefined ? formatCurrency(yearlyData.statistics.average) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">per MWh (12 months)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  Peak Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {yearlyData?.statistics?.peak !== undefined ? formatCurrency(yearlyData.statistics.peak) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">highest (12 months)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  Low Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {yearlyData?.statistics?.low !== undefined ? formatCurrency(yearlyData.statistics.low) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">lowest (12 months)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Volatility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {yearlyData?.statistics?.volatility ? `${yearlyData.statistics.volatility.toFixed(1)}%` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">12-month variation</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-600" />
                Peak Hour Shutdown Analyzer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate energy savings by shutting down operations during high price periods
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Time Period and Adder Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      Analysis Period
                      {loadingCustomPeriod && (
                        <span className="text-xs text-muted-foreground animate-pulse">
                          (Loading data...)
                        </span>
                      )}
                    </label>
                    <Select 
                      value={timePeriod} 
                      onValueChange={(value: '30' | '90' | '180' | '365' | '730' | '1095' | '1460') => setTimePeriod(value)}
                      disabled={loadingCustomPeriod}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="180">Last 180 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                        <SelectItem value="730">Last 2 years</SelectItem>
                        <SelectItem value="1095">Last 3 years</SelectItem>
                        <SelectItem value="1460">Last 4 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Transmission Adder ($/MWh)</label>
                    <input
                      type="number"
                      value={transmissionAdder}
                      onChange={(e) => setTransmissionAdder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Transmission, DTS, and other fees
                    </p>
                  </div>
                  
                    <div>
                      <label className="text-sm font-medium">Exchange Rate</label>
                      <div className="text-sm font-medium text-green-600">
                        {liveExchangeRate ? `1 CAD = ${liveExchangeRate.toFixed(4)} USD` : 'Loading...'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Live rate from multiple sources
                      </p>
                    </div>
                </div>

                {/* Uptime Analysis Configuration */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Uptime Optimization Analysis
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Target Uptime (%)</label>
                      <input
                        type="number"
                        value={uptimePercentage}
                        onChange={(e) => {
                          let value = parseFloat(e.target.value);
                          if (isNaN(value)) {
                            setUptimePercentage(e.target.value);
                            return;
                          }
                          if (value > 100) value = 100;
                          if (value < 50) value = 50;
                          setUptimePercentage(value.toString());
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="50"
                        max="100"
                        step="0.1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {parseFloat(uptimePercentage) === 100 
                          ? "100% uptime = baseline (no shutdowns)"
                          : `Automatically shuts down during most expensive ${(100 - parseFloat(uptimePercentage || '95')).toFixed(1)}% of hours to maintain ${uptimePercentage}% uptime`
                        }
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleUptimeAnalysis}
                      disabled={
                        loadingPeakAnalysis || 
                        loadingCustomPeriod || 
                        (!monthlyData && !customPeriodData) ||
                        parseFloat(uptimePercentage) > 100 ||
                        parseFloat(uptimePercentage) < 50 ||
                        isNaN(parseFloat(uptimePercentage))
                      }
                      className="w-full"
                    >
                      {loadingCustomPeriod ? 'Loading data...' : loadingPeakAnalysis ? 'Analyzing...' : 'Calculate Uptime Optimized'}
                    </Button>
                  </div>
                </div>

                {/* Analysis Results */}
                {currentAnalysis && (
                  <div className="space-y-4">
                    {/* Export Button */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={exportingPDF || exportingComprehensive}>
                            {exportingPDF || exportingComprehensive ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Export Analysis
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportToPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            Export Current Analysis (PDF)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportComprehensivePDF}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Export Comprehensive Report (PDF)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setShareReportType('single'); setShowShareDialog(true); }}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Create Shareable Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setShareReportType('comprehensive'); setShowShareDialog(true); }}>
                            <Link className="h-4 w-4 mr-2" />
                            Share Comprehensive Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                       <div className="text-center">
                         <div className="text-2xl font-bold text-red-600">{currentAnalysis.totalShutdowns}</div>
                         <p className="text-sm text-muted-foreground">Shutdown Events</p>
                         <p className="text-xs text-muted-foreground">
                           for {uptimePercentage}% uptime
                         </p>
                       </div>
                       
                       <div className="text-center">
                         <div className="text-2xl font-bold text-orange-600">{currentAnalysis.totalHours}</div>
                         <p className="text-sm text-muted-foreground">Total Hours</p>
                         <p className="text-xs text-muted-foreground">of shutdown</p>
                       </div>

                         <div className="text-center">
                           <div className="text-2xl font-bold text-blue-600">
                             {(() => {
                               if (!currentAnalysis?.totalHours) return '0.0';
                               const daysInPeriod = parseInt(timePeriod);
                               const totalHoursInPeriod = daysInPeriod * 24;
                               return ((currentAnalysis.totalHours / totalHoursInPeriod) * 100).toFixed(1);
                             })()}%
                           </div>
                           <p className="text-sm text-muted-foreground">Downtime</p>
                           <p className="text-xs text-muted-foreground">percentage</p>
                         </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(currentAnalysis.totalSavings || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Energy Savings</p>
                        <p className="text-xs text-muted-foreground">(energy cost only)</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(currentAnalysis.newAveragePrice || 0)}
                        </div>
                        <div className="text-sm font-medium text-blue-500">
                          {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(currentAnalysis.newAveragePrice || 0), 'USD') : 'Loading USD...'}
                        </div>
                        <p className="text-sm text-muted-foreground">New Avg Price</p>
                        <p className="text-xs text-muted-foreground">energy only</p>
                      </div>
                    </div>
                    
                    {/* Energy Cost Comparison */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-center">All-In Energy Cost Analysis (Including ${transmissionAdder}/MWh Transmission)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-gray-600">
                            {formatCurrency(calculateAllInPrice(currentAnalysis.originalAverage || 0))}
                          </div>
                          <div className="text-sm font-medium text-gray-500">
                            {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(calculateAllInPrice(currentAnalysis.originalAverage || 0)), 'USD') : 'Loading USD...'}
                          </div>
                          <p className="text-sm text-muted-foreground">Original All-In Price</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy + transmission)</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(calculateAllInPrice(currentAnalysis.newAveragePrice || 0))}
                          </div>
                          <div className="text-sm font-medium text-green-500">
                            {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(calculateAllInPrice(currentAnalysis.newAveragePrice || 0)), 'USD') : 'Loading USD...'}
                          </div>
                          <p className="text-sm text-muted-foreground">New All-In Price</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy + transmission)</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded border-2 border-green-200 dark:border-green-800">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(currentAnalysis.totalSavings || 0)}
                          </div>
                          <p className="text-sm font-semibold">Energy-Only Savings</p>
                          <p className="text-xs text-muted-foreground">Pool price difference only</p>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded border-2 border-blue-200 dark:border-blue-800">
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(currentAnalysis.totalAllInSavings || 0)}
                          </div>
                          <p className="text-sm font-semibold">Total All-In Savings</p>
                          <p className="text-xs text-muted-foreground">Including ${transmissionAdder}/MWh transmission</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Shutdown Events Table */}
                    {currentAnalysis.events && currentAnalysis.events.length > 0 && (
                      <Card>
                         <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-orange-600" />
                             Removed Hours ({currentAnalysis.events.length} highest-priced hours)
                           </CardTitle>
                           <p className="text-sm text-muted-foreground mt-1">
                             These are the {currentAnalysis.events.length} most expensive hours that were removed to achieve {uptimePercentage}% uptime
                           </p>
                         </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-left p-2">Time</th>
                                  <th className="text-right p-2">Energy Price<br/>(CAD/MWh)</th>
                                   <th className="text-right p-2">All-In Price<br/>(CAD/MWh)</th>
                                   <th className="text-right p-2">All-In Price<br/>(USD/MWh)</th>
                                   <th className="text-right p-2">Daily Base</th>
                                   <th className="text-right p-2">Hour Factor</th>
                                  <th className="text-right p-2">Duration</th>
                                  <th className="text-right p-2">Energy Saved<br/>(CAD)</th>
                                  <th className="text-right p-2">All-In Saved<br/>(CAD)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentAnalysis.events.map((event, index) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">{event.date}</td>
                                    <td className="p-2">{event.time || '—'}</td>
                                    <td className="p-2 text-right font-medium text-red-600">
                                      {formatCurrency(event.price)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {formatCurrency(event.allInPrice || calculateAllInPrice(event.price))}
                                    </td>
                                     <td className="p-2 text-right">
                                       {formatCurrencyUSD(convertCADtoUSD(event.allInPrice || calculateAllInPrice(event.price)), 'USD')}
                                     </td>
                                     <td className="p-2 text-right text-xs text-muted-foreground">
                                       {event.dailyBasePrice ? formatCurrency(event.dailyBasePrice) : '—'}
                                     </td>
                                     <td className="p-2 text-right text-xs text-muted-foreground">
                                       {event.multiplier ? `${event.multiplier.toFixed(2)}x` : '—'}
                                     </td>
                                    <td className="p-2 text-right">{event.duration}h</td>
                                    <td className="p-2 text-right font-medium text-green-600">
                                      {formatCurrency(event.savings)}
                                    </td>
                                    <td className="p-2 text-right font-medium text-blue-600">
                                      {formatCurrency(event.allInSavings || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="sticky bottom-0 bg-background">
                                <tr className="border-t-2 font-semibold bg-muted/30">
                                  <td className="p-2" colSpan={7}>TOTALS</td>
                                  <td className="p-2 text-right">{currentAnalysis.totalHours}h</td>
                                  <td className="p-2 text-right text-green-600">
                                    {formatCurrency(currentAnalysis.totalSavings)}
                                  </td>
                                  <td className="p-2 text-right text-blue-600">
                                    {formatCurrency(currentAnalysis.totalAllInSavings || 0)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Hourly Price Table - REAL AESO ENERGY PRICES (NO ADDERS) */}
                    {customAnalysisResult?.hourlyData && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            All Hours - Real AESO Energy Prices ({customAnalysisResult.hourlyData.length} hours)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Actual hourly pool prices from AESO for the {timePeriod}-day period (energy only, transmission NOT included)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-left p-2">Hour</th>
                                  <th className="text-right p-2">Energy Price<br/>(CAD/MWh)</th>
                                  <th className="text-right p-2">Energy Price<br/>(USD/MWh)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customAnalysisResult.hourlyData.map((hour: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">{hour.date}</td>
                                    <td className="p-2">{hour.hour.toString().padStart(2, '0')}:00</td>
                                    <td className="p-2 text-right font-medium">
                                      {formatCurrency(hour.price)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {formatCurrencyUSD(convertCADtoUSD(hour.price), 'USD')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Price Range Distribution - ENERGY ONLY */}
                    {customAnalysisResult?.distributionData && customAnalysisResult.distributionData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            Energy Price Distribution (Pool Price Only)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Real AESO pool price distribution for the {timePeriod}-day period (transmission NOT included)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {customAnalysisResult.distributionData.map((range: any, index: number) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{range.range}</span>
                                  <div className="text-right">
                                    <span className="font-bold text-lg">{range.percentage.toFixed(1)}%</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ({range.hours} hours)
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all"
                                    style={{ width: `${range.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Distribution Chart */}
                          <div className="h-96 mt-6">
                            <ResponsiveContainer>
                              <BarChart data={customAnalysisResult.distributionData} margin={{ bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="range" 
                                  angle={-45} 
                                  textAnchor="end" 
                                  height={120}
                                  interval={0}
                                />
                                <YAxis />
                                <Tooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                          <p className="font-medium">{data.range}</p>
                                          <p>{data.hours} hours ({data.percentage.toFixed(1)}%)</p>
                                          <p className="text-xs text-muted-foreground">Energy price only</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="hours" fill="#8b5cf6" name="Hours in Range" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                   </div>
                  )}

               </div>
             </CardContent>
           </Card>
         </TabsContent>

         {/* 12CP & Reserves Tab */}
         <TabsContent value="12cp" className="space-y-4">
           <TwelveCPAnalyticsTab />
         </TabsContent>


         {/* Weather Analysis Tab */}
         <TabsContent value="weather" className="space-y-4">
           <WeatherAnalysis />
         </TabsContent>

         {/* Shared Reports Tab */}
         <TabsContent value="shared" className="space-y-4">
           <SharedAESOReportsTab />
         </TabsContent>

        </Tabs>

        {/* Share Report Dialog */}
        <ShareReportDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          reportData={shareReportType === 'comprehensive' 
            ? (() => {
                const uptimeLevels = [100, 97, 96, 95, 90, 85, 80];
                return uptimeLevels.map(uptime => ({
                  uptimePercentage: uptime,
                  analysis: calculateUptimeForScenario(uptime) || {
                    totalShutdowns: 0,
                    totalHours: 0,
                    totalSavings: 0,
                    totalAllInSavings: 0,
                    originalAverage: 0,
                    newAveragePrice: 0,
                    events: []
                  }
                }));
              })()
            : currentAnalysis
          }
          reportConfig={{
            uptimePercentage,
            timePeriod,
            transmissionAdder,
            exchangeRate: liveExchangeRate || 0.73,
            exportType: shareReportType
          }}
          reportType={shareReportType}
        />
    </div>
  );
}

export default AESOHistoricalPricing;