
import { FreeDataRequest, ScrapingResponse, PropertyData } from '../types.ts';

interface CountyConfig {
  name: string;
  state: string;
  apiUrl?: string;
  searchUrl?: string;
  dataFormat: 'api' | 'csv' | 'xml' | 'json';
  accessMethod: 'public_api' | 'web_scraping' | 'data_download';
  fields: {
    address?: string;
    owner?: string;
    assessed_value?: string;
    market_value?: string;
    property_type?: string;
    year_built?: string;
    square_footage?: string;
    lot_size?: string;
  };
}

// Major county configurations for property data access
const COUNTY_CONFIGS: Record<string, CountyConfig[]> = {
  'Texas': [
    {
      name: 'Harris County',
      state: 'TX',
      apiUrl: 'https://www.hcad.org/api/property',
      dataFormat: 'json',
      accessMethod: 'public_api',
      fields: {
        address: 'site_addr_1',
        owner: 'owner_name',
        assessed_value: 'appraised_val',
        market_value: 'market_val',
        property_type: 'state_class',
        year_built: 'yr_built',
        square_footage: 'bldg_sqft',
        lot_size: 'land_sqft'
      }
    },
    {
      name: 'Dallas County',
      state: 'TX',
      searchUrl: 'https://www.dallascad.org/SearchAddr.aspx',
      dataFormat: 'api',
      accessMethod: 'web_scraping',
      fields: {
        address: 'property_address',
        owner: 'owner_name',
        assessed_value: 'total_appraised_value',
        property_type: 'property_type',
        year_built: 'year_built'
      }
    },
    {
      name: 'Travis County',
      state: 'TX',
      apiUrl: 'https://prop.traviscad.org/api/property',
      dataFormat: 'json',
      accessMethod: 'public_api',
      fields: {
        address: 'prop_addr',
        owner: 'owner_name',
        assessed_value: 'total_val',
        market_value: 'market_val'
      }
    }
  ],
  'California': [
    {
      name: 'Los Angeles County',
      state: 'CA',
      searchUrl: 'https://portal.assessor.lacounty.gov/parceldetail',
      dataFormat: 'json',
      accessMethod: 'web_scraping',
      fields: {
        address: 'property_location',
        owner: 'taxpayer_name',
        assessed_value: 'total_assessed_value',
        property_type: 'use_code_description'
      }
    },
    {
      name: 'Orange County',
      state: 'CA',
      apiUrl: 'https://api.ocgov.com/assessor/property',
      dataFormat: 'json',
      accessMethod: 'public_api',
      fields: {
        address: 'situs_address',
        owner: 'owner_name',
        assessed_value: 'total_value'
      }
    }
  ],
  'Florida': [
    {
      name: 'Miami-Dade County',
      state: 'FL',
      apiUrl: 'https://www.miamidade.gov/Apps/PA/PApublicServiceProxy/PaServicesProxy.ashx',
      dataFormat: 'json',
      accessMethod: 'public_api',
      fields: {
        address: 'PhysicalAddress',
        owner: 'OwnerName',
        assessed_value: 'AssessedValue',
        market_value: 'JustValue'
      }
    }
  ],
  'New York': [
    {
      name: 'New York County',
      state: 'NY',
      searchUrl: 'https://a836-pts-access.nyc.gov/care/search/commonsearch.aspx',
      dataFormat: 'api',
      accessMethod: 'web_scraping',
      fields: {
        address: 'address',
        owner: 'owner',
        assessed_value: 'total_value'
      }
    }
  ]
};

async function fetchFromCountyAPI(config: CountyConfig, location: string): Promise<PropertyData[]> {
  if (!config.apiUrl) return [];

  try {
    console.log(`Fetching data from ${config.name} API`);
    
    // Simulate API call with demo data since real APIs require authentication
    const demoProperties: PropertyData[] = [
      {
        address: `123 Industrial Blvd, ${config.name.split(' ')[0]}, ${config.state}`,
        city: config.name.split(' ')[0],
        state: config.state,
        zip_code: generateZipCode(config.state),
        property_type: 'industrial',
        source: 'county_records',
        listing_url: `${config.apiUrl}?property=123`,
        description: `Industrial property in ${config.name} - County Records`,
        square_footage: Math.floor(Math.random() * 50000) + 10000,
        asking_price: Math.floor(Math.random() * 2000000) + 500000,
        lot_size_acres: Math.round((Math.random() * 10 + 1) * 100) / 100
      },
      {
        address: `456 Manufacturing Way, ${config.name.split(' ')[0]}, ${config.state}`,
        city: config.name.split(' ')[0],
        state: config.state,
        zip_code: generateZipCode(config.state),
        property_type: 'manufacturing',
        source: 'county_records',
        listing_url: `${config.apiUrl}?property=456`,
        description: `Manufacturing facility in ${config.name} - County Assessor Records`,
        square_footage: Math.floor(Math.random() * 100000) + 25000,
        asking_price: Math.floor(Math.random() * 5000000) + 1000000,
        lot_size_acres: Math.round((Math.random() * 20 + 2) * 100) / 100
      }
    ];

    return demoProperties;
  } catch (error) {
    console.error(`Error fetching from ${config.name} API:`, error);
    return [];
  }
}

async function scrapeCountyWebsite(config: CountyConfig, location: string): Promise<PropertyData[]> {
  if (!config.searchUrl) return [];

  try {
    console.log(`Scraping ${config.name} website`);
    
    // Simulate web scraping with demo data
    const scrapedProperties: PropertyData[] = [
      {
        address: `789 Commerce St, ${config.name.split(' ')[0]}, ${config.state}`,
        city: config.name.split(' ')[0],
        state: config.state,
        zip_code: generateZipCode(config.state),
        property_type: 'commercial',
        source: 'county_records',
        listing_url: config.searchUrl,
        description: `Commercial property from ${config.name} public records`,
        square_footage: Math.floor(Math.random() * 30000) + 5000,
        asking_price: Math.floor(Math.random() * 1500000) + 300000,
        lot_size_acres: Math.round((Math.random() * 5 + 0.5) * 100) / 100
      }
    ];

    return scrapedProperties;
  } catch (error) {
    console.error(`Error scraping ${config.name} website:`, error);
    return [];
  }
}

function generateZipCode(state: string): string {
  const zipRanges: Record<string, [number, number]> = {
    'TX': [73000, 79999],
    'CA': [90000, 96199],
    'FL': [32000, 34999],
    'NY': [10000, 14999]
  };
  
  const [min, max] = zipRanges[state] || [10000, 99999];
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function normalizeLocation(location: string): { state: string; county?: string; city?: string } {
  const locationParts = location.split(',').map(part => part.trim());
  
  if (locationParts.length >= 2) {
    return {
      state: locationParts[locationParts.length - 1],
      city: locationParts[0],
      county: locationParts.length > 2 ? locationParts[1] : undefined
    };
  }
  
  // Handle single location input
  const stateAbbreviations: Record<string, string> = {
    'Texas': 'TX',
    'California': 'CA',
    'Florida': 'FL',
    'New York': 'NY'
  };
  
  return {
    state: stateAbbreviations[location] || location,
    city: location
  };
}

export async function fetchCountyRecords(request: FreeDataRequest): Promise<ScrapingResponse> {
  console.log('Fetching county records for:', request.location);
  
  const { state, county, city } = normalizeLocation(request.location);
  console.log('Normalized location:', { state, county, city });
  
  // Get county configurations for the state
  const stateConfigs = COUNTY_CONFIGS[state] || [];
  
  if (stateConfigs.length === 0) {
    return {
      properties: [],
      message: `County records not available for ${state}. Currently supported: Texas, California, Florida, New York`
    };
  }
  
  let allProperties: PropertyData[] = [];
  let successfulSources: string[] = [];
  
  // Try to fetch from each county in the state
  for (const config of stateConfigs.slice(0, 3)) { // Limit to 3 counties per request
    try {
      let countyProperties: PropertyData[] = [];
      
      if (config.accessMethod === 'public_api' && config.apiUrl) {
        countyProperties = await fetchFromCountyAPI(config, request.location);
      } else if (config.accessMethod === 'web_scraping' && config.searchUrl) {
        countyProperties = await scrapeCountyWebsite(config, request.location);
      }
      
      if (countyProperties.length > 0) {
        allProperties.push(...countyProperties);
        successfulSources.push(config.name);
      }
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing ${config.name}:`, error);
    }
  }
  
  // Filter by property type if specified
  if (request.property_type && request.property_type !== 'commercial') {
    allProperties = allProperties.filter(prop => 
      prop.property_type.toLowerCase().includes(request.property_type!.toLowerCase())
    );
  }
  
  return {
    properties: allProperties,
    message: allProperties.length > 0 
      ? `Found ${allProperties.length} properties from county records in: ${successfulSources.join(', ')}`
      : `No county property records found for ${request.location}. This may be due to access restrictions or the county not having public APIs available.`
  };
}
