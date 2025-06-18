
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

// Comprehensive Alberta municipalities/regions (30+)
const ALBERTA_REGIONS: CountyConfig[] = [
  // Major Cities
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
    }
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
    }
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

// Combined configurations
const COUNTY_CONFIGS: Record<string, CountyConfig[]> = {
  'Texas': TEXAS_COUNTIES,
  'Alberta': ALBERTA_REGIONS
};

async function fetchFromCountyAPI(config: CountyConfig, location: string, propertyType: string): Promise<PropertyData[]> {
  if (!config.apiUrl) return [];

  try {
    console.log(`Attempting to fetch real data from ${config.name} API`);
    console.log(`API URL: ${config.apiUrl}`);
    console.log(`Property type requested: ${propertyType}`);
    
    // Note: In a real implementation, this would make actual API calls
    // For now, we return empty array since no real API integration is implemented
    console.log(`${config.name} API integration not yet implemented for live data fetching`);
    
    return [];
  } catch (error) {
    console.error(`Error fetching from ${config.name} API:`, error);
    return [];
  }
}

async function scrapeCountyWebsite(config: CountyConfig, location: string, propertyType: string): Promise<PropertyData[]> {
  if (!config.searchUrl) return [];

  try {
    console.log(`Attempting to scrape real data from ${config.name} website`);
    console.log(`Search URL: ${config.searchUrl}`);
    console.log(`Property type requested: ${propertyType}`);
    
    // Note: In a real implementation, this would perform actual web scraping
    // For now, we return empty array since no real scraping is implemented
    console.log(`${config.name} web scraping not yet implemented for live data fetching`);
    
    return [];
  } catch (error) {
    console.error(`Error scraping ${config.name} website:`, error);
    return [];
  }
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
  console.log('Fetching county records for:', request.location, 'Property type:', request.property_type);
  
  const { state, county, city } = normalizeLocation(request.location);
  console.log('Normalized location:', { state, county, city });
  
  // Get county configurations for the state
  const stateConfigs = COUNTY_CONFIGS[state] || [];
  
  if (stateConfigs.length === 0) {
    return {
      properties: [],
      message: `County records not available for ${state}. Currently supported: Texas (${TEXAS_COUNTIES.length} counties), Alberta Canada (${ALBERTA_REGIONS.length} regions)`
    };
  }
  
  console.log(`Found ${stateConfigs.length} county/municipal configurations for ${state}`);
  
  let allProperties: PropertyData[] = [];
  let availableSources: string[] = [];
  
  // Process all available counties/regions
  for (const config of stateConfigs) {
    try {
      let countyProperties: PropertyData[] = [];
      
      if (config.accessMethod === 'public_api' && config.apiUrl) {
        countyProperties = await fetchFromCountyAPI(config, request.location, request.property_type || 'commercial');
        if (countyProperties.length === 0) {
          console.log(`${config.name}: Public API available but no live integration implemented`);
        }
      } else if (config.accessMethod === 'web_scraping' && config.searchUrl) {
        countyProperties = await scrapeCountyWebsite(config, request.location, request.property_type || 'commercial');
        if (countyProperties.length === 0) {
          console.log(`${config.name}: Web scraping endpoint available but no live integration implemented`);
        }
      }
      
      allProperties.push(...countyProperties);
      availableSources.push(config.name);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error processing ${config.name}:`, error);
    }
  }
  
  const publicApiSources = stateConfigs.filter(c => c.accessMethod === 'public_api').length;
  const webScrapingSources = stateConfigs.filter(c => c.accessMethod === 'web_scraping').length;
  
  console.log(`Processed ${availableSources.length} sources. Found ${allProperties.length} properties total.`);
  
  return {
    properties: allProperties,
    message: allProperties.length > 0 
      ? `Found ${allProperties.length} properties from county records`
      : `County records data source configured for ${state} with ${stateConfigs.length} sources (${publicApiSources} public APIs, ${webScrapingSources} web scraping endpoints). Live data integration not yet implemented - this requires real API keys and scraping infrastructure to fetch actual property records.`
  };
}
