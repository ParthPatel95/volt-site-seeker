import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Monitor, Smartphone, Globe, Chrome, MapPin } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GeographicDeviceAnalyticsProps {
  dateRange?: DateRange;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, string>();

interface LocationInfo {
  city: string;
  country: string;
}

async function getLocationFromCoordinates(coordinates: string): Promise<LocationInfo> {
  if (!coordinates || coordinates === 'Unknown') {
    return { city: 'Unknown', country: 'Unknown' };
  }
  
  // Check cache first
  if (geocodeCache.has(coordinates)) {
    return JSON.parse(geocodeCache.get(coordinates)!);
  }
  
  // Parse coordinates (format: "lat,lon")
  const [lat, lon] = coordinates.split(',').map(s => s.trim());
  if (!lat || !lon) {
    return { city: coordinates, country: 'Unknown' };
  }
  
  try {
    // Use Nominatim API for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        headers: {
          'User-Agent': 'SecureShareAnalytics/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.county ||
                 data.address?.state ||
                 'Unknown Location';
    
    const country = data.address?.country || 'Unknown';
    
    const locationInfo = { city, country };
    
    // Cache the result
    geocodeCache.set(coordinates, JSON.stringify(locationInfo));
    return locationInfo;
  } catch (error) {
    console.error('Error geocoding coordinates:', error);
    return { city: coordinates, country: 'Unknown' };
  }
}

export function GeographicDeviceAnalytics({ dateRange }: GeographicDeviceAnalyticsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['geographic-device-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select('device_type, viewer_location, engagement_score, browser, total_time_seconds');

      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;
      if (error) throw error;

      // Device breakdown
      const deviceCounts: Record<string, { count: number; engagement: number; time: number }> = {};
      activity?.forEach(a => {
        const device = a.device_type || 'Unknown';
        if (!deviceCounts[device]) {
          deviceCounts[device] = { count: 0, engagement: 0, time: 0 };
        }
        deviceCounts[device].count += 1;
        deviceCounts[device].engagement += a.engagement_score || 0;
        deviceCounts[device].time += a.total_time_seconds || 0;
      });

      const deviceData = Object.entries(deviceCounts).map(([name, stats]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: stats.count,
        avgEngagement: stats.count > 0 ? Math.round(stats.engagement / stats.count) : 0,
        avgTime: stats.count > 0 ? Math.round(stats.time / stats.count) : 0
      }));

      // Location breakdown - convert coordinates to city and country
      const locationCounts: Record<string, number> = {};
      
      // Get unique locations and their counts
      activity?.forEach(a => {
        const loc = a.viewer_location || 'Unknown';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });

      // Convert coordinates to city and country
      const locationEntries = await Promise.all(
        Object.entries(locationCounts).map(async ([coordinates, count]) => {
          const locationInfo = await getLocationFromCoordinates(coordinates);
          return { 
            city: locationInfo.city, 
            country: locationInfo.country, 
            count 
          };
        })
      );

      // Merge duplicate city/country combinations
      const mergedLocations: Record<string, { country: string; count: number }> = {};
      locationEntries.forEach(({ city, country, count }) => {
        const key = `${city}, ${country}`;
        if (!mergedLocations[key]) {
          mergedLocations[key] = { country, count: 0 };
        }
        mergedLocations[key].count += count;
      });

      const locationData = Object.entries(mergedLocations)
        .map(([location, data]) => {
          const [city] = location.split(', ');
          return { 
            city, 
            country: data.country, 
            count: data.count 
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Browser breakdown
      const browserCounts: Record<string, number> = {};
      activity?.forEach(a => {
        const browser = a.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const browserData = Object.entries(browserCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Device engagement comparison
      const deviceEngagementData = Object.entries(deviceCounts).map(([name, stats]) => ({
        device: name.charAt(0).toUpperCase() + name.slice(1),
        engagement: stats.count > 0 ? Math.round(stats.engagement / stats.count) : 0,
        timeMinutes: stats.count > 0 ? Math.round(stats.time / stats.count / 60) : 0
      }));

      return {
        deviceData,
        locationData,
        browserData,
        deviceEngagementData
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card className="border-watt-primary/20 hover:border-watt-primary/40 transition-all shadow-lg hover:shadow-watt-glow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-watt-primary" />
            <CardTitle className="text-base sm:text-lg">Device Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.deviceData && data.deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={data.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No device data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-watt-secondary/20 hover:border-watt-secondary/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-watt-secondary" />
            <CardTitle className="text-base sm:text-lg">Device Engagement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.deviceEngagementData && data.deviceEngagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={data.deviceEngagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="device" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="engagement" fill="hsl(var(--watt-primary))" name="Engagement" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="timeMinutes" fill="hsl(var(--watt-secondary))" name="Time (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No engagement data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-watt-accent/20 hover:border-watt-accent/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-watt-accent" />
            <CardTitle className="text-base sm:text-lg">Top Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.locationData && data.locationData.length > 0 ? (
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.locationData.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{location.city}</TableCell>
                      <TableCell className="text-muted-foreground">{location.country}</TableCell>
                      <TableCell className="text-right font-semibold text-watt-accent">
                        {location.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No location data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-watt-success/20 hover:border-watt-success/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Chrome className="h-5 w-5 text-watt-success" />
            <CardTitle className="text-base sm:text-lg">Browser Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.browserData && data.browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={data.browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No browser data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
