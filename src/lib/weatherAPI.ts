/**
 * Weather API Integration for Environment and Climate Change Canada
 * 
 * This module provides functions to interact with Canada's GeoMet OGC-API
 * for retrieving historical weather data.
 * 
 * API Documentation: https://api.weather.gc.ca/
 * Collections: https://api.weather.gc.ca/collections
 */

const BASE_URL = 'https://api.weather.gc.ca';

export interface WeatherStation {
  stationId: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation: number;
  distance?: number; // Distance from query point in km
  dataStartDate?: string; // First available date for data
  dataEndDate?: string; // Last available date for data
}

export interface WeatherData {
  date: string;
  temperature: number | null;
  maxTemperature?: number | null; // Daily only
  minTemperature?: number | null; // Daily only
  precipitation: number | null;
  rain?: number | null; // Daily only
  snow?: number | null; // Daily only
  snowOnGround?: number | null; // Daily only
  windSpeed: number | null;
  windDirection: number | null; // In degrees (0-360)
  windGustSpeed?: number | null; // Daily only
  windGustDirection?: number | null; // Daily only
  humidity?: number | null; // Hourly only
  dewPoint?: number | null; // Hourly only
  pressure?: number | null; // Hourly only
  visibility?: number | null; // Hourly only
}

export interface WeatherStatistics {
  temperature: {
    average: number | null;
    min: number | null;
    minDate: string | null;
    max: number | null;
    maxDate: string | null;
  };
  precipitation: {
    total: number;
    average: number;
    daysWithPrecip: number;
  };
  wind: {
    average: number | null;
    max: number | null;
    maxDate: string | null;
  };
  heatingDegreeDays: number;
  coolingDegreeDays: number;
  dataPoints: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ClimateNormals {
  stationId: string;
  stationName: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation: number;
  // Temperature normals (°C)
  januaryMeanTemp?: number | null;
  februaryMeanTemp?: number | null;
  marchMeanTemp?: number | null;
  aprilMeanTemp?: number | null;
  mayMeanTemp?: number | null;
  juneMeanTemp?: number | null;
  julyMeanTemp?: number | null;
  augustMeanTemp?: number | null;
  septemberMeanTemp?: number | null;
  octoberMeanTemp?: number | null;
  novemberMeanTemp?: number | null;
  decemberMeanTemp?: number | null;
  // Precipitation normals (mm)
  totalPrecipitation?: number | null;
  totalRainfall?: number | null;
  totalSnowfall?: number | null;
  // Extremes
  extremeMaxTemp?: number | null;
  extremeMinTemp?: number | null;
}

export interface MonthlyWeatherSummary {
  stationId: string;
  year: number;
  month: number;
  meanTemp?: number | null;
  maxTemp?: number | null;
  minTemp?: number | null;
  totalPrecipitation?: number | null;
  totalRainfall?: number | null;
  totalSnowfall?: number | null;
  snowOnGround?: number | null;
  daysWithPrecip?: number | null;
  extremeMaxTemp?: number | null;
  extremeMinTemp?: number | null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get the most recent date with available data (typically 1-2 days behind current date)
 * 
 * @returns string Date in YYYY-MM-DD format
 */
export function getMostRecentDataDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Yesterday - most weather data is 1 day behind
  return date.toISOString().split('T')[0];
}

/**
 * Get suggested date range for accessing current data
 * 
 * @param daysBack Number of days to go back from most recent data
 * @returns Object with startDate and endDate
 */
export function getSuggestedDateRange(daysBack: number = 30): { startDate: string; endDate: string } {
  const endDate = getMostRecentDataDate();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - daysBack);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate
  };
}

/**
 * Find the nearest weather station to given coordinates
 * 
 * @param latitude Target latitude
 * @param longitude Target longitude
 * @param startDate Start date for data availability check (optional)
 * @param endDate End date for data availability check (optional)
 * @param radiusKm Search radius in kilometers (default: 100)
 * @returns Promise<WeatherStation> Nearest weather station
 */
