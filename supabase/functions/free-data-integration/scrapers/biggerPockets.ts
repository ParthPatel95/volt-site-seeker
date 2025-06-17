
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapeBiggerPockets(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Scraping BiggerPockets for:', request.location);
    
    const searchUrl = `https://www.biggerpockets.com/search/properties?location=${encodeURIComponent(request.location)}&property_type=commercial`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.biggerpockets.com/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      console.log(`BiggerPockets returned status: ${response.status}`);
      return { properties: [], message: 'BiggerPockets returned an error response' };
    }

    const html = await response.text();
    console.log(`BiggerPockets HTML length: ${html.length}`);

    const properties = parseBiggerPocketsHTML(html, request.location);

    return {
      properties,
      message: `Found ${properties.length} investment properties from BiggerPockets`
    };
  } catch (error) {
    console.error('BiggerPockets scraping error:', error);
    return { properties: [], message: `BiggerPockets scraping failed: ${error.message}` };
  }
}

function parseBiggerPocketsHTML(html: string, location: string) {
  const properties = [];
  
  try {
    const listingRegex = /<div[^>]*class="[^"]*property-card[^"]*"[^>]*>(.*?)<\/div>/gs;
    const addressRegex = /<h3[^>]*>(.*?)<\/h3>/s;
    const priceRegex = /\$[\d,]+/g;
    const roiRegex = /(\d+\.?\d*)%\s*ROI/i;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 20) {
      const listingHtml = match[1];
      
      const addressMatch = addressRegex.exec(listingHtml);
      const priceMatches = listingHtml.match(priceRegex);
      const roiMatch = roiRegex.exec(listingHtml);
      
      if (addressMatch) {
        const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        const roi = roiMatch ? parseFloat(roiMatch[1]) : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'investment',
          source: 'biggerpockets',
          listing_url: 'https://www.biggerpockets.com/',
          description: `Investment property - ${address}${roi ? ` (${roi}% ROI)` : ''}`,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          roi_estimate: roi
        });
      }
    }
  } catch (error) {
    console.error('Error parsing BiggerPockets HTML:', error);
  }
  
  return properties;
}
