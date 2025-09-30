import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GooglePlacesInput } from "@/components/ui/google-places-input";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudRain, Thermometer, Wind, Snowflake, MapPin, Calendar, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchNearestWeatherStation, fetchWeatherData, checkDataAvailability, getMostRecentDataDate, getSuggestedDateRange, getComparisonPeriod, aggregateWeatherData, compareWithHistorical, WeatherData, type WeatherStation } from '@/lib/weatherAPI';

interface WeatherAnalysisProps {}

export const WeatherAnalysis: React.FC<WeatherAnalysisProps> = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationName, setLocationName] = useState('');
  // Set default dates - yesterday as end date (most recent data), 30 days back as start
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Yesterday (most recent data available)
    return date.toISOString().split('T')[0];
  });
  const [granularity, setGranularity] = useState<'daily' | 'hourly'>('daily');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [station, setStation] = useState<WeatherStation | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataAvailability, setDataAvailability] = useState<any>(null);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [comparisonPeriod, setComparisonPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const handleLocationSelect = (place: any) => {
    if (place?.coordinates) {
      setLocation({ lat: place.coordinates.lat, lng: place.coordinates.lng });
      setLocationName(place.address || place.coordinates.lat + ', ' + place.coordinates.lng);
    }
  };

  const handleCoordinateInput = (value: string) => {
    setLocationName(value);
    // Parse coordinates if entered directly (format: lat, lng)
    const coordMatch = value.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLocation({ lat, lng });
      }
    }
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
    try {
      // Find nearest weather station with data in the requested date range
      const nearestStation = await fetchNearestWeatherStation(location.lat, location.lng, startDate, endDate);
      setStation(nearestStation);

      // Fetch weather data
      const data = await fetchWeatherData(
        nearestStation.stationId,
        startDate,
        endDate,
        granularity
      );
      
      setWeatherData(data);
      
      // Check data availability for this station
      const availability = await checkDataAvailability(nearestStation.stationId, granularity);
      setDataAvailability(availability);
      
      // Determine comparison period and aggregate data
      const period = getComparisonPeriod(startDate, endDate);
      setComparisonPeriod(period);
      const aggregated = aggregateWeatherData(data, period);
      setAggregatedData(aggregated);
      
      toast({
        title: "Weather Data Loaded",
        description: `Retrieved ${data.length} records from ${nearestStation.name}. Comparing by ${period} periods.`,
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch weather data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-600" />
          Weather Analysis
        </h3>
        <p className="text-sm text-muted-foreground">
          Historical weather data from Environment and Climate Change Canada
        </p>
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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
               max={new Date(Date.now() - 86400000).toISOString().split('T')[0]} // Yesterday (most recent data)
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
           
           <div className="lg:col-span-5">
             <Button 
               onClick={fetchWeatherAnalysis} 
               disabled={loading || !location || !startDate || !endDate}
               className="flex items-center gap-2"
             >
               <Download className="w-4 h-4" />
               {loading ? 'Analyzing...' : 'Analyze Weather Patterns'}
             </Button>
           </div>
        </CardContent>
      </Card>

      {/* Station Info */}
      {station && (
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
                     dataAvailability.hasRecentData ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                   }`}>
                     {dataAvailability.hasRecentData ? 'Recent data available' : 'Limited recent data'}
                   </span>
                   {dataAvailability.lastRecordDate && (
                     <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                       Latest: {new Date(dataAvailability.lastRecordDate).toLocaleDateString()}
                     </span>
                   )}
                   {dataAvailability.dataLatency !== null && (
                     <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                       {dataAvailability.dataLatency} days behind
                     </span>
                   )}
                 </div>
               )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°W</p>
                <p>{station.province}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}°C`, 'Temperature']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  {granularity === 'daily' && weatherData[0]?.maxTemperature !== undefined && (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="maxTemperature" 
                        stroke="#dc2626" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Max Temp (°C)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minTemperature" 
                        stroke="#2563eb" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Min Temp (°C)"
                      />
                    </>
                  )}
                </LineChart>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}mm`, 'Precipitation']}
                  />
                  <Legend />
                  <Bar dataKey="precipitation" fill="#3b82f6" name="Total (mm)" />
                  {granularity === 'daily' && (
                    <>
                      <Bar dataKey="rain" fill="#06b6d4" name="Rain (mm)" />
                      <Bar dataKey="snow" fill="#e5e7eb" name="Snow (mm)" />
                    </>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}km/h`, 'Wind Speed']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="windSpeed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Wind Speed (km/h)"
                  />
                </LineChart>
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value}cm`, 'Snow Depth']}
                    />
                    <Legend />
                    <Bar dataKey="snowOnGround" fill="#06b6d4" name="Snow Depth (cm)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Comparative Analysis Charts */}
      {weatherData.length > 0 && aggregatedData.length > 0 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Comparative Analysis - {comparisonPeriod.charAt(0).toUpperCase() + comparisonPeriod.slice(1)} Comparison
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Data aggregated by {comparisonPeriod} periods for trend analysis
            </p>
          </div>

          {aggregatedData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    Temperature Trends by {comparisonPeriod.charAt(0).toUpperCase() + comparisonPeriod.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="periodLabel"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value?.toFixed(1)}°C`, 
                          name
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averageTemperature" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Average Temperature"
                      />
                      {comparisonPeriod !== 'daily' && (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey="maxTemperature" 
                            stroke="#f97316" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name="Max Temperature"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="minTemperature" 
                            stroke="#3b82f6" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name="Min Temperature"
                          />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Precipitation Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    Precipitation by {comparisonPeriod.charAt(0).toUpperCase() + comparisonPeriod.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="periodLabel"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value?.toFixed(1)}mm`, 'Total Precipitation']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="totalPrecipitation" 
                        fill="#3b82f6" 
                        name={comparisonPeriod === 'daily' ? 'Daily Precipitation' : 'Total Precipitation'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Wind Speed Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    Average Wind Speed by {comparisonPeriod.charAt(0).toUpperCase() + comparisonPeriod.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="periodLabel"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value?.toFixed(1)}km/h`, 'Average Wind Speed']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averageWindSpeed" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Average Wind Speed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Data Quality Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Periods:</span>
                        <span className="ml-2">{aggregatedData.length}</span>
                      </div>
                      <div>
                        <span className="font-medium">Comparison Type:</span>
                        <span className="ml-2 capitalize">{comparisonPeriod}</span>
                      </div>
                      <div>
                        <span className="font-medium">Date Range:</span>
                        <span className="ml-2">{startDate} to {endDate}</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Records:</span>
                        <span className="ml-2">{weatherData.length}</span>
                      </div>
                    </div>
                    
                    {aggregatedData.length > 0 && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <h5 className="font-medium mb-2">Period Summary:</h5>
                        <div className="text-sm space-y-1">
                          <div>Highest Average Temperature: {Math.max(...aggregatedData.map(d => d.averageTemperature || -Infinity)).toFixed(1)}°C</div>
                          <div>Lowest Average Temperature: {Math.min(...aggregatedData.map(d => d.averageTemperature || Infinity)).toFixed(1)}°C</div>
                          <div>Total Precipitation: {aggregatedData.reduce((sum, d) => sum + (d.totalPrecipitation || 0), 0).toFixed(1)}mm</div>
                          <div>Average Wind Speed: {(aggregatedData.reduce((sum, d) => sum + (d.averageWindSpeed || 0), 0) / aggregatedData.length).toFixed(1)}km/h</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      {weatherData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weather Data Summary
            </CardTitle>
            <CardDescription>
              Historical weather observations (quality-filtered data only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Temperature</TableHead>
                    {granularity === 'daily' && (
                      <>
                        <TableHead>Max Temp</TableHead>
                        <TableHead>Min Temp</TableHead>
                      </>
                    )}
                    <TableHead>Precipitation</TableHead>
                    {granularity === 'daily' && (
                      <>
                        <TableHead>Rain</TableHead>
                        <TableHead>Snow</TableHead>
                        <TableHead>Snow on Ground</TableHead>
                      </>
                    )}
                    <TableHead>Wind Speed</TableHead>
                    <TableHead>Wind Direction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weatherData.slice(0, 50).map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(data.date).toLocaleDateString()}
                        {granularity === 'hourly' && ` ${new Date(data.date).toLocaleTimeString()}`}
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
              {weatherData.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 50 of {weatherData.length} records
                </p>
              )}
            </div>
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
    </div>
  );
};