export async function fetchNearestWeatherStation(
  latitude: number, 
  longitude: number, 
  startDate?: string,
  endDate?: string,
  radiusKm: number = 100
): Promise<WeatherStation> {
  try {
    // Create bounding box around the coordinates
    const deltaLat = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
    const deltaLon = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
    
    const bbox = [
      longitude - deltaLon, // xmin
      latitude - deltaLat,  // ymin
      longitude + deltaLon, // xmax
      latitude + deltaLat   // ymax
    ].join(',');

    const url = `${BASE_URL}/collections/climate-stations/items?bbox=${encodeURIComponent(bbox)}&limit=50`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather stations API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No weather stations found in the specified area');
    }
    
    // Find the nearest station with data in the requested date range
    let nearestStation: WeatherStation | null = null;
    let minDistance = Infinity;
    
    for (const feature of data.features) {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      // Skip stations without required data
      if (!props.STN_ID || !props.STATION_NAME || !coords) continue;
      
      // Check if station has daily data available
      if (!props.DLY_FIRST_DATE || !props.DLY_LAST_DATE) continue;
      
      // If date range is specified, check if station has data in that range
      if (startDate && endDate) {
        const stationStart = new Date(props.DLY_FIRST_DATE);
        const stationEnd = new Date(props.DLY_LAST_DATE);
        const requestStart = new Date(startDate);
        const requestEnd = new Date(endDate);
        
        // Skip stations that don't overlap with requested date range
        if (stationEnd < requestStart || stationStart > requestEnd) continue;
      }
      
      const stationLat = coords[1];
      const stationLon = coords[0];
      const distance = calculateDistance(latitude, longitude, stationLat, stationLon);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = {
          stationId: props.STN_ID,
          name: props.STATION_NAME,
          province: props.PROVINCE_CODE || 'Unknown',
          latitude: stationLat,
          longitude: stationLon,
          elevation: props.ELEVATION || 0,
          distance: distance,
          dataStartDate: props.DLY_FIRST_DATE,
          dataEndDate: props.DLY_LAST_DATE
        };
      }
    }
    
    if (!nearestStation) {
      throw new Error(`No weather stations found with data coverage in the specified area. Try expanding your search radius or adjusting your date range.`);
    }
    
    return nearestStation;
  } catch (error) {
    console.error('Error fetching weather stations:', error);
    throw error;
  }
}

/**
 * Fetch weather data for a specific station and date range
 * Automatically handles data availability and provides helpful error messages
 * 
 * @param stationId Weather station ID
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param granularity 'daily' or 'hourly'
 * @returns Promise<WeatherData[]> Array of weather observations
 */
