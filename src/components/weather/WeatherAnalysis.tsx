import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, Area, AreaChart } from 'recharts';
import { CloudRain, Thermometer, Wind, Snowflake, MapPin, Calendar, Download, FileText, Flame, Zap, TrendingUp, TrendingDown, Languages } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  fetchNearestWeatherStation, 
  fetchWeatherData, 
  checkDataAvailability, 
  getComparisonPeriod, 
  aggregateWeatherData,
  calculateDetailedWeatherStatistics,
  WeatherData, 
  WeatherStatistics,
  type WeatherStation 
} from '@/lib/weatherAPI';
import { WeatherReportPDF } from './WeatherReportPDF';
import { SupportedLanguage, languageNames } from '@/lib/weatherTranslations';
import html2pdf from 'html2pdf.js';

interface WeatherAnalysisProps {}

type ChartResolution = 'auto' | 'daily' | 'weekly' | 'monthly';

export const WeatherAnalysis: React.FC<WeatherAnalysisProps> = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationName, setLocationName] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  });
  const [granularity, setGranularity] = useState<'daily' | 'hourly'>('daily');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [station, setStation] = useState<WeatherStation | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [dataAvailability, setDataAvailability] = useState<any>(null);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [comparisonPeriod, setComparisonPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const [chartResolution, setChartResolution] = useState<ChartResolution>('auto');
  const [pdfLanguage, setPdfLanguage] = useState<SupportedLanguage>('en');
  const pageSize = 50;
  
  const pdfRef = useRef<HTMLDivElement>(null);

  // Calculate detailed statistics
  const statistics = useMemo(() => {
    if (weatherData.length === 0) return null;
    return calculateDetailedWeatherStatistics(weatherData);
  }, [weatherData]);

  // Smart chart data aggregation for readability
  const chartData = useMemo(() => {
    if (weatherData.length === 0) return [];
    
    const dataLength = weatherData.length;
    let resolution = chartResolution;
    
    // Auto-select resolution based on data length
    if (resolution === 'auto') {
      if (dataLength > 365) resolution = 'monthly';
      else if (dataLength > 90) resolution = 'weekly';
      else resolution = 'daily';
    }
    
    if (resolution === 'daily' || dataLength <= 60) {
      return weatherData.map(d => ({
        ...d,
        displayDate: d.date,
      }));
    }
    
    // Aggregate data for better chart readability
    const grouped = new Map<string, {
      temps: number[];
      maxTemps: number[];
      minTemps: number[];
      precips: number[];
      winds: number[];
      snows: number[];
      dates: string[];
    }>();
    
    weatherData.forEach(d => {
      const date = new Date(d.date);
      let key: string;
      
      if (resolution === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      } else {
        // Weekly
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, { temps: [], maxTemps: [], minTemps: [], precips: [], winds: [], snows: [], dates: [] });
      }
      
      const group = grouped.get(key)!;
      if (d.temperature !== null) group.temps.push(d.temperature);
      if (d.maxTemperature !== null) group.maxTemps.push(d.maxTemperature);
      if (d.minTemperature !== null) group.minTemps.push(d.minTemperature);
      if (d.precipitation !== null) group.precips.push(d.precipitation);
      if (d.windSpeed !== null) group.winds.push(d.windSpeed);
      if (d.snowOnGround !== null) group.snows.push(d.snowOnGround);
      group.dates.push(d.date);
    });
    
    return Array.from(grouped.entries()).map(([key, group]) => {
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      const sum = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) : null;
      const max = (arr: number[]) => arr.length > 0 ? Math.max(...arr) : null;
      const min = (arr: number[]) => arr.length > 0 ? Math.min(...arr) : null;
      
      return {
        date: key,
        displayDate: key,
        temperature: avg(group.temps),
        maxTemperature: max(group.maxTemps),
        minTemperature: min(group.minTemps),
        precipitation: sum(group.precips),
        rain: null,
        snow: null,
        snowOnGround: avg(group.snows),
        windSpeed: avg(group.winds),
        windDirection: null,
        dataPoints: group.dates.length,
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [weatherData, chartResolution]);

  // Calculate optimal X-axis interval
  const xAxisInterval = useMemo(() => {
    const dataLength = chartData.length;
    if (dataLength <= 10) return 0;
    if (dataLength <= 30) return Math.floor(dataLength / 10);
    if (dataLength <= 60) return Math.floor(dataLength / 12);
    return Math.floor(dataLength / 8);
  }, [chartData]);

  const handleCoordinateInput = (value: string) => {
    setLocationName(value);
    const coordMatch = value.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLocation({ lat, lng });
      }
    }
  };

  // Quick location presets for AESO region
  const setQuickLocation = (preset: 'edmonton' | 'calgary' | 'red-deer') => {
    const locations = {
      'edmonton': { lat: 53.5461, lng: -113.4938, name: 'Edmonton, AB' },
      'calgary': { lat: 51.0447, lng: -114.0719, name: 'Calgary, AB' },
      'red-deer': { lat: 52.2681, lng: -113.8112, name: 'Red Deer, AB' }
    };
    const loc = locations[preset];
    setLocation({ lat: loc.lat, lng: loc.lng });
    setLocationName(loc.name);
  };

  const fetchWeatherAnalysis = async () => {
    if (!location || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select a location and date range.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setCurrentPage(1);
    try {
      const nearestStation = await fetchNearestWeatherStation(location.lat, location.lng, startDate, endDate);
      setStation(nearestStation);

      const data = await fetchWeatherData(
        nearestStation.stationId,
        startDate,
        endDate,
        granularity
      );
      
      setWeatherData(data);
      
      const availability = await checkDataAvailability(nearestStation.stationId, granularity);
      setDataAvailability(availability);
      
      const period = getComparisonPeriod(startDate, endDate);
      setComparisonPeriod(period);
      const aggregated = aggregateWeatherData(data, period);
      setAggregatedData(aggregated);
      
      toast({
        title: "Weather Data Loaded",
        description: `Retrieved ${data.length} records from ${nearestStation.name}.`,
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch weather data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Preload fonts for PDF generation to ensure proper Unicode rendering
  const preloadFonts = async (language: SupportedLanguage): Promise<void> => {
    const fontMap: Record<SupportedLanguage, string> = {
      en: 'Noto Sans',
      zh: 'Noto Sans SC',
      hi: 'Noto Sans Devanagari',
      ar: 'Noto Sans Arabic',
      ru: 'Noto Sans',
    };
    
    const fontFamily = fontMap[language];
    
    // Explicitly load the font with document.fonts.load()
    try {
      await document.fonts.load(`400 12px "${fontFamily}"`);
      await document.fonts.load(`600 12px "${fontFamily}"`);
      await document.fonts.load(`700 12px "${fontFamily}"`);
    } catch (e) {
      console.warn('Font loading warning:', e);
    }
    
    // Wait for all fonts to be ready
    await document.fonts.ready;
    
    // Force render with a temporary element containing sample text
    const tempEl = document.createElement('div');
    tempEl.style.fontFamily = fontFamily;
    tempEl.style.position = 'absolute';
    tempEl.style.left = '-9999px';
    tempEl.style.top = '0';
    tempEl.style.visibility = 'hidden';
    tempEl.innerHTML = '测试文本 天气数据 тест परीक्षण اختبار test 0123456789';
    document.body.appendChild(tempEl);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(tempEl);
  };

  const exportToPDF = async () => {
    if (!pdfRef.current || !station || !statistics) return;
    
    setExportingPDF(true);
    try {
      // Preload fonts for the selected language
      await preloadFonts(pdfLanguage);
      
      // Small delay to ensure fonts are fully rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const opt = {
        margin: [5, 5],
        filename: `weather-report-${locationName || 'analysis'}-${startDate}-${endDate}-${pdfLanguage}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          allowTaint: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(pdfRef.current).save();
      
      toast({
        title: "PDF Exported",
        description: `Weather report exported in ${languageNames[pdfLanguage]}.`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report.",
        variant: "destructive"
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const exportToCSV = () => {
    if (weatherData.length === 0) return;

    const headers = granularity === 'daily' 
      ? ['Date', 'Temperature (°C)', 'Max Temp', 'Min Temp', 'Precipitation (mm)', 'Rain (mm)', 'Snow (mm)', 'Snow on Ground (cm)', 'Wind Speed (km/h)', 'Wind Direction']
      : ['Date/Time', 'Temperature (°C)', 'Precipitation (mm)', 'Wind Speed (km/h)', 'Wind Direction', 'Humidity (%)', 'Pressure (kPa)'];

    const rows = weatherData.map(d => {
      if (granularity === 'daily') {
        return [
          d.date,
          d.temperature ?? '',
          d.maxTemperature ?? '',
          d.minTemperature ?? '',
          d.precipitation ?? '',
          d.rain ?? '',
          d.snow ?? '',
          d.snowOnGround ?? '',
          d.windSpeed ?? '',
          d.windDirection ?? ''
        ].join(',');
      } else {
        return [
          d.date,
          d.temperature ?? '',
          d.precipitation ?? '',
          d.windSpeed ?? '',
          d.windDirection ?? '',
          d.humidity ?? '',
          d.pressure ?? ''
        ].join(',');
      }
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-data-${startDate}-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Exported ${weatherData.length} records.`,
    });
  };

  const formatTemperature = (temp: number | null) => temp !== null ? `${temp.toFixed(1)}°C` : '—';
  const formatPrecipitation = (precip: number | null) => precip !== null ? `${precip.toFixed(1)}mm` : '—';
  const formatWindSpeed = (speed: number | null) => speed !== null ? `${speed.toFixed(1)}km/h` : '—';
  
  const formatWindDirection = (direction: number | null) => {
    if (direction === null) return '—';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(direction / 22.5) % 16;
    return directions[index];
  };

  // Pagination
  const totalPages = Math.ceil(weatherData.length / pageSize);
  const paginatedData = weatherData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Get current resolution label
  const getResolutionLabel = () => {
    if (chartResolution === 'auto') {
      const dataLength = weatherData.length;
      if (dataLength > 365) return 'Monthly (auto)';
      if (dataLength > 90) return 'Weekly (auto)';
      return 'Daily (auto)';
    }
    return chartResolution.charAt(0).toUpperCase() + chartResolution.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-600" />
            Weather Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Historical weather data from Environment and Climate Change Canada
          </p>
        </div>
        {weatherData.length > 0 && statistics && station && (
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <div className="flex items-center gap-1">
              <Select value={pdfLanguage} onValueChange={(v: SupportedLanguage) => setPdfLanguage(v)}>
                <SelectTrigger className="w-[120px] h-8">
                  <Languages className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="default" 
                size="sm" 
                onClick={exportToPDF}
                disabled={exportingPDF}
              >
                <FileText className="w-4 h-4 mr-2" />
                {exportingPDF ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location & Date Selection
          </CardTitle>
          <CardDescription>
            Select location and date range for weather analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Location Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Quick Select:</span>
            <Button variant="outline" size="sm" onClick={() => setQuickLocation('edmonton')}>
              Edmonton
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickLocation('calgary')}>
              Calgary
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickLocation('red-deer')}>
              Red Deer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                value={locationName}
                onChange={(e) => handleCoordinateInput(e.target.value)}
                placeholder="Enter city or coordinates (e.g., 53.7989, -112.8970)"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Latest data is typically 1-2 days behind
              </p>
            </div>
            
            <div>
              <Label htmlFor="granularity">Granularity</Label>
              <Select value={granularity} onValueChange={(value: 'daily' | 'hourly') => setGranularity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           
          <Button 
            onClick={fetchWeatherAnalysis} 
            disabled={loading || !location || !startDate || !endDate}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Analyze Weather Patterns'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Station Info */}
      {station && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{station.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Station ID: {station.stationId} | Elevation: {station.elevation}m
                </p>
                {station.dataStartDate && station.dataEndDate && (
                  <p className="text-sm text-muted-foreground">
                    Data available: {new Date(station.dataStartDate).getFullYear()} - {new Date(station.dataEndDate).getFullYear()}
                  </p>
                )}
                {dataAvailability && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dataAvailability.hasRecentData ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {dataAvailability.hasRecentData ? 'Recent data available' : 'Limited recent data'}
                    </span>
                    {dataAvailability.lastRecordDate && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        Latest: {new Date(dataAvailability.lastRecordDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{station.latitude.toFixed(4)}°N, {Math.abs(station.longitude).toFixed(4)}°W</p>
                <p>{station.province}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Cards */}
      {weatherData.length > 0 && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Average Temperature"
            value={statistics.temperature.average !== null ? statistics.temperature.average.toFixed(1) : '—'}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            accentColor="hsl(var(--destructive))"
            trend={statistics.temperature.max !== null && statistics.temperature.min !== null ? {
              value: Math.abs(statistics.temperature.max - statistics.temperature.min),
              direction: 'neutral',
              label: `Range: ${statistics.temperature.min?.toFixed(1)}° to ${statistics.temperature.max?.toFixed(1)}°`
            } : undefined}
          />
          
          <MetricCard
            title="Total Precipitation"
            value={statistics.precipitation.total.toFixed(1)}
            unit="mm"
            icon={<CloudRain className="w-5 h-5" />}
            accentColor="hsl(210, 100%, 50%)"
            trend={{
              value: statistics.precipitation.daysWithPrecip,
              direction: 'neutral',
              label: `days with precipitation`
            }}
          />
          
          <MetricCard
            title="Heating Degree Days"
            value={statistics.heatingDegreeDays.toFixed(0)}
            unit="HDD"
            icon={<Flame className="w-5 h-5" />}
            accentColor="hsl(25, 95%, 53%)"
            trend={{
              value: 18,
              direction: 'neutral',
              label: `base temp (°C)`
            }}
          />
          
          <MetricCard
            title="Cooling Degree Days"
            value={statistics.coolingDegreeDays.toFixed(0)}
            unit="CDD"
            icon={<Zap className="w-5 h-5" />}
            accentColor="hsl(190, 95%, 39%)"
            trend={{
              value: 18,
              direction: 'neutral',
              label: `base temp (°C)`
            }}
          />
        </div>
      )}

      {/* Energy Impact Analysis */}
      {weatherData.length > 0 && statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Energy Impact Analysis
            </CardTitle>
            <CardDescription>
              Weather conditions correlated with energy demand patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Extremes */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  Temperature Extremes
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-red-500/5 rounded">
                    <span className="text-muted-foreground">Highest:</span>
                    <div className="text-right">
                      <span className="font-medium text-red-600">{formatTemperature(statistics.temperature.max)}</span>
                      {statistics.temperature.maxDate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(statistics.temperature.maxDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-500/5 rounded">
                    <span className="text-muted-foreground">Lowest:</span>
                    <div className="text-right">
                      <span className="font-medium text-blue-600">{formatTemperature(statistics.temperature.min)}</span>
                      {statistics.temperature.minDate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(statistics.temperature.minDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Temperature extremes drive peak electricity demand for heating/cooling.
                  </p>
                </div>
              </div>

              {/* Wind Conditions */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  Wind Conditions
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Average Speed:</span>
                    <span className="font-medium">{formatWindSpeed(statistics.wind.average)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-500/5 rounded">
                    <span className="text-muted-foreground">Maximum Gust:</span>
                    <div className="text-right">
                      <span className="font-medium text-green-600">{formatWindSpeed(statistics.wind.max)}</span>
                      {statistics.wind.maxDate && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(statistics.wind.maxDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Wind speed directly impacts wind generation potential in Alberta's grid.
                  </p>
                </div>
              </div>

              {/* Precipitation Impact */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  Precipitation Impact
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{statistics.precipitation.total.toFixed(1)}mm</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Daily Average:</span>
                    <span className="font-medium">{statistics.precipitation.average.toFixed(1)}mm</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-500/5 rounded">
                    <span className="text-muted-foreground">Days w/ Precip:</span>
                    <span className="font-medium text-blue-600">{statistics.precipitation.daysWithPrecip}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cloud cover from precipitation reduces solar generation potential.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Resolution Control */}
      {weatherData.length > 0 && (
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Chart Resolution:</Label>
          <Select value={chartResolution} onValueChange={(v: ChartResolution) => setChartResolution(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto ({getResolutionLabel().replace(' (auto)', '')})</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly Average</SelectItem>
              <SelectItem value="monthly">Monthly Average</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {chartData.length} data points shown
          </span>
        </div>
      )}

      {/* Charts */}
      {weatherData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval={xAxisInterval}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    unit="°C" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={50}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number, name: string) => [
                      `${value?.toFixed(1)}°C`, 
                      name === 'temperature' ? 'Avg Temp' : name === 'maxTemperature' ? 'Max' : 'Min'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2.5}
                    fill="url(#tempGradient)"
                    name="Avg Temp"
                    dot={chartData.length < 60}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  {granularity === 'daily' && chartData[0]?.maxTemperature !== undefined && (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="maxTemperature" 
                        stroke="#ef4444" 
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        name="Max"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minTemperature" 
                        stroke="#3b82f6" 
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        name="Min"
                        dot={false}
                      />
                    </>
                  )}
                  {chartData.length > 30 && (
                    <Brush 
                      dataKey="date" 
                      height={25} 
                      stroke="hsl(var(--primary))"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Precipitation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                Precipitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval={xAxisInterval}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    unit="mm" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={50}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number, name: string) => [`${value?.toFixed(1)}mm`, name === 'precipitation' ? 'Total' : name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="precipitation" fill="#3b82f6" name="Total" radius={[2, 2, 0, 0]} />
                  {chartData.length > 30 && (
                    <Brush 
                      dataKey="date" 
                      height={25} 
                      stroke="hsl(var(--primary))"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Wind Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-green-500" />
                Wind Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval={xAxisInterval}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    unit="km/h" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={55}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number) => [`${value?.toFixed(1)}km/h`, 'Wind Speed']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="windSpeed" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fill="url(#windGradient)"
                    name="Wind Speed"
                    dot={chartData.length < 60}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  {chartData.length > 30 && (
                    <Brush 
                      dataKey="date" 
                      height={25} 
                      stroke="hsl(var(--primary))"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Snow on Ground Chart (Daily only) */}
          {granularity === 'daily' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-500" />
                  Snow on Ground
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      interval={xAxisInterval}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      unit="cm" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      width={50}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number) => [`${value}cm`, 'Snow Depth']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="snowOnGround" fill="#06b6d4" name="Snow Depth" radius={[2, 2, 0, 0]} />
                    {chartData.length > 30 && (
                      <Brush 
                        dataKey="date" 
                        height={25} 
                        stroke="hsl(var(--primary))"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Data Table with Pagination */}
      {weatherData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Weather Data
                </CardTitle>
                <CardDescription>
                  {weatherData.length} records | Quality-filtered data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Temperature</TableHead>
                    {granularity === 'daily' && (
                      <>
                        <TableHead>Max</TableHead>
                        <TableHead>Min</TableHead>
                      </>
                    )}
                    <TableHead>Precipitation</TableHead>
                    {granularity === 'daily' && (
                      <>
                        <TableHead>Rain</TableHead>
                        <TableHead>Snow</TableHead>
                        <TableHead>Snow Depth</TableHead>
                      </>
                    )}
                    <TableHead>Wind</TableHead>
                    <TableHead>Direction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(data.date).toLocaleDateString()}
                        {granularity === 'hourly' && ` ${new Date(data.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </TableCell>
                      <TableCell>{formatTemperature(data.temperature)}</TableCell>
                      {granularity === 'daily' && (
                        <>
                          <TableCell>{formatTemperature(data.maxTemperature || null)}</TableCell>
                          <TableCell>{formatTemperature(data.minTemperature || null)}</TableCell>
                        </>
                      )}
                      <TableCell>{formatPrecipitation(data.precipitation)}</TableCell>
                      {granularity === 'daily' && (
                        <>
                          <TableCell>{formatPrecipitation(data.rain || null)}</TableCell>
                          <TableCell>{formatPrecipitation(data.snow || null)}</TableCell>
                          <TableCell>{data.snowOnGround ? `${data.snowOnGround}cm` : '—'}</TableCell>
                        </>
                      )}
                      <TableCell>{formatWindSpeed(data.windSpeed)}</TableCell>
                      <TableCell>{formatWindDirection(data.windDirection)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, weatherData.length)} of {weatherData.length}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {!loading && weatherData.length === 0 && location && startDate && endDate && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No weather data available for the selected location and date range.
              Try a different location or date range.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Offscreen PDF Template - positioned off-screen but still rendered for html2canvas */}
      {station && statistics && (
        <div 
          style={{ 
            position: 'fixed', 
            left: '-10000px', 
            top: 0, 
            width: '210mm',
            opacity: 0, 
            pointerEvents: 'none',
            zIndex: -9999,
          }}
        >
          <WeatherReportPDF
            ref={pdfRef}
            station={station}
            weatherData={weatherData}
            statistics={statistics}
            startDate={startDate}
            endDate={endDate}
            locationName={locationName}
            language={pdfLanguage}
          />
        </div>
      )}
    </div>
  );
};

export default WeatherAnalysis;
