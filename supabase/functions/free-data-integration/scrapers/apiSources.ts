
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractCity, extractState, extractZipCode, extractStateFromCensus } from '../utils.ts';

export async function fetchGooglePlaces(request: FreeDataRequest): Promise<ScrapingResponse> {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Google Places API key not configured' };
  }

  try {
    const searchQuery = `commercial real estate ${request.property_type || 'industrial'} ${request.location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

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
      listing_url: place.photos?.[0] ? `https://maps.google.com/place/${place.place_id}` : null,
      description: `${place.name} - ${place.types?.join(', ')}`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
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
    return { properties: [], message: 'Google Places API currently unavailable' };
  }
}

export async function fetchYelpData(request: FreeDataRequest): Promise<ScrapingResponse> {
  const apiKey = Deno.env.get('YELP_API_KEY');
  if (!apiKey) {
    return { properties: [], message: 'Yelp API key not configured' };
  }

  try {
    const categories = 'realestateagents,commercialrealestate,industrialequipment';
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(request.location)}&categories=${categories}&limit=50`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

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
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
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
    return { properties: [], message: 'Yelp API currently unavailable' };
  }
}

export async function fetchOpenStreetMapData(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        way["landuse"~"commercial|industrial|retail"]["addr:city"~"${request.location}",i];
        way["building"~"commercial|industrial|warehouse"]["addr:city"~"${request.location}",i];
        relation["landuse"~"commercial|industrial"]["addr:city"~"${request.location}",i];
      );
      out geom;
    `;

    const url = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('OpenStreetMap Overpass API error');
    }

    const properties = data.elements?.slice(0, 30).map((element: any) => ({
      address: `${element.tags?.['addr:housenumber'] || ''} ${element.tags?.['addr:street'] || 'Unknown Street'}`.trim(),
      city: element.tags?.['addr:city'] || request.location,
      state: element.tags?.['addr:state'] || '',
      zip_code: element.tags?.['addr:postcode'] || '',
      property_type: element.tags?.landuse || element.tags?.building || 'commercial',
      source: 'openstreetmap',
      listing_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      description: `${element.tags?.name || 'Commercial Property'} - ${element.tags?.landuse || element.tags?.building}`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      coordinates: element.type === 'node' ? {
        lat: element.lat,
        lng: element.lon
      } : element.center ? {
        lat: element.center.lat,
        lng: element.center.lon
      } : null
    })) || [];

    return {
      properties: properties.filter(p => p.coordinates),
      message: `Found ${properties.length} properties from OpenStreetMap`
    };
  } catch (error) {
    console.error('OpenStreetMap API error:', error);
    return { properties: [], message: 'OpenStreetMap data currently unavailable' };
  }
}

export async function fetchCensusData(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    const year = '2021';
    const url = `https://api.census.gov/data/${year}/cbp?get=NAME,NAICS2017_LABEL,EMP,ESTAB&for=county:*&in=state:*&NAICS2017=23,31-33,42,44-45,48-49,53,54,56`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Census API error');
    }

    const locationFilter = request.location.toLowerCase();
    const relevantData = data?.slice(1).filter((row: any[]) => 
      row[0]?.toLowerCase().includes(locationFilter)
    ) || [];

    const properties = relevantData.slice(0, 20).map((row: any[], index: number) => ({
      address: `Business District ${index + 1}`,
      city: row[0]?.split(',')[0] || request.location,
      state: extractStateFromCensus(row),
      zip_code: '',
      property_type: 'commercial',
      source: 'census',
      listing_url: null,
      description: `${row[1]} - ${row[3]} establishments, ${row[2]} employees`,
      square_footage: null,
      asking_price: null,
      lot_size_acres: null,
      census_data: {
        industry: row[1],
        employees: parseInt(row[2]) || 0,
        establishments: parseInt(row[3]) || 0
      }
    }));

    return {
      properties,
      message: `Found ${properties.length} business areas from Census data`
    };
  } catch (error) {
    console.error('Census API error:', error);
    return { properties: [], message: 'Census data currently unavailable' };
  }
}

export async function fetchCountyRecords(request: FreeDataRequest): Promise<ScrapingResponse> {
  return {
    properties: [],
    message: 'County records integration requires specific county API configuration'
  };
}