export async function fetchWeatherData(
  stationId: string,
  startDate: string,
  endDate: string,
  granularity: 'daily' | 'hourly' = 'daily'
): Promise<WeatherData[]> {
  try {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const mostRecent = new Date(getMostRecentDataDate());
    
    if (end > mostRecent) {
      console.warn(`End date ${endDate} is beyond most recent available data. Using ${getMostRecentDataDate()} instead.`);
      endDate = getMostRecentDataDate();
    }
    
    if (start > end) {
      throw new Error('Start date must be before end date');
    }
    // Format datetime for API (ISO 8601 interval)
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;
    const datetimeInterval = `${encodeURIComponent(startDateTime)}/${encodeURIComponent(endDateTime)}`;
    
    // Choose collection based on granularity
    const collection = granularity === 'daily' ? 'climate-daily' : 'climate-hourly';
    
    const url = `${BASE_URL}/collections/${collection}/items?datetime=${datetimeInterval}&STN_ID=${stationId}&sortby=LOCAL_DATE&limit=10000`;
    
    console.log(`Fetching ${granularity} weather data for station ${stationId} from ${startDate} to ${endDate}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No ${granularity} data available for station ${stationId} in the requested date range. Try adjusting your date range or granularity.`);
      }
      throw new Error(`Weather data API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    // Process and filter weather data
    const weatherData: WeatherData[] = [];
    
    for (const feature of data.features) {
      const props = feature.properties;
      
      if (granularity === 'daily') {
        // Daily data processing
        const record: WeatherData = {
          date: props.LOCAL_DATE,
          temperature: isValidValue(props.MEAN_TEMPERATURE, props.MEAN_TEMPERATURE_FLAG) 
            ? props.MEAN_TEMPERATURE : null,
          maxTemperature: isValidValue(props.MAX_TEMPERATURE, props.MAX_TEMPERATURE_FLAG) 
            ? props.MAX_TEMPERATURE : null,
          minTemperature: isValidValue(props.MIN_TEMPERATURE, props.MIN_TEMPERATURE_FLAG) 
            ? props.MIN_TEMPERATURE : null,
          precipitation: isValidValue(props.TOTAL_PRECIPITATION, props.TOTAL_PRECIPITATION_FLAG) 
            ? props.TOTAL_PRECIPITATION : null,
          rain: isValidValue(props.TOTAL_RAIN, props.TOTAL_RAIN_FLAG) 
            ? props.TOTAL_RAIN : null,
          snow: isValidValue(props.TOTAL_SNOW, props.TOTAL_SNOW_FLAG) 
            ? props.TOTAL_SNOW : null,
          snowOnGround: isValidValue(props.SNOW_ON_GROUND, props.SNOW_ON_GROUND_FLAG) 
            ? props.SNOW_ON_GROUND : null,
          windSpeed: isValidValue(props.SPEED_MAX_GUST, props.SPEED_MAX_GUST_FLAG) 
            ? props.SPEED_MAX_GUST : null,
          windDirection: isValidValue(props.DIRECTION_MAX_GUST, props.DIRECTION_MAX_GUST_FLAG) 
            ? props.DIRECTION_MAX_GUST * 10 : null, // Convert from tens of degrees
          windGustSpeed: isValidValue(props.SPEED_MAX_GUST, props.SPEED_MAX_GUST_FLAG) 
            ? props.SPEED_MAX_GUST : null,
          windGustDirection: isValidValue(props.DIRECTION_MAX_GUST, props.DIRECTION_MAX_GUST_FLAG) 
            ? props.DIRECTION_MAX_GUST * 10 : null
        };
        
        weatherData.push(record);
      } else {
        // Hourly data processing
        const record: WeatherData = {
          date: props.LOCAL_DATE,
          temperature: isValidValue(props.TEMP, props.TEMP_FLAG) 
            ? props.TEMP : null,
          precipitation: isValidValue(props.PRECIPITATION, props.PRECIPITATION_FLAG) 
            ? props.PRECIPITATION : null,
          windSpeed: isValidValue(props.WIND_SPEED, props.WIND_SPEED_FLAG) 
            ? props.WIND_SPEED : null,
          windDirection: isValidValue(props.WIND_DIR, props.WIND_DIR_FLAG) 
            ? props.WIND_DIR * 10 : null, // Convert from tens of degrees
          humidity: isValidValue(props.REL_HUMIDITY, props.REL_HUMIDITY_FLAG) 
            ? props.REL_HUMIDITY : null,
          dewPoint: isValidValue(props.DEW_POINT_TEMP, props.DEW_POINT_TEMP_FLAG) 
            ? props.DEW_POINT_TEMP : null,
          pressure: isValidValue(props.STN_PRESSURE, props.STN_PRESSURE_FLAG) 
            ? props.STN_PRESSURE : null,
          visibility: isValidValue(props.VISIBILITY, props.VISIBILITY_FLAG) 
            ? props.VISIBILITY : null
        };
        
        weatherData.push(record);
      }
    }
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Check if a weather value is valid based on its quality flag
 * Only use values where the flag is null (indicating valid data)
 * 
 * @param value The weather measurement value
 * @param flag The quality flag for the measurement
 * @returns boolean True if the value is valid and should be used
 */
function isValidValue(value: any, flag: any): boolean {
  return value !== null && value !== undefined && flag === null;
}

/**
 * Fetch climate normals (1981-2010 averages) for a specific station
 * 
 * @param stationId Weather station ID
 * @returns Promise<ClimateNormals | null> Climate normal data
 */
export async function fetchClimateNormals(stationId: string): Promise<ClimateNormals | null> {
  try {
    const url = `${BASE_URL}/collections/climate-normals/items?STN_ID=${stationId}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Climate normals API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const feature = data.features[0];
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    
    return {
      stationId: props.STN_ID,
      stationName: props.STATION_NAME || 'Unknown',
      province: props.PROVINCE_CODE || 'Unknown',
      latitude: coords[1],
      longitude: coords[0],
      elevation: props.ELEVATION || 0,
      // Monthly temperature normals
      januaryMeanTemp: props.JANUARY_MEAN_TEMPERATURE || null,
      februaryMeanTemp: props.FEBRUARY_MEAN_TEMPERATURE || null,
      marchMeanTemp: props.MARCH_MEAN_TEMPERATURE || null,
      aprilMeanTemp: props.APRIL_MEAN_TEMPERATURE || null,
      mayMeanTemp: props.MAY_MEAN_TEMPERATURE || null,
      juneMeanTemp: props.JUNE_MEAN_TEMPERATURE || null,
      julyMeanTemp: props.JULY_MEAN_TEMPERATURE || null,
      augustMeanTemp: props.AUGUST_MEAN_TEMPERATURE || null,
      septemberMeanTemp: props.SEPTEMBER_MEAN_TEMPERATURE || null,
      octoberMeanTemp: props.OCTOBER_MEAN_TEMPERATURE || null,
      novemberMeanTemp: props.NOVEMBER_MEAN_TEMPERATURE || null,
      decemberMeanTemp: props.DECEMBER_MEAN_TEMPERATURE || null,
      // Precipitation normals
      totalPrecipitation: props.ANNUAL_PRECIPITATION || null,
      totalRainfall: props.ANNUAL_RAINFALL || null,
      totalSnowfall: props.ANNUAL_SNOWFALL || null,
      // Temperature extremes
      extremeMaxTemp: props.EXTREME_MAXIMUM_TEMPERATURE || null,
      extremeMinTemp: props.EXTREME_MINIMUM_TEMPERATURE || null,
    };
  } catch (error) {
    console.error('Error fetching climate normals:', error);
    return null;
  }
}

