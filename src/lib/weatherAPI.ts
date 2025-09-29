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
    
    // Find the nearest station
    let nearestStation: WeatherStation | null = null;
    let minDistance = Infinity;
    
    for (const feature of data.features) {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      // Skip stations without required data
      if (!props.STN_ID || !props.STATION_NAME || !coords) continue;
      
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
          distance: distance
        };
      }
    }
    
    if (!nearestStation) {
      throw new Error('No valid weather stations found');
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