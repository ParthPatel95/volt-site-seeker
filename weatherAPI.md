# Weather API Integration

This document describes the integration with Environment and Climate Change Canada's GeoMet OGC-API for retrieving historical weather data.

## API Overview

- **Base URL**: `https://api.weather.gc.ca`
- **Authentication**: None required (public API)
- **Format**: JSON (GeoJSON FeatureCollection)
- **Protocol**: HTTPS only

## Available Collections

### 1. Climate Stations (`climate-stations`)

**Purpose**: Find weather stations within a geographic area

**Endpoint**: 
```
GET https://api.weather.gc.ca/collections/climate-stations/items?bbox=<xmin,ymin,xmax,ymax>
```

**Parameters**:
- `bbox`: Bounding box coordinates as `xmin,ymin,xmax,ymax` (longitude, latitude)
- `limit`: Maximum number of results (optional)

**Response Fields**:
- `STN_ID`: Station identifier
- `STATION_NAME`: Station name
- `PROVINCE_CODE`: Province/territory code
- `LATITUDE`: Station latitude
- `LONGITUDE`: Station longitude
- `ELEVATION`: Station elevation in meters

**Example**:
```
GET https://api.weather.gc.ca/collections/climate-stations/items?bbox=-123.2,49.2,-123.1,49.3
```

### 2. Climate Daily (`climate-daily`)

**Purpose**: Retrieve daily weather observations

**Endpoint**:
```
GET https://api.weather.gc.ca/collections/climate-daily/items?datetime=<start>/<end>&STN_ID=<station_id>&sortby=LOCAL_DATE
```

**Parameters**:
- `datetime`: ISO-8601 interval (e.g., `2024-01-01 00:00:00/2024-01-31 23:59:59`)
- `STN_ID`: Station ID from climate-stations collection
- `sortby`: Use `LOCAL_DATE` for chronological order
- `limit`: Maximum records (default: 10000)

**Response Fields**:
- `LOCAL_DATE`: Observation date
- `MEAN_TEMPERATURE`: Daily mean temperature (°C)
- `MAX_TEMPERATURE`: Daily maximum temperature (°C)
- `MIN_TEMPERATURE`: Daily minimum temperature (°C)
- `TOTAL_PRECIPITATION`: Total precipitation (mm)
- `TOTAL_RAIN`: Total rainfall (mm)
- `TOTAL_SNOW`: Total snowfall (cm)
- `SNOW_ON_GROUND`: Snow depth (cm)
- `SPEED_MAX_GUST`: Maximum wind gust speed (km/h)
- `DIRECTION_MAX_GUST`: Wind gust direction (tens of degrees)
- Quality flags (e.g., `TOTAL_SNOW_FLAG`) - use only when flag is `null`

### 3. Climate Hourly (`climate-hourly`)

**Purpose**: Retrieve hourly weather observations

**Endpoint**:
```
GET https://api.weather.gc.ca/collections/climate-hourly/items?datetime=<start>/<end>&STN_ID=<station_id>&sortby=LOCAL_DATE
```

**Parameters**: Same as daily collection

**Response Fields**:
- `LOCAL_DATE`: Observation date and time
- `TEMP`: Temperature (°C)
- `DEW_POINT_TEMP`: Dew point temperature (°C)
- `REL_HUMIDITY`: Relative humidity (%)
- `PRECIPITATION`: Precipitation (mm)
- `WIND_DIR`: Wind direction (tens of degrees)
- `WIND_SPEED`: Wind speed (km/h)
- `VISIBILITY`: Visibility (km)
- `STN_PRESSURE`: Station pressure (kPa)
- `HUMIDEX`: Humidex value
- `WIND_CHILL`: Wind chill temperature
- `WEATHER`: Weather description

## Data Quality

### Quality Flags
- Each measurement has an associated `_FLAG` field
- **Only use values where the flag is `null`** (indicates valid data)
- Non-null flags indicate data quality issues or missing values

