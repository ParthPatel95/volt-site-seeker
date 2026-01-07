import React, { forwardRef } from 'react';
import { WeatherData, WeatherStatistics, WeatherStation } from '@/lib/weatherAPI';

interface WeatherReportPDFProps {
  station: WeatherStation;
  weatherData: WeatherData[];
  statistics: WeatherStatistics;
  startDate: string;
  endDate: string;
  locationName: string;
}

export const WeatherReportPDF = forwardRef<HTMLDivElement, WeatherReportPDFProps>(
  ({ station, weatherData, statistics, startDate, endDate, locationName }, ref) => {
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formatTemp = (temp: number | null) => temp !== null ? `${temp.toFixed(1)}°C` : '—';
    const formatPrecip = (precip: number | null) => precip !== null ? `${precip.toFixed(1)}mm` : '—';
    const formatWind = (speed: number | null) => speed !== null ? `${speed.toFixed(1)}km/h` : '—';

    // Get monthly breakdown for HDD/CDD
    const getMonthlyBreakdown = () => {
      const monthlyData: Record<string, { hdd: number; cdd: number; avgTemp: number | null; count: number }> = {};
      
      weatherData.forEach(day => {
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { hdd: 0, cdd: 0, avgTemp: 0, count: 0 };
        }
        
        if (day.temperature !== null) {
          const hdd = day.temperature < 18 ? 18 - day.temperature : 0;
          const cdd = day.temperature > 18 ? day.temperature - 18 : 0;
          monthlyData[monthKey].hdd += hdd;
          monthlyData[monthKey].cdd += cdd;
          monthlyData[monthKey].avgTemp = (monthlyData[monthKey].avgTemp || 0) + day.temperature;
          monthlyData[monthKey].count++;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        monthName: new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        hdd: data.hdd.toFixed(1),
        cdd: data.cdd.toFixed(1),
        avgTemp: data.count > 0 ? ((data.avgTemp || 0) / data.count).toFixed(1) : '—'
      }));
    };

    const monthlyBreakdown = getMonthlyBreakdown();

    return (
      <div 
        ref={ref} 
        className="bg-white text-black p-8 max-w-[210mm] mx-auto"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px' }}
      >
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Weather Analysis Report</h1>
              <p className="text-gray-600 mt-1">Historical Weather Data & Energy Impact Analysis</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="mt-1">WattByte Platform</p>
            </div>
          </div>
        </div>

        {/* Location & Period */}
        <div className="bg-gray-50 rounded p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="font-medium">{locationName || 'Custom Location'}</p>
              <p className="text-gray-600 text-xs">{station.latitude.toFixed(4)}°N, {Math.abs(station.longitude).toFixed(4)}°W</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Analysis Period</h3>
              <p className="font-medium">{formatDate(startDate)} — {formatDate(endDate)}</p>
              <p className="text-gray-600 text-xs">{statistics.dataPoints} observations</p>
            </div>
          </div>
        </div>

        {/* Weather Station Info */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Weather Station</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Station Name:</span>
              <span className="ml-2 font-medium">{station.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Station ID:</span>
              <span className="ml-2 font-medium">{station.stationId}</span>
            </div>
            <div>
              <span className="text-gray-500">Elevation:</span>
              <span className="ml-2 font-medium">{station.elevation}m</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
            Executive Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Temperature */}
            <div className="bg-red-50 rounded p-3">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-1">
                🌡️ Temperature
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{formatTemp(statistics.temperature.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-medium text-red-600">{formatTemp(statistics.temperature.max)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum:</span>
                  <span className="font-medium text-blue-600">{formatTemp(statistics.temperature.min)}</span>
                </div>
              </div>
            </div>

            {/* Precipitation */}
            <div className="bg-blue-50 rounded p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
                🌧️ Precipitation
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{statistics.precipitation.total.toFixed(1)}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Avg:</span>
                  <span className="font-medium">{statistics.precipitation.average.toFixed(1)}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days w/ Precip:</span>
                  <span className="font-medium">{statistics.precipitation.daysWithPrecip}</span>
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="bg-green-50 rounded p-3">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                💨 Wind
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{formatWind(statistics.wind.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-medium">{formatWind(statistics.wind.max)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Date:</span>
                  <span className="font-medium text-xs">
                    {statistics.wind.maxDate ? new Date(statistics.wind.maxDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Impact Metrics */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
            Energy Impact Metrics
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-orange-50 rounded p-4">
              <h4 className="font-semibold text-orange-800 mb-1">Heating Degree Days (HDD)</h4>
              <p className="text-2xl font-bold text-orange-600">{statistics.heatingDegreeDays.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">
                Base temperature: 18°C (65°F)<br />
                Higher HDD = more heating energy required
              </p>
            </div>
            <div className="bg-cyan-50 rounded p-4">
              <h4 className="font-semibold text-cyan-800 mb-1">Cooling Degree Days (CDD)</h4>
              <p className="text-2xl font-bold text-cyan-600">{statistics.coolingDegreeDays.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">
                Base temperature: 18°C (65°F)<br />
                Higher CDD = more cooling energy required
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {monthlyBreakdown.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
              Monthly Breakdown
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Avg Temp</th>
                  <th className="text-right p-2 font-semibold">HDD</th>
                  <th className="text-right p-2 font-semibold">CDD</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map((row, idx) => (
                  <tr key={row.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2">{row.monthName}</td>
                    <td className="text-right p-2">{row.avgTemp}°C</td>
                    <td className="text-right p-2">{row.hdd}</td>
                    <td className="text-right p-2">{row.cdd}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-semibold">
                  <td className="p-2">Total</td>
                  <td className="text-right p-2">—</td>
                  <td className="text-right p-2">{statistics.heatingDegreeDays.toFixed(1)}</td>
                  <td className="text-right p-2">{statistics.coolingDegreeDays.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Data Table Preview */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
            Weather Data Sample
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-1.5 font-semibold">Date</th>
                <th className="text-right p-1.5 font-semibold">Temp (°C)</th>
                <th className="text-right p-1.5 font-semibold">Max</th>
                <th className="text-right p-1.5 font-semibold">Min</th>
                <th className="text-right p-1.5 font-semibold">Precip (mm)</th>
                <th className="text-right p-1.5 font-semibold">Wind (km/h)</th>
              </tr>
            </thead>
            <tbody>
              {weatherData.slice(0, 15).map((day, idx) => (
                <tr key={day.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-1.5">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="text-right p-1.5">{day.temperature?.toFixed(1) ?? '—'}</td>
                  <td className="text-right p-1.5">{day.maxTemperature?.toFixed(1) ?? '—'}</td>
                  <td className="text-right p-1.5">{day.minTemperature?.toFixed(1) ?? '—'}</td>
                  <td className="text-right p-1.5">{day.precipitation?.toFixed(1) ?? '—'}</td>
                  <td className="text-right p-1.5">{day.windSpeed?.toFixed(1) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {weatherData.length > 15 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing first 15 of {weatherData.length} records. Full dataset available in CSV export.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-6 text-xs text-gray-500">
          <div className="flex justify-between">
            <div>
              <p>Data Source: Environment and Climate Change Canada</p>
              <p>Weather Station: {station.name} (ID: {station.stationId})</p>
            </div>
            <div className="text-right">
              <p>Report generated by WattByte Platform</p>
              <p>© {new Date().getFullYear()} WattByte</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WeatherReportPDF.displayName = 'WeatherReportPDF';

export default WeatherReportPDF;
