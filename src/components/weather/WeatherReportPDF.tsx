import React, { forwardRef } from 'react';
import { WeatherData, WeatherStatistics, WeatherStation } from '@/lib/weatherAPI';
import { 
  SupportedLanguage, 
  getTranslations, 
  formatDateForLanguage, 
  formatMonthForLanguage,
  formatShortDateForLanguage 
} from '@/lib/weatherTranslations';

interface WeatherReportPDFProps {
  station: WeatherStation;
  weatherData: WeatherData[];
  statistics: WeatherStatistics;
  startDate: string;
  endDate: string;
  locationName: string;
  language?: SupportedLanguage;
}

const ROWS_PER_PAGE = 35;

// Get language-specific font family for proper Unicode rendering
const getFontFamily = (language: SupportedLanguage): string => {
  switch (language) {
    case 'zh':
      return '"Noto Sans SC", "Microsoft YaHei", "SimHei", sans-serif';
    case 'ar':
      return '"Noto Sans Arabic", "Arial", sans-serif';
    case 'hi':
      return '"Noto Sans Devanagari", "Arial", sans-serif';
    case 'ru':
      return '"Noto Sans", "Arial", sans-serif';
    default:
      return '"Noto Sans", Arial, sans-serif';
  }
};

export const WeatherReportPDF = forwardRef<HTMLDivElement, WeatherReportPDFProps>(
  ({ station, weatherData, statistics, startDate, endDate, locationName, language = 'en' }, ref) => {
    const t = getTranslations(language);
    const isRTL = language === 'ar';
    
    const formatTemp = (temp: number | null) => temp !== null ? `${temp.toFixed(1)}${t.celsius}` : '—';
    const formatPrecip = (precip: number | null) => precip !== null ? `${precip.toFixed(1)}${t.mm}` : '—';
    const formatWind = (speed: number | null) => speed !== null ? `${speed.toFixed(1)}${t.kmh}` : '—';

    // Get monthly breakdown
    const getMonthlyBreakdown = () => {
      const monthlyData: Record<string, { 
        avgTemp: number | null; 
        totalPrecip: number;
        maxWind: number | null;
        count: number;
        tempSum: number;
      }> = {};
      
      weatherData.forEach(day => {
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { avgTemp: null, totalPrecip: 0, maxWind: null, count: 0, tempSum: 0 };
        }
        
        if (day.temperature !== null) {
          monthlyData[monthKey].tempSum += day.temperature;
          monthlyData[monthKey].count++;
        }
        if (day.precipitation !== null) {
          monthlyData[monthKey].totalPrecip += day.precipitation;
        }
        if (day.windSpeed !== null) {
          if (monthlyData[monthKey].maxWind === null || day.windSpeed > monthlyData[monthKey].maxWind) {
            monthlyData[monthKey].maxWind = day.windSpeed;
          }
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        avgTemp: data.count > 0 ? data.tempSum / data.count : null,
        totalPrecip: data.totalPrecip,
        maxWind: data.maxWind,
      }));
    };

    const monthlyBreakdown = getMonthlyBreakdown();
    
    // Split weather data into pages
    const dataPages: WeatherData[][] = [];
    for (let i = 0; i < weatherData.length; i += ROWS_PER_PAGE) {
      dataPages.push(weatherData.slice(i, i + ROWS_PER_PAGE));
    }
    
    const totalPages = 1 + dataPages.length; // Summary page + data pages

    return (
      <div 
        ref={ref} 
        className="bg-white text-black"
        style={{ 
          fontFamily: getFontFamily(language), 
          fontSize: '10px',
          direction: isRTL ? 'rtl' : 'ltr',
          unicodeBidi: isRTL ? 'bidi-override' : 'normal',
        }}
      >
        {/* PAGE 1: Executive Summary */}
        <div className="p-6" style={{ minHeight: '277mm', maxWidth: '210mm' }}>
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-blue-800">{t.reportTitle}</h1>
                <p className="text-gray-600 mt-1">{t.reportSubtitle}</p>
              </div>
              <div className={`text-xs text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
                <p>{t.generated}: {formatDateForLanguage(new Date().toISOString().split('T')[0], language)}</p>
                <p className="mt-1">{t.platform}</p>
              </div>
            </div>
          </div>

          {/* Location & Period */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-blue-800 mb-1">{t.location}</h3>
                <p className="font-semibold text-lg">{locationName || t.customLocation}</p>
                <p className="text-gray-600 text-xs">{station.latitude.toFixed(4)}°N, {Math.abs(station.longitude).toFixed(4)}°W</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 mb-1">{t.analysisPeriod}</h3>
                <p className="font-semibold">{formatDateForLanguage(startDate, language)}</p>
                <p className="font-semibold">{formatDateForLanguage(endDate, language)}</p>
                <p className="text-gray-600 text-xs">{statistics.dataPoints} {t.observations}</p>
              </div>
            </div>
          </div>

          {/* Weather Station Info */}
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <h3 className="font-bold text-gray-700 mb-2">{t.weatherStation}</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500">{t.stationName}:</span>
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} font-semibold`}>{station.name}</span>
              </div>
              <div>
                <span className="text-gray-500">{t.stationId}:</span>
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} font-semibold`}>{station.stationId}</span>
              </div>
              <div>
                <span className="text-gray-500">{t.elevation}:</span>
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} font-semibold`}>{station.elevation}{t.meters}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
              {t.executiveSummary}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Temperature */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                <h4 className="font-bold text-red-700 mb-2 text-sm flex items-center gap-1">
                  🌡️ {t.temperature}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.average}:</span>
                    <span className="font-bold text-lg">{formatTemp(statistics.temperature.average)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.maximum}:</span>
                    <span className="font-semibold text-red-600">{formatTemp(statistics.temperature.max)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.minimum}:</span>
                    <span className="font-semibold text-blue-600">{formatTemp(statistics.temperature.min)}</span>
                  </div>
                </div>
              </div>

              {/* Precipitation */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <h4 className="font-bold text-blue-700 mb-2 text-sm flex items-center gap-1">
                  🌧️ {t.precipitation}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.total}:</span>
                    <span className="font-bold text-lg">{statistics.precipitation.total.toFixed(1)}{t.mm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.dailyAvg}:</span>
                    <span className="font-semibold">{statistics.precipitation.average.toFixed(1)}{t.mm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.daysWithPrecip}:</span>
                    <span className="font-semibold text-blue-600">{statistics.precipitation.daysWithPrecip}</span>
                  </div>
                </div>
              </div>

              {/* Wind */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <h4 className="font-bold text-green-700 mb-2 text-sm flex items-center gap-1">
                  💨 {t.wind}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.average}:</span>
                    <span className="font-bold text-lg">{formatWind(statistics.wind.average)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.maxGust}:</span>
                    <span className="font-semibold text-green-600">{formatWind(statistics.wind.max)}</span>
                  </div>
                  {statistics.wind.maxDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t.date}:</span>
                      <span className="font-semibold text-xs">
                        {formatShortDateForLanguage(statistics.wind.maxDate, language)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          {monthlyBreakdown.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-800 mb-3 border-b-2 border-blue-200 pb-1">
                {t.monthlyBreakdown}
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    <th className={`${isRTL ? 'text-right' : 'text-left'} p-2 font-bold border border-blue-200`}>{t.month}</th>
                    <th className={`${isRTL ? 'text-left' : 'text-right'} p-2 font-bold border border-blue-200`}>{t.avgTemp}</th>
                    <th className={`${isRTL ? 'text-left' : 'text-right'} p-2 font-bold border border-blue-200`}>{t.totalPrecip}</th>
                    <th className={`${isRTL ? 'text-left' : 'text-right'} p-2 font-bold border border-blue-200`}>{t.maxWind}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map((row, idx) => (
                    <tr key={row.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={`p-2 border border-gray-200 font-medium`}>
                        {formatMonthForLanguage(row.month, language)}
                      </td>
                      <td className={`${isRTL ? 'text-left' : 'text-right'} p-2 border border-gray-200`}>
                        {formatTemp(row.avgTemp)}
                      </td>
                      <td className={`${isRTL ? 'text-left' : 'text-right'} p-2 border border-gray-200`}>
                        {row.totalPrecip.toFixed(1)}{t.mm}
                      </td>
                      <td className={`${isRTL ? 'text-left' : 'text-right'} p-2 border border-gray-200`}>
                        {formatWind(row.maxWind)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer for page 1 */}
          <div className="border-t-2 border-gray-300 pt-3 mt-4 text-xs text-gray-500">
            <div className="flex justify-between">
              <div>
                <p>{t.dataSource}</p>
                <p>{t.weatherStation}: {station.name} (ID: {station.stationId})</p>
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <p>{t.generatedBy}</p>
                <p>{t.page} 1 {t.of} {totalPages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DATA PAGES: Complete Weather Data */}
        {dataPages.map((pageData, pageIndex) => (
          <div 
            key={pageIndex} 
            className="p-6"
            style={{ 
              pageBreakBefore: 'always',
              minHeight: '277mm',
              maxWidth: '210mm',
            }}
          >
            {/* Page Header */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-blue-600">
              <div>
                <h2 className="text-lg font-bold text-blue-800">{t.completeDataTable}</h2>
                <p className="text-xs text-gray-500">
                  {locationName} | {formatDateForLanguage(startDate, language)} — {formatDateForLanguage(endDate, language)}
                </p>
              </div>
              <div className={`text-xs text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
                <p>{t.platform}</p>
              </div>
            </div>

            {/* Data Table */}
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className={`${isRTL ? 'text-right' : 'text-left'} p-1.5 font-bold border border-blue-200`}>{t.date}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.temp}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.max}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.min}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.precip}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.rain}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.snow}</th>
                  <th className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 font-bold border border-blue-200`}>{t.windSpeed}</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((day, idx) => (
                  <tr key={day.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-1.5 border border-gray-200 font-medium">
                      {formatShortDateForLanguage(day.date, language)}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200`}>
                      {day.temperature?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200 text-red-600`}>
                      {day.maxTemperature?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200 text-blue-600`}>
                      {day.minTemperature?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200`}>
                      {day.precipitation?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200`}>
                      {day.rain?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200`}>
                      {day.snow?.toFixed(1) ?? '—'}
                    </td>
                    <td className={`${isRTL ? 'text-left' : 'text-right'} p-1.5 border border-gray-200`}>
                      {day.windSpeed?.toFixed(1) ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Page Footer */}
            <div className="border-t-2 border-gray-300 pt-3 mt-4 text-xs text-gray-500">
              <div className="flex justify-between">
                <div>
                  <p>{t.dataSource}</p>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <p>{t.page} {pageIndex + 2} {t.of} {totalPages}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

WeatherReportPDF.displayName = 'WeatherReportPDF';

export default WeatherReportPDF;
