import { FreeDataRequest, ScrapingResponse, PropertyData } from '../types.ts';
import { fetchAltaLinkData } from './altaLinkAPI.ts';

interface CountyConfig {
  name: string;
  state: string;
  apiUrl?: string;
  searchUrl?: string;
  dataFormat: 'api' | 'csv' | 'xml' | 'json' | 'html';
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
  requiresApiKey?: boolean;
  apiKeyEnvName?: string;
  altalink_integration?: boolean;
}

// Comprehensive county configurations for Texas (30+ counties)
const TEXAS_COUNTIES: CountyConfig[] = [
  // Major Metropolitan Counties
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
  },
  {
    name: 'Tarrant County',
    state: 'TX',
    apiUrl: 'https://www.tad.org/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'property_address',
      owner: 'owner_name',
      assessed_value: 'assessed_value',
      market_value: 'market_value'
    }
  },
  {
    name: 'Bexar County',
    state: 'TX',
    searchUrl: 'https://www.bcad.org/clientdb/PropertySearch.aspx',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: {
      address: 'situs_address',
      owner: 'owner_name',
      assessed_value: 'total_value'
    }
  },
  {
    name: 'Collin County',
    state: 'TX',
    apiUrl: 'https://www.collincad.org/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'property_address',
      owner: 'owner_name',
      assessed_value: 'appraised_value'
    }
  },
  {
    name: 'Denton County',
    state: 'TX',
    searchUrl: 'https://www.dentoncad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: {
      address: 'property_location',
      owner: 'owner_name',
      assessed_value: 'total_assessed_value'
    }
  },
  {
    name: 'Fort Bend County',
    state: 'TX',
    apiUrl: 'https://www.fbcad.org/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'situs_address',
      owner: 'owner_name',
      assessed_value: 'total_value'
    }
  },
  {
    name: 'Montgomery County',
    state: 'TX',
    searchUrl: 'https://www.mctx.org/departments/departments_a_-_m/appraisal_district',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: {
      address: 'property_address',
      owner: 'owner_name',
      assessed_value: 'assessed_value'
    }
  },
  {
    name: 'Williamson County',
    state: 'TX',
    apiUrl: 'https://www.wcad.org/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'property_address',
      owner: 'owner_name',
      assessed_value: 'total_appraised_value'
    }
  },
  // Additional Texas Counties (20+ more)
  {
    name: 'Galveston County',
    state: 'TX',
    searchUrl: 'https://www.galvestoncad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Brazoria County',
    state: 'TX',
    searchUrl: 'https://www.brazoriacad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Jefferson County',
    state: 'TX',
    searchUrl: 'https://www.jcad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Nueces County',
    state: 'TX',
    searchUrl: 'https://www.nuecescad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'El Paso County',
    state: 'TX',
    apiUrl: 'https://www.epcad.org/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Bell County',
    state: 'TX',
    searchUrl: 'https://www.bellcad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'McLennan County',
    state: 'TX',
    searchUrl: 'https://www.mclennancad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Guadalupe County',
    state: 'TX',
    searchUrl: 'https://www.guadalupecad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Hays County',
    state: 'TX',
    searchUrl: 'https://www.hayscad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Kaufman County',
    state: 'TX',
    searchUrl: 'https://www.kaufmancad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Johnson County',
    state: 'TX',
    searchUrl: 'https://www.johnsoncad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Liberty County',
    state: 'TX',
    searchUrl: 'https://www.libertycad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Chambers County',
    state: 'TX',
    searchUrl: 'https://www.chamberscad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Walker County',
    state: 'TX',
    searchUrl: 'https://www.walkercad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Ellis County',
    state: 'TX',
    searchUrl: 'https://www.elliscad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Rockwall County',
    state: 'TX',
    searchUrl: 'https://www.rockwallcad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Brazos County',
    state: 'TX',
    searchUrl: 'https://www.brazoscad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Smith County',
    state: 'TX',
    searchUrl: 'https://www.smithcad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Lubbock County',
    state: 'TX',
    searchUrl: 'https://www.lubbockcad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Webb County',
    state: 'TX',
    searchUrl: 'https://www.webbcad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Parker County',
    state: 'TX',
    searchUrl: 'https://www.parkercad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Comal County',
    state: 'TX',
    searchUrl: 'https://www.comalcad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Hunt County',
    state: 'TX',
    searchUrl: 'https://www.huntcad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Victoria County',
    state: 'TX',
    searchUrl: 'https://www.victoriacad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Grayson County',
    state: 'TX',
    searchUrl: 'https://www.graysoncad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Hidalgo County',
    state: 'TX',
    searchUrl: 'https://www.hidalgocad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Cameron County',
    state: 'TX',
    searchUrl: 'https://www.cameroncad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Orange County',
    state: 'TX',
    searchUrl: 'https://www.orangecad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Gregg County',
    state: 'TX',
    searchUrl: 'https://www.greggcad.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Henderson County',
    state: 'TX',
    searchUrl: 'https://www.hendersoncad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Wichita County',
    state: 'TX',
    searchUrl: 'https://www.wichitacad.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  }
];