### Wind Direction
- Values are provided in **tens of degrees**
- Multiply by 10 to get actual degrees (0-360)
- 0 or 36 = North, 9 = East, 18 = South, 27 = West

### Missing Data
- API may return `null` for variables with no data
- Common for precipitation/snow on dry days
- Always check quality flags before using values

## Implementation Notes

### URL Encoding
- Always URL-encode query parameters
- Spaces should be encoded as `%20`
- Special characters in datetime strings must be encoded

### Bounding Box Calculation
```javascript
// Create bounding box around coordinates
const radiusKm = 100;
const deltaLat = radiusKm / 111; // 1 degree ≈ 111 km
const deltaLon = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

const bbox = [
  longitude - deltaLon, // xmin
  latitude - deltaLat,  // ymin
  longitude + deltaLon, // xmax
  latitude + deltaLat   // ymax
].join(',');
```

### Error Handling
- API returns standard HTTP status codes
- 400: Bad request (invalid parameters)
- 404: Collection/data not found
- 500: Server error
- Handle network timeouts and parsing errors

## Example Requests

### Find stations near Vancouver
```
GET https://api.weather.gc.ca/collections/climate-stations/items?bbox=-123.3,49.1,-123.0,49.4&limit=10
```

### Get daily data for January 2024
```
GET https://api.weather.gc.ca/collections/climate-daily/items?datetime=2024-01-01%2000:00:00/2024-01-31%2023:59:59&STN_ID=888&sortby=LOCAL_DATE
```

### Get hourly data for one day
```
GET https://api.weather.gc.ca/collections/climate-hourly/items?datetime=2024-07-01%2000:00:00/2024-07-01%2023:59:59&STN_ID=888&sortby=LOCAL_DATE
```

## Rate Limits

- No specific rate limits documented
- Use reasonable request intervals
- Cache results when possible
- Consider implementing exponential backoff for errors

### 4. Climate Normals (`climate-normals`)

**Purpose**: Get 1981-2010 climate averages for comparison and context

**Endpoint**: 
```
GET https://api.weather.gc.ca/collections/climate-normals/items?STN_ID=<station_id>
```

**Response Fields**:
- Monthly temperature normals (January through December)
- Annual precipitation, rainfall, and snowfall totals
- Extreme maximum and minimum temperatures on record

### 5. Climate Monthly (`climate-monthly`)

**Purpose**: Get monthly weather summaries with extremes

**Endpoint**:
```
GET https://api.weather.gc.ca/collections/climate-monthly/items?datetime=<start>/<end>&STN_ID=<station_id>
```

**Response Fields**:
- `MEAN_TEMPERATURE`: Monthly mean temperature
- `EXTREME_MAXIMUM_TEMPERATURE`: Highest temperature for the month
- `EXTREME_MINIMUM_TEMPERATURE`: Lowest temperature for the month
- `TOTAL_PRECIPITATION`: Total monthly precipitation
- `DAYS_WITH_PRECIP`: Number of days with precipitation

## Enhanced Library Functions

The weatherAPI.ts library now includes:

### New Functions
- `fetchClimateNormals(stationId)`: Get historical climate averages (1981-2010)
- `fetchMonthlyWeatherSummary(stationId, year)`: Get monthly summaries for a year
- `calculateWeatherStatistics(weatherData)`: Calculate statistics from weather data

### Enhanced Features
- Better error handling and data validation
- Support for quality flag checking on all data points
- Comprehensive data type definitions for all API responses
- Statistical analysis functions for weather data

## Future Enhancements

The API also provides additional collections that could be integrated:
- `ahccd-annual`: Adjusted and homogenized annual climate data with trends
- `ahccd-trends`: Long-term climate trend analysis
- `hydrometric-stations`: Water level and flow monitoring stations
- `hydrometric-realtime`: Real-time water data (last 30 days)
- Forecast collections: `gdps-pressure-contours`, `aqhi-forecasts`

These can be integrated for specialized climate analysis and water monitoring applications.