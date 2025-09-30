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
 * Find the nearest weather station to given coordinates
 * 
 * @param latitude Target latitude
 * @param longitude Target longitude
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
    // Format datetime for API (ISO 8601 interval)
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;
    const datetimeInterval = `${encodeURIComponent(startDateTime)}/${encodeURIComponent(endDateTime)}`;
    
    // Choose collection based on granularity
    const collection = granularity === 'daily' ? 'climate-daily' : 'climate-hourly';
    
    const url = `${BASE_URL}/collections/${collection}/items?datetime=${datetimeInterval}&STN_ID=${stationId}&sortby=LOCAL_DATE&limit=10000`;
    
    const response = await fetch(url);
    if (!response.ok) {
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