// Enhanced Alberta regions with AltaLink integration flag
const ALBERTA_REGIONS_ENHANCED: CountyConfig[] = [
  // Major Cities with AltaLink integration
  {
    name: 'City of Calgary',
    state: 'AB',
    apiUrl: 'https://data.calgary.ca/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'address',
      owner: 'owner',
      assessed_value: 'assessed_value',
      market_value: 'market_value',
      property_type: 'property_type',
      year_built: 'year_built'
    },
    requiresApiKey: false,
    altalink_integration: true
  },
  {
    name: 'City of Edmonton',
    state: 'AB',
    apiUrl: 'https://data.edmonton.ca/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: {
      address: 'address',
      owner: 'owner_name',
      assessed_value: 'assessed_value',
      property_type: 'property_class'
    },
    requiresApiKey: false,
    altalink_integration: true
  },
  // Municipal Districts
  {
    name: 'Municipal District of Foothills',
    state: 'AB',
    searchUrl: 'https://www.mdfoothills.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'registered_owner', assessed_value: 'total_assessment' }
  },
  {
    name: 'Strathcona County',
    state: 'AB',
    apiUrl: 'https://www.strathcona.ca/api/property',
    dataFormat: 'json',
    accessMethod: 'public_api',
    fields: { address: 'civic_address', owner: 'owner_name', assessed_value: 'total_value' }
  },
  {
    name: 'Regional Municipality of Wood Buffalo',
    state: 'AB',
    searchUrl: 'https://www.rmwb.ca/property-tax/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner', assessed_value: 'assessed_value' }
  },
  // Counties
  {
    name: 'Parkland County',
    state: 'AB',
    searchUrl: 'https://www.parklandcounty.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Sturgeon County',
    state: 'AB',
    searchUrl: 'https://www.sturgeoncounty.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Leduc County',
    state: 'AB',
    searchUrl: 'https://www.leduc-county.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Lac Ste. Anne County',
    state: 'AB',
    searchUrl: 'https://www.lsac.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Wetaskiwin County',
    state: 'AB',
    searchUrl: 'https://www.county.wetaskiwin.ab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  // Cities and Towns
  {
    name: 'City of Red Deer',
    state: 'AB',
    searchUrl: 'https://www.reddeer.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Lethbridge',
    state: 'AB',
    searchUrl: 'https://www.lethbridge.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Medicine Hat',
    state: 'AB',
    searchUrl: 'https://www.medicinehat.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Grande Prairie',
    state: 'AB',
    searchUrl: 'https://www.cityofgp.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Airdrie',
    state: 'AB',
    searchUrl: 'https://www.airdrie.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Spruce Grove',
    state: 'AB',
    searchUrl: 'https://www.sprucegrove.org/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Leduc',
    state: 'AB',
    searchUrl: 'https://www.leduc.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of St. Albert',
    state: 'AB',
    searchUrl: 'https://www.stalbert.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Sherwood Park',
    state: 'AB',
    searchUrl: 'https://www.sherwoodpark.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Fort Saskatchewan',
    state: 'AB',
    searchUrl: 'https://www.fortsask.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Lloydminster',
    state: 'AB',
    searchUrl: 'https://www.lloydminster.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'City of Camrose',
    state: 'AB',
    searchUrl: 'https://www.camrose.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'County of Grande Prairie',
    state: 'AB',
    searchUrl: 'https://www.countygp.ab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Rocky View County',
    state: 'AB',
    searchUrl: 'https://www.rockyview.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Brazeau County',
    state: 'AB',
    searchUrl: 'https://www.brazeau.ab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'County of Lethbridge',
    state: 'AB',
    searchUrl: 'https://www.lethcounty.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Wheatland County',
    state: 'AB',
    searchUrl: 'https://www.wheatlandcounty.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Vulcan County',
    state: 'AB',
    searchUrl: 'https://www.vulcancounty.ab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Newell County',
    state: 'AB',
    searchUrl: 'https://www.newellcountyab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Ponoka County',
    state: 'AB',
    searchUrl: 'https://www.ponokacounty.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Lacombe County',
    state: 'AB',
    searchUrl: 'https://www.lacombecounty.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Red Deer County',
    state: 'AB',
    searchUrl: 'https://www.rdcounty.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Clearwater County',
    state: 'AB',
    searchUrl: 'https://www.clearwatercounty.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Mountain View County',
    state: 'AB',
    searchUrl: 'https://www.mvmd.ab.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Olds County',
    state: 'AB',
    searchUrl: 'https://www.olds.ca/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  },
  {
    name: 'Kneehill County',
    state: 'AB',
    searchUrl: 'https://www.kneehillcounty.com/property-search',
    dataFormat: 'api',
    accessMethod: 'web_scraping',
    fields: { address: 'property_address', owner: 'owner_name', assessed_value: 'assessed_value' }
  }
];

// Combined configurations with enhanced Alberta support
const COUNTY_CONFIGS: Record<string, CountyConfig[]> = {
  'Texas': TEXAS_COUNTIES,
  'Alberta': ALBERTA_REGIONS_ENHANCED
};

async function fetchFromCountyAPI(config: CountyConfig, location: string, propertyType: string): Promise<PropertyData[]> {
  if (!config.apiUrl) return [];

  try {
    console.log(`Fetching live data from ${config.name} API`);
    console.log(`API URL: ${config.apiUrl}`);
    
    let apiKey = '';
    if (config.requiresApiKey && config.apiKeyEnvName) {
      apiKey = Deno.env.get(config.apiKeyEnvName) || '';
      if (!apiKey) {
        console.log(`API key ${config.apiKeyEnvName} not found for ${config.name}`);
        return [];
      }
    }

    const headers: Record<string, string> = {
      'User-Agent': 'VoltScout Property Discovery/1.0',
      'Accept': 'application/json, text/html, */*',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Build search parameters based on location and property type
    const searchParams = new URLSearchParams();
    searchParams.append('location', location);
    searchParams.append('propertyType', propertyType);
    searchParams.append('limit', '50');

    const requestUrl = `${config.apiUrl}?${searchParams.toString()}`;
    console.log(`Making API request to: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.log(`API request failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(`API response received from ${config.name}`);

    // Parse response based on expected format
    return parseAPIResponse(data, config, location);

  } catch (error) {
    console.error(`Error fetching from ${config.name} API:`, error);
    return [];
  }
}

async function scrapeCountyWebsite(config: CountyConfig, location: string, propertyType: string): Promise<PropertyData[]> {
  if (!config.searchUrl) return [];

  try {
    console.log(`Scraping live data from ${config.name} website`);
    console.log(`Search URL: ${config.searchUrl}`);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };

    // First, get the search page
    console.log(`Fetching search page: ${config.searchUrl}`);
    const response = await fetch(config.searchUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.log(`Failed to fetch search page: ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log(`Received HTML page (${html.length} characters)`);

    // Parse the HTML and extract property data
    const properties = await parseHTMLResponse(html, config, location, propertyType);
    
    console.log(`Extracted ${properties.length} properties from ${config.name}`);
    return properties;

  } catch (error) {
    console.error(`Error scraping ${config.name} website:`, error);
    return [];
  }
}

function parseAPIResponse(data: any, config: CountyConfig, location: string): PropertyData[] {
  const properties: PropertyData[] = [];
  
  try {
    // Handle different API response formats
    let records = [];
    
    if (Array.isArray(data)) {
      records = data;
    } else if (data.records) {
      records = data.records;
    } else if (data.results) {
      records = data.results;
    } else if (data.data) {
      records = data.data;
    }

    for (const record of records.slice(0, 20)) {
      const property: PropertyData = {
        address: extractFieldValue(record, config.fields.address) || 'Address not available',
        city: extractCity(location),
        state: config.state,
        zip_code: extractZipCode(record) || '',
        property_type: extractFieldValue(record, config.fields.property_type) || 'commercial',
        source: 'county_records',
        listing_url: null,
        description: `Property record from ${config.name}`,
        square_footage: parseNumeric(extractFieldValue(record, config.fields.square_footage)),
        asking_price: null,
        lot_size_acres: parseNumeric(extractFieldValue(record, config.fields.lot_size)),
        year_built: parseNumeric(extractFieldValue(record, config.fields.year_built)),
        assessed_value: parseNumeric(extractFieldValue(record, config.fields.assessed_value)),
        market_value: parseNumeric(extractFieldValue(record, config.fields.market_value)),
        owner_name: extractFieldValue(record, config.fields.owner)
      };

      if (property.address && property.address !== 'Address not available') {
        properties.push(property);
      }
    }
  } catch (error) {
    console.error('Error parsing API response:', error);
  }

  return properties;
}

async function parseHTMLResponse(html: string, config: CountyConfig, location: string, propertyType: string): Promise<PropertyData[]> {
  const properties: PropertyData[] = [];
  
  try {
    // Basic HTML parsing for property records
    // Look for common patterns in county assessor websites
    
    // Search for table rows that might contain property data
    const tableRowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
    
    let match;
    while ((match = tableRowRegex.exec(html)) !== null && properties.length < 20) {
      const rowHtml = match[1];
      const cells: string[] = [];
      
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const cellContent = cellMatch[1].replace(/<[^>]*>/g, '').trim();
        if (cellContent) {
          cells.push(cellContent);
        }
      }
      
      // Try to extract property information from cells
      if (cells.length >= 3) {
        const property = extractPropertyFromCells(cells, config, location);
        if (property) {
          properties.push(property);
        }
      }
    }

    // If no table format found, try other common patterns
    if (properties.length === 0) {
      // Look for address patterns
      const addressRegex = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Circle|Cir|Court|Ct|Place|Pl)\b/gi;
      const addresses = html.match(addressRegex) || [];
      
      for (const address of addresses.slice(0, 10)) {
        const property: PropertyData = {
          address: address.trim(),
          city: extractCity(location),
          state: config.state,
          zip_code: '',
          property_type: propertyType || 'commercial',
          source: 'county_records',
          listing_url: config.searchUrl,
          description: `Property found via web scraping from ${config.name}`,
          square_footage: null,
          asking_price: null,
          lot_size_acres: null
        };
        properties.push(property);
      }
    }

  } catch (error) {
    console.error('Error parsing HTML response:', error);
  }

  return properties;
}

function extractPropertyFromCells(cells: string[], config: CountyConfig, location: string): PropertyData | null {
  try {
    // Attempt to map cells to property fields based on common patterns
    let address = '';
    let owner = '';
    let assessedValue = '';
    let marketValue = '';
    
    // Look for patterns that might indicate addresses
    for (const cell of cells) {
      if (/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way)/i.test(cell)) {
        address = cell;
      } else if (/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(cell.replace(/[^\d.,]/g, ''))) {
        if (!assessedValue) {
          assessedValue = cell;
        } else if (!marketValue) {
          marketValue = cell;
        }
      } else if (cell.length > 5 && !address && !/^\d+$/.test(cell)) {
        // Might be an address or owner name
        if (!address) {
          address = cell;
        } else if (!owner) {
          owner = cell;
        }
      }
    }

    if (address) {
      return {
        address,
        city: extractCity(location),
        state: config.state,
        zip_code: '',
        property_type: 'commercial',
        source: 'county_records',
        listing_url: config.searchUrl,
        description: `Property record from ${config.name}`,
        square_footage: null,
        asking_price: null,
        lot_size_acres: null,
        assessed_value: parseNumeric(assessedValue),
        market_value: parseNumeric(marketValue),
        owner_name: owner || null
      };
    }
  } catch (error) {
    console.error('Error extracting property from cells:', error);
  }
  
  return null;
}

function extractFieldValue(record: any, fieldPath?: string): string | null {
  if (!fieldPath || !record) return null;
  
  // Handle nested field paths like 'address.street'
  const parts = fieldPath.split('.');
  let value = record;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return null;
    }
  }
  
  return value ? String(value).trim() : null;
}

function parseNumeric(value: string | null): number | null {
  if (!value) return null;
  
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

function extractCity(location: string): string {
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}

function extractZipCode(record: any): string | null {
  // Look for zip code patterns in the record
  const zipRegex = /\b\d{5}(-\d{4})?\b/;
  
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') {
      const match = value.match(zipRegex);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

function normalizeLocation(location: string): { state: string; county?: string; city?: string } {
  const locationParts = location.split(',').map(part => part.trim());
  
  // Handle specific location formats
  if (location.toLowerCase().includes('alberta') || location.toLowerCase().includes('ab')) {
    return { state: 'Alberta', city: locationParts[0] };
  }
  
  if (location.toLowerCase().includes('texas') || location.toLowerCase().includes('tx')) {
    return { state: 'Texas', city: locationParts[0] };
  }
  
  if (locationParts.length >= 2) {
    return {
      state: locationParts[locationParts.length - 1],
      city: locationParts[0],
      county: locationParts.length > 2 ? locationParts[1] : undefined
    };
  }
  
  // Handle single location input
  const stateMapping: Record<string, string> = {
    'Texas': 'Texas',
    'Alberta': 'Alberta'
  };
  
  return {
    state: stateMapping[location] || location,
    city: location
  };
}

export async function fetchCountyRecords(request: FreeDataRequest): Promise<ScrapingResponse> {
  console.log('Fetching live county records for:', request.location, 'Property type:', request.property_type);
  
  const { state, county, city } = normalizeLocation(request.location);
  console.log('Normalized location:', { state, county, city });
  
  let allProperties: PropertyData[] = [];
  let successfulSources: string[] = [];
  let failedSources: string[] = [];
  
  // Special handling for Alberta - try AltaLink first for transmission data
  if (state === 'Alberta' || state === 'AB') {
    try {
      console.log('Attempting AltaLink API integration for Alberta transmission data');
      const altaLinkResult = await fetchAltaLinkData(request);
      
      if (altaLinkResult.properties.length > 0) {
        allProperties.push(...altaLinkResult.properties);
        successfulSources.push('AltaLink Transmission API');
        console.log(`Successfully retrieved ${altaLinkResult.properties.length} facilities from AltaLink`);
      }
    } catch (error) {
      console.error('AltaLink API integration failed:', error);
      failedSources.push('AltaLink Transmission API (Error)');
    }
  }
  
  // Get county configurations for the state
  const stateConfigs = COUNTY_CONFIGS[state] || [];
  
  if (stateConfigs.length === 0 && allProperties.length === 0) {
    return {
      properties: [],
      message: `County records not available for ${state}. Currently supported: Texas (${TEXAS_COUNTIES.length} counties), Alberta Canada (${ALBERTA_REGIONS_ENHANCED.length} regions)`
    };
  }
  
  console.log(`Found ${stateConfigs.length} county/municipal configurations for ${state}`);
  
  // Process up to 5 sources to avoid timeout (skip if we already have AltaLink data)
  const sourcesToProcess = allProperties.length > 0 ? stateConfigs.slice(0, 2) : stateConfigs.slice(0, 5);
  
  for (const config of sourcesToProcess) {
    try {
      let countyProperties: PropertyData[] = [];
      
      if (config.accessMethod === 'public_api' && config.apiUrl) {
        countyProperties = await fetchFromCountyAPI(config, request.location, request.property_type || 'commercial');
        
        if (countyProperties.length > 0) {
          successfulSources.push(`${config.name} (API)`);
        } else {
          failedSources.push(`${config.name} (API - no data)`);
        }
      } else if (config.accessMethod === 'web_scraping' && config.searchUrl) {
        countyProperties = await scrapeCountyWebsite(config, request.location, request.property_type || 'commercial');
        
        if (countyProperties.length > 0) {
          successfulSources.push(`${config.name} (Web Scraping)`);
        } else {
          failedSources.push(`${config.name} (Web Scraping - no data)`);
        }
      }
      
      allProperties.push(...countyProperties);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error processing ${config.name}:`, error);
      failedSources.push(`${config.name} (Error: ${error.message})`);
    }
  }
  
  console.log(`Processed ${sourcesToProcess.length} sources. Found ${allProperties.length} properties total.`);
  console.log(`Successful sources: ${successfulSources.length}`);
  console.log(`Failed sources: ${failedSources.length}`);
  
  const publicApiSources = stateConfigs.filter(c => c.accessMethod === 'public_api').length;
  const webScrapingSources = stateConfigs.filter(c => c.accessMethod === 'web_scraping').length;
  
  let message = '';
  if (allProperties.length > 0) {
    message = `Found ${allProperties.length} properties from ${successfulSources.length} sources: ${successfulSources.join(', ')}`;
    if (state === 'Alberta' && successfulSources.includes('AltaLink Transmission API')) {
      message += '. Includes high-accuracy transmission data from AltaLink (Alberta\'s transmission operator)';
    }
  } else {
    message = `Live data integration attempted for ${state} with ${stateConfigs.length} sources (${publicApiSources} public APIs, ${webScrapingSources} web scraping endpoints)`;
    if (state === 'Alberta') {
      message += ' including AltaLink transmission API';
    }
    message += '. No properties found - this may be due to access restrictions, required authentication, or CAPTCHA protection on county websites.';
  }

  return {
    properties: allProperties,
    message
  };
}