/**
 * Fetch monthly weather summaries for a specific station and year
 * 
 * @param stationId Weather station ID
 * @param year Target year (YYYY)
 * @returns Promise<MonthlyWeatherSummary[]> Array of monthly summaries
 */
export async function fetchMonthlyWeatherSummary(
  stationId: string,
  year: number
): Promise<MonthlyWeatherSummary[]> {
  try {
    const startDate = `${year}-01-01 00:00:00`;
    const endDate = `${year}-12-31 23:59:59`;
    const datetimeInterval = `${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    
    const url = `${BASE_URL}/collections/climate-monthly/items?datetime=${datetimeInterval}&STN_ID=${stationId}&sortby=LOCAL_DATE&limit=12`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Monthly weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    const monthlyData: MonthlyWeatherSummary[] = [];
    
    for (const feature of data.features) {
      const props = feature.properties;
      const date = new Date(props.LOCAL_DATE);
      
      const summary: MonthlyWeatherSummary = {
        stationId: props.STN_ID,
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Convert to 1-12
        meanTemp: isValidValue(props.MEAN_TEMPERATURE, props.MEAN_TEMPERATURE_FLAG) 
          ? props.MEAN_TEMPERATURE : null,
        maxTemp: isValidValue(props.EXTREME_MAXIMUM_TEMPERATURE, props.EXTREME_MAXIMUM_TEMPERATURE_FLAG) 
          ? props.EXTREME_MAXIMUM_TEMPERATURE : null,
        minTemp: isValidValue(props.EXTREME_MINIMUM_TEMPERATURE, props.EXTREME_MINIMUM_TEMPERATURE_FLAG) 
          ? props.EXTREME_MINIMUM_TEMPERATURE : null,
        totalPrecipitation: isValidValue(props.TOTAL_PRECIPITATION, props.TOTAL_PRECIPITATION_FLAG) 
          ? props.TOTAL_PRECIPITATION : null,
        totalRainfall: isValidValue(props.TOTAL_RAINFALL, props.TOTAL_RAINFALL_FLAG) 
          ? props.TOTAL_RAINFALL : null,
        totalSnowfall: isValidValue(props.TOTAL_SNOWFALL, props.TOTAL_SNOWFALL_FLAG) 
          ? props.TOTAL_SNOWFALL : null,
        snowOnGround: isValidValue(props.LAST_SNOW_GRND, props.LAST_SNOW_GRND_FLAG) 
          ? props.LAST_SNOW_GRND : null,
        daysWithPrecip: isValidValue(props.DAYS_WITH_PRECIP, props.DAYS_WITH_PRECIP_FLAG) 
          ? props.DAYS_WITH_PRECIP : null,
        extremeMaxTemp: isValidValue(props.EXTREME_MAXIMUM_TEMPERATURE, props.EXTREME_MAXIMUM_TEMPERATURE_FLAG) 
          ? props.EXTREME_MAXIMUM_TEMPERATURE : null,
        extremeMinTemp: isValidValue(props.EXTREME_MINIMUM_TEMPERATURE, props.EXTREME_MINIMUM_TEMPERATURE_FLAG) 
          ? props.EXTREME_MINIMUM_TEMPERATURE : null,
      };
      
      monthlyData.push(summary);
    }
    
    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly weather summary:', error);
    return [];
  }
}

/**
 * Convert wind direction from degrees to compass direction
 * 
 * @param degrees Wind direction in degrees (0-360)
 * @returns string Compass direction (N, NE, E, etc.)
 */
export function degreesToCompass(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate weather statistics from an array of weather data
 * 
 * @param weatherData Array of weather observations
 * @returns Object with calculated statistics
 */
export function calculateWeatherStatistics(weatherData: WeatherData[]) {
  if (weatherData.length === 0) {
    return null;
  }

  const validTemps = weatherData
    .map(d => d.temperature)
    .filter((temp): temp is number => temp !== null);
  
  const validPrecip = weatherData
    .map(d => d.precipitation)
    .filter((precip): precip is number => precip !== null);

  return {
    temperatureStats: validTemps.length > 0 ? {
      average: validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length,
      minimum: Math.min(...validTemps),
      maximum: Math.max(...validTemps),
      dataPoints: validTemps.length
    } : null,
    precipitationStats: validPrecip.length > 0 ? {
      total: validPrecip.reduce((sum, precip) => sum + precip, 0),
      average: validPrecip.reduce((sum, precip) => sum + precip, 0) / validPrecip.length,
      maximum: Math.max(...validPrecip),
      daysWithPrecipitation: validPrecip.filter(p => p > 0).length,
      dataPoints: validPrecip.length
    } : null,
    totalObservations: weatherData.length
  };
}

/**
 * Calculate detailed weather statistics with energy-relevant metrics
 * 
 * @param weatherData Array of weather observations
 * @param baseTemp Base temperature for HDD/CDD calculation (default 18°C)
 * @returns WeatherStatistics object
 */
export function calculateDetailedWeatherStatistics(
  weatherData: WeatherData[],
  baseTemp: number = 18
): WeatherStatistics | null {
  if (weatherData.length === 0) {
    return null;
  }

  // Temperature statistics
  const tempsWithDate = weatherData
    .filter(d => d.temperature !== null)
    .map(d => ({ temp: d.temperature!, date: d.date }));
  
  let tempStats = {
    average: null as number | null,
    min: null as number | null,
    minDate: null as string | null,
    max: null as number | null,
    maxDate: null as string | null,
  };

  if (tempsWithDate.length > 0) {
    const temps = tempsWithDate.map(t => t.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    tempStats = {
      average: temps.reduce((sum, t) => sum + t, 0) / temps.length,
      min: minTemp,
      minDate: tempsWithDate.find(t => t.temp === minTemp)?.date || null,
      max: maxTemp,
      maxDate: tempsWithDate.find(t => t.temp === maxTemp)?.date || null,
    };
  }

  // Precipitation statistics
  const validPrecip = weatherData
    .map(d => d.precipitation)
    .filter((p): p is number => p !== null);

  const precipStats = {
    total: validPrecip.reduce((sum, p) => sum + p, 0),
    average: validPrecip.length > 0 
      ? validPrecip.reduce((sum, p) => sum + p, 0) / validPrecip.length 
      : 0,
    daysWithPrecip: validPrecip.filter(p => p > 0).length,
  };

  // Wind statistics
  const windsWithDate = weatherData
    .filter(d => d.windSpeed !== null)
    .map(d => ({ speed: d.windSpeed!, date: d.date }));

  let windStats = {
    average: null as number | null,
    max: null as number | null,
    maxDate: null as string | null,
  };

  if (windsWithDate.length > 0) {
    const speeds = windsWithDate.map(w => w.speed);
    const maxSpeed = Math.max(...speeds);
    
    windStats = {
      average: speeds.reduce((sum, s) => sum + s, 0) / speeds.length,
      max: maxSpeed,
      maxDate: windsWithDate.find(w => w.speed === maxSpeed)?.date || null,
    };
  }

  // Heating and Cooling Degree Days
  const hdd = calculateHeatingDegreeDays(weatherData, baseTemp);
  const cdd = calculateCoolingDegreeDays(weatherData, baseTemp);

  // Date range
  const dates = weatherData.map(d => d.date).sort();

  return {
    temperature: tempStats,
    precipitation: precipStats,
    wind: windStats,
    heatingDegreeDays: hdd,
    coolingDegreeDays: cdd,
    dataPoints: weatherData.length,
    dateRange: {
      start: dates[0],
      end: dates[dates.length - 1],
    },
  };
}

/**
 * Calculate Heating Degree Days (HDD)
 * HDD measures how cold a period was - used for estimating heating fuel demand
 * 
 * @param weatherData Array of weather observations
 * @param baseTemp Base temperature in °C (default 18°C / 65°F)
 * @returns Total heating degree days
 */
export function calculateHeatingDegreeDays(
  weatherData: WeatherData[],
  baseTemp: number = 18
): number {
  return weatherData.reduce((total, day) => {
    const temp = day.temperature;
    if (temp === null) return total;
    
    // HDD = base temp - actual temp (when actual < base)
    const hdd = temp < baseTemp ? baseTemp - temp : 0;
    return total + hdd;
  }, 0);
}

/**
 * Calculate Cooling Degree Days (CDD)
 * CDD measures how warm a period was - used for estimating cooling energy demand
 * 
 * @param weatherData Array of weather observations
 * @param baseTemp Base temperature in °C (default 18°C / 65°F)
 * @returns Total cooling degree days
 */
export function calculateCoolingDegreeDays(
  weatherData: WeatherData[],
  baseTemp: number = 18
): number {
  return weatherData.reduce((total, day) => {
    const temp = day.temperature;
    if (temp === null) return total;
    
    // CDD = actual temp - base temp (when actual > base)
    const cdd = temp > baseTemp ? temp - baseTemp : 0;
    return total + cdd;
  }, 0);
}

/**
 * Check data availability for a station across different date ranges
 * 
 * @param stationId Weather station ID
 * @param granularity 'daily' or 'hourly'
 * @returns Promise with data availability information
 */
export async function checkDataAvailability(stationId: string, granularity: 'daily' | 'hourly' = 'daily') {
  try {
    const recentRange = getSuggestedDateRange(7); // Last 7 days
    const monthRange = getSuggestedDateRange(30); // Last 30 days
    
    // Check recent data availability
    const recentData = await fetchWeatherData(stationId, recentRange.startDate, recentRange.endDate, granularity);
    const monthlyData = await fetchWeatherData(stationId, monthRange.startDate, monthRange.endDate, granularity);
    
    return {
      hasRecentData: recentData.length > 0,
      recentDataCount: recentData.length,
      monthlyDataCount: monthlyData.length,
      lastRecordDate: recentData.length > 0 ? recentData[recentData.length - 1].date : null,
      mostRecentPossible: getMostRecentDataDate(),
      dataLatency: recentData.length > 0 ? 
        Math.floor((new Date().getTime() - new Date(recentData[recentData.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)) : null
    };
  } catch (error) {
    console.error('Error checking data availability:', error);
    return {
      hasRecentData: false,
      recentDataCount: 0,
      monthlyDataCount: 0,
      lastRecordDate: null,
      mostRecentPossible: getMostRecentDataDate(),
      dataLatency: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Determine the appropriate comparison period based on data range
 */
export function getComparisonPeriod(startDate: string, endDate: string): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 365) return 'yearly';
  if (diffDays >= 30) return 'monthly';
  if (diffDays >= 7) return 'weekly';
  return 'daily';
}

/**
 * Aggregate weather data by time period for comparison
 */
export function aggregateWeatherData(weatherData: WeatherData[], period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  if (weatherData.length === 0) return [];

  const grouped = new Map();

  weatherData.forEach(data => {
    const date = new Date(data.date);
    let key: string;
    
    switch (period) {
      case 'yearly':
        key = date.getFullYear().toString();
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'weekly':
        // Get week number within the year
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        break;
      case 'daily':
      default:
        key = data.date.split(' ')[0]; // Take just the date part
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        period: key,
        temperatures: [],
        maxTemperatures: [],
        minTemperatures: [],
        precipitations: [],
        windSpeeds: [],
        humidities: [],
        count: 0,
        dates: []
      });
    }

    const group = grouped.get(key);
    if (data.temperature !== null) group.temperatures.push(data.temperature);
    if (data.maxTemperature !== null) group.maxTemperatures.push(data.maxTemperature);
    if (data.minTemperature !== null) group.minTemperatures.push(data.minTemperature);
    if (data.precipitation !== null) group.precipitations.push(data.precipitation);
    if (data.windSpeed !== null) group.windSpeeds.push(data.windSpeed);
    if (data.humidity !== null) group.humidities.push(data.humidity);
    group.count++;
    group.dates.push(data.date);
  });

  // Calculate aggregated values for each period
  return Array.from(grouped.values()).map(group => {
    const avgTemp = group.temperatures.length > 0 ? 
      group.temperatures.reduce((sum, temp) => sum + temp, 0) / group.temperatures.length : null;
    const maxTemp = group.maxTemperatures.length > 0 ? Math.max(...group.maxTemperatures) : 
      (group.temperatures.length > 0 ? Math.max(...group.temperatures) : null);
    const minTemp = group.minTemperatures.length > 0 ? Math.min(...group.minTemperatures) : 
      (group.temperatures.length > 0 ? Math.min(...group.temperatures) : null);
    const totalPrecip = group.precipitations.length > 0 ? 
      group.precipitations.reduce((sum, precip) => sum + precip, 0) : null;
    const avgWindSpeed = group.windSpeeds.length > 0 ? 
      group.windSpeeds.reduce((sum, speed) => sum + speed, 0) / group.windSpeeds.length : null;
    const avgHumidity = group.humidities.length > 0 ? 
      group.humidities.reduce((sum, humidity) => sum + humidity, 0) / group.humidities.length : null;

    return {
      period: group.period,
      averageTemperature: avgTemp,
      maxTemperature: maxTemp,
      minTemperature: minTemp,
      totalPrecipitation: totalPrecip,
      averageWindSpeed: avgWindSpeed,
      averageHumidity: avgHumidity,
      dataPoints: group.count,
      periodLabel: formatPeriodLabel(group.period, period)
    };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Format period labels for display
 */
function formatPeriodLabel(period: string, periodType: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
  switch (periodType) {
    case 'yearly':
      return period;
    case 'monthly':
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    case 'weekly':
      const [weekYear, week] = period.split('-W');
      return `${weekYear} Week ${week}`;
    case 'daily':
    default:
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Compare current period data with historical averages
 */
export function compareWithHistorical(currentData: WeatherData[], historicalData: WeatherData[]): {
  temperatureDifference: number | null;
  precipitationDifference: number | null;
  significantChanges: string[];
} {
  const currentStats = calculateWeatherStatistics(currentData);
  const historicalStats = calculateWeatherStatistics(historicalData);

  if (!currentStats?.temperatureStats || !historicalStats?.temperatureStats) {
    return {
      temperatureDifference: null,
      precipitationDifference: null,
      significantChanges: ['Insufficient data for comparison']
    };
  }

  const tempDiff = currentStats.temperatureStats.average - historicalStats.temperatureStats.average;
  const precipDiff = currentStats.precipitationStats && historicalStats.precipitationStats 
    ? currentStats.precipitationStats.total - historicalStats.precipitationStats.total
    : null;

  const changes: string[] = [];
  
  if (Math.abs(tempDiff) > 2) {
    changes.push(`Temperature ${tempDiff > 0 ? 'warmer' : 'cooler'} by ${Math.abs(tempDiff).toFixed(1)}°C`);
  }
  
  if (precipDiff !== null && Math.abs(precipDiff) > 10) {
    changes.push(`Precipitation ${precipDiff > 0 ? 'higher' : 'lower'} by ${Math.abs(precipDiff).toFixed(1)}mm`);
  }

  return {
    temperatureDifference: tempDiff,
    precipitationDifference: precipDiff,
    significantChanges: changes.length > 0 ? changes : ['No significant changes detected']
  };
}