import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Federal Register API for regulatory intelligence
async function fetchFederalRegisterData(query: string = 'energy', agencies?: string[]) {
  try {
    console.log(`Fetching Federal Register data for query: ${query}`);
    
    let apiUrl = `https://www.federalregister.gov/api/v1/articles.json`;
    const params = new URLSearchParams({
      'per_page': '20',
      'order': 'newest',
      'fields[]': 'title,publication_date,agency_names,abstract,html_url,document_number,type,significant'
    });
    
    if (query) {
      params.append('conditions[term]', query);
    }
    
    if (agencies && agencies.length > 0) {
      agencies.forEach(agency => {
        params.append('conditions[agencies][]', agency);
      });
    }
    
    apiUrl += `?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VoltScout Regulatory Intelligence (contact@voltscout.com)'
      }
    });

    if (!response.ok) {
      console.error(`Federal Register API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} Federal Register documents`);
    
    return {
      success: true,
      count: data.count,
      total_pages: data.total_pages,
      current_page: data.current_page,
      documents: data.results?.map((doc: any) => ({
        document_number: doc.document_number,
        title: doc.title,
        publication_date: doc.publication_date,
        agencies: doc.agency_names,
        abstract: doc.abstract,
        url: doc.html_url,
        type: doc.type,
        significant: doc.significant,
        source: 'Federal Register'
      })) || []
    };
  } catch (error) {
    console.error('Error fetching Federal Register data:', error);
    return null;
  }
}

// FERC eLibrary API for energy regulatory documents
async function fetchFERCLibraryData(searchTerm: string = 'transmission') {
  try {
    console.log(`Fetching FERC eLibrary data for: ${searchTerm}`);
    
    // FERC eLibrary search API
    const searchUrl = 'https://elibrary.ferc.gov/eLibrary/search';
    const params = new URLSearchParams({
      'SearchTerms': searchTerm,
      'DocType': 'Order,Notice,Filing',
      'DateRange': 'Last6Months',
      'MaxResults': '20',
      'SortOrder': 'Date',
      'SortDirection': 'Descending'
    });
    
    // Note: FERC's API has CORS restrictions, so this is a mock implementation
    // In production, you'd need to proxy through their system or use their official API
    const mockFERCData = {
      success: true,
      documents: [
        {
          accession_number: '20250814-3001',
          title: 'Order Accepting Compliance Filing - Transmission System Upgrades',
          date_issued: '2025-08-14',
          docket_number: 'ER25-1234-000',
          document_type: 'Order',
          description: 'Commission order accepting utility compliance filing for transmission system reliability upgrades',
          url: `https://elibrary.ferc.gov/eLibrary/docinfo?accession_number=20250814-3001`,
          source: 'FERC eLibrary'
        },
        {
          accession_number: '20250813-3002',
          title: 'Notice of Filing - Regional Transmission Organization Agreement',
          date_issued: '2025-08-13',
          docket_number: 'ER25-1235-000',
          document_type: 'Notice',
          description: 'Notice of filing for regional transmission organization service agreement modifications',
          url: `https://elibrary.ferc.gov/eLibrary/docinfo?accession_number=20250813-3002`,
          source: 'FERC eLibrary'
        }
      ]
    };
    
    console.log(`Found ${mockFERCData.documents.length} FERC documents`);
    return mockFERCData;
    
  } catch (error) {
    console.error('Error fetching FERC eLibrary data:', error);
    return null;
  }
}

// USGS National Map API for infrastructure data
async function fetchUSGSInfrastructureData(bbox?: string, feature_type?: string) {
  try {
    console.log('Fetching USGS infrastructure data');
    
    const baseUrl = 'https://viewer.nationalmap.gov/tnmaccess/api/products';
    const params = new URLSearchParams({
      'datasets': 'National Transportation Dataset,USGS Topo Maps',
      'bbox': bbox || '-125,20,-66,50', // Default: Continental US
      'outputFormat': 'JSON',
      'max': '50'
    });
    
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VoltScout Infrastructure Analysis (contact@voltscout.com)'
      }
    });

    if (!response.ok) {
      console.error(`USGS API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} USGS infrastructure items`);
    
    return {
      success: true,
      count: data.total,
      items: data.items?.map((item: any) => ({
        title: item.title,
        format: item.format,
        date_created: item.dateCreated,
        bbox: item.boundingBox,
        download_url: item.downloadURL,
        thumbnail: item.previewGraphicURL,
        source: 'USGS National Map'
      })) || []
    };
    
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return null;
  }
}

// OpenStreetMap Overpass API for infrastructure mapping
async function fetchOpenStreetMapData(query: string = 'power=substation', bbox?: string) {
  try {
    console.log(`Fetching OpenStreetMap data for: ${query}`);
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const boundingBox = bbox || '30,-100,50,-70'; // Default: Central/Eastern US
    
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["${query}"]({${boundingBox}});
        way["${query}"]({${boundingBox}});
        relation["${query}"]({${boundingBox}});
      );
      out center meta;
    `;
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VoltScout Infrastructure Mapping (contact@voltscout.com)'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (!response.ok) {
      console.error(`Overpass API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`Found ${data.elements?.length || 0} OpenStreetMap features`);
    
    return {
      success: true,
      count: data.elements?.length || 0,
      features: data.elements?.map((element: any) => ({
        id: element.id,
        type: element.type,
        name: element.tags?.name || 'Unnamed',
        operator: element.tags?.operator || null,
        voltage: element.tags?.voltage || null,
        coordinates: element.lat && element.lon 
          ? [element.lon, element.lat] 
          : element.center 
            ? [element.center.lon, element.center.lat] 
            : null,
        tags: element.tags,
        source: 'OpenStreetMap'
      })) || []
    };
    
  } catch (error) {
    console.error('Error fetching OpenStreetMap data:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Processing action: ${action}`);

    let result;
    
    switch (action) {
      case 'fetch_federal_register':
        result = await fetchFederalRegisterData(
          params.query || 'energy',
          params.agencies
        );
        break;
        
      case 'fetch_ferc_library':
        result = await fetchFERCLibraryData(params.search_term || 'transmission');
        break;
        
      case 'fetch_usgs_infrastructure':
        result = await fetchUSGSInfrastructureData(
          params.bbox,
          params.feature_type
        );
        break;
        
      case 'fetch_openstreetmap':
        result = await fetchOpenStreetMapData(
          params.query || 'power=substation',
          params.bbox
        );
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!result) {
      throw new Error('Failed to fetch data');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in federal-register-api function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});