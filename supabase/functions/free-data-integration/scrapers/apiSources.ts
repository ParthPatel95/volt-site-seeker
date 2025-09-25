
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractCity, extractState, extractZipCode, extractStateFromCensus } from '../utils.ts';
import { fetchCountyRecords } from './countyRecords.ts';

export async function fetchGooglePlaces(request: FreeDataRequest): Promise<ScrapingResponse> {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Google Places API key not configured. Please add GOOGLE_PLACES_API_KEY to your edge function secrets.' };
  }

  try {
    const searchQuery = `commercial real estate ${request.property_type || 'industrial'} ${request.location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    console.log('Google Places API request URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();

    console.log('Google Places API response status:', response.status);
    console.log('Google Places API response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Google Places API error: ${data.error_message || 'Unknown error'}`);
    }

    const properties = data.results?.slice(0, 20).map((place: any) => ({
      address: place.formatted_address || place.name,
      city: extractCity(place.formatted_address),
      state: extractState(place.formatted_address),
      zip_code: extractZipCode(place.formatted_address),
      property_type: request.property_type || 'commercial',
      source: 'google_places',
      listing_url: place.photos?.[0] ? `https://maps.google.com/place/${place.place_id}` : undefined,
      description: `${place.name} - ${place.types?.join(', ')}`,
      square_footage: undefined,
      asking_price: undefined,
      lot_size_acres: undefined,
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      }
    })) || [];

    return {
      properties,
      message: `Found ${properties.length} commercial properties via Google Places`
    };
  } catch (error) {
    console.error('Google Places API error:', error);
    return { properties: [], message: `Google Places API error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function fetchYelpData(request: FreeDataRequest): Promise<ScrapingResponse> {
  const apiKey = Deno.env.get('YELP_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Yelp API key not configured. Please add YELP_API_KEY to your edge function secrets.' };
  }

  try {
    const categories = 'realestateagents,commercialrealestate,industrialequipment';
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(request.location)}&categories=${categories}&limit=50`;
    
    console.log('Yelp API request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    console.log('Yelp API response status:', response.status);
    console.log('Yelp API response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Yelp API error: ${data.error?.description || 'Unknown error'}`);
    }

    const properties = data.businesses?.map((business: any) => ({
      address: business.location?.display_address?.join(', '),
      city: business.location?.city,
      state: business.location?.state,
      zip_code: business.location?.zip_code,
      property_type: 'commercial',
      source: 'yelp',
      listing_url: business.url,
      description: `${business.name} - ${business.categories?.map((c: any) => c.title).join(', ')}`,
      square_footage: undefined,
      asking_price: undefined,
      lot_size_acres: undefined,
      coordinates: {
        lat: business.coordinates?.latitude,
        lng: business.coordinates?.longitude
      }
    })) || [];

    return {
      properties,
      message: `Found ${properties.length} business properties via Yelp`
    };
  } catch (error) {
    console.error('Yelp API error:', error);
    return { properties: [], message: `Yelp API error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function fetchOpenStreetMapData(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Fetching OpenStreetMap data for:', request.location);
    
    // First, try to get the bounding box for the location using Nominatim
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(request.location)}&limit=1`;
    
    console.log('Nominatim geocoding URL:', geocodeUrl);
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'VoltScout Property Discovery/1.0'
      }
    });
    
    const geocodeData = await geocodeResponse.json();
    console.log('Geocoding response:', JSON.stringify(geocodeData, null, 2));
    
    if (!geocodeData || geocodeData.length === 0) {
      return { properties: [], message: 'Location not found in OpenStreetMap' };
    }
    
    const bbox = geocodeData[0].boundingbox;
    const [south, north, west, east] = bbox;
    
    // Improved Overpass query with better targeting
    const query = `
      [out:json][timeout:25];
      (
        way["landuse"~"commercial|industrial|retail"]["building"!~"no|house|residential"](${south},${west},${north},${east});
        way["building"~"commercial|industrial|warehouse|factory|office"]["landuse"!~"residential"](${south},${west},${north},${east});
        way["amenity"~"industrial|warehouse"]["building"](${south},${west},${north},${east});
        relation["landuse"~"commercial|industrial"]["type"="multipolygon"](${south},${west},${north},${east});
      );
      out center meta;
    `;

    console.log('Overpass query:', query);

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain',
        'User-Agent': 'VoltScout Property Discovery/1.0'
      },
      body: query
    });

    if (!response.ok) {
      console.log('Overpass API error:', response.status, response.statusText);
      return { properties: [], message: 'OpenStreetMap Overpass API error' };
    }

    const data = await response.json();
    console.log('OpenStreetMap response:', JSON.stringify(data, null, 2));

    const properties = data.elements?.slice(0, 30).map((element: any) => {
      const tags = element.tags || {};
      const center = element.center || (element.type === 'node' ? { lat: element.lat, lon: element.lon } : null);
      
      const address = [
        tags['addr:housenumber'],
        tags['addr:street']
      ].filter(Boolean).join(' ') || 'Address not specified';
      
      const city = tags['addr:city'] || request.location.split(',')[0].trim();
      const state = tags['addr:state'] || 'Unknown';
      
      return {
        address: address,
        city: city,
        state: state,
        zip_code: tags['addr:postcode'] || '',
        property_type: tags.landuse || tags.building || tags.amenity || 'commercial',
        source: 'openstreetmap',
        listing_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        description: `${tags.name || 'Commercial Property'} - ${tags.landuse || tags.building || 'Commercial use'}`,
        square_footage: undefined,
        asking_price: undefined,
        lot_size_acres: undefined,
        coordinates: center ? {
          lat: center.lat,
          lng: center.lon
        } : null
      };
    }).filter((p: any) => p.coordinates) || [];

    return {
      properties,
      message: `Found ${properties.length} properties from OpenStreetMap`
    };
  } catch (error) {
    console.error('OpenStreetMap API error:', error);
    return { properties: [], message: `OpenStreetMap data error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function fetchCensusData(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Fetching Census data for:', request.location);
    
    // Use a simpler, more reliable Census API endpoint
    const year = '2021';
    const url = `https://api.census.gov/data/${year}/cbp?get=NAME,NAICS2017_LABEL,EMP,ESTAB&for=county:*&in=state:48&NAICS2017=23`;
    
    console.log('Census API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VoltScout Property Discovery/1.0'
      }
    });
    
    console.log('Census API response status:', response.status);
    
    if (!response.ok) {
      console.log('Census API error:', response.status, response.statusText);
      return { 
        properties: [], 
        message: `Census API error: HTTP ${response.status}` 
      };
    }

    // Check if response has content
    const textContent = await response.text();
    console.log('Census API raw response length:', textContent.length);
    
    if (!textContent || textContent.trim().length === 0) {
      return { 
        properties: [], 
        message: 'Census API returned empty response' 
      };
    }

    let data;
    try {
      data = JSON.parse(textContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { 
        properties: [], 
        message: 'Census API returned invalid JSON' 
      };
    }
    
    console.log('Census API parsed data length:', data?.length);
    
    if (!data || data.length <= 1) {
      return { 
        properties: [], 
        message: 'No Census business data available for the specified location' 
      };
    }

    // Filter and process the data
    const relevantData = data.slice(1).filter((row: any[]) => {
      const countyName = row[0]?.toLowerCase() || '';
      const locationFilter = request.location.toLowerCase();
      return countyName.includes('texas') || countyName.includes('tx') || 
             locationFilter.includes('texas') || locationFilter.includes('tx');
    });

    console.log('Filtered census data rows:', relevantData.length);

    const properties = relevantData.slice(0, 15).map((row: any[], index: number) => {
      const countyName = row[0] || 'Unknown County';
      const industry = row[1] || 'Unknown Industry';
      const employees = parseInt(row[2]) || 0;
      const establishments = parseInt(row[3]) || 0;
      
      return {
        address: `Business District ${index + 1}, ${countyName}`,
        city: countyName.split(',')[0] || 'Texas',
        state: 'TX',
        zip_code: '',
        property_type: 'commercial_district',
        source: 'census',
        listing_url: `https://data.census.gov/cedsci/`,
        description: `${industry} - ${establishments} establishments, ${employees} employees`,
        square_footage: undefined,
        asking_price: undefined,
        lot_size_acres: undefined,
        census_data: {
          industry: industry,
          employees: employees,
          establishments: establishments,
          annual_payroll: 0
        }
      };
    });

    return {
      properties,
      message: `Found ${properties.length} business districts from Census data`
    };
  } catch (error) {
    console.error('Census API error:', error);
    return { 
      properties: [], 
      message: `Census data error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function fetchCountyRecordsData(request: FreeDataRequest): Promise<ScrapingResponse> {
  return await fetchCountyRecords(request);
}
