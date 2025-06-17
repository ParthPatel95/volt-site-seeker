
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapePublicAuctions(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Scraping public auction sites for:', request.location);
    
    const sites = [
      'https://www.publicsurplus.com/sms/browse/cataucs',
      'https://www.govdeals.com/index.cfm?fa=Main.AdvSearchResultsNew',
      'https://bid.txauction.com/index.cfm?fa=Main.AdvSearchResultsNew'
    ];

    let allProperties = [];
    
    for (const siteUrl of sites) {
      try {
        const response = await fetch(`${siteUrl}?location=${encodeURIComponent(request.location)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          }
        });

        if (response.ok) {
          const html = await response.text();
          const properties = parsePublicAuctionHTML(html, request.location, siteUrl);
          allProperties.push(...properties);
        }
      } catch (siteError) {
        console.log(`Failed to scrape ${siteUrl}:`, siteError.message);
      }
    }

    return {
      properties: allProperties,
      message: `Found ${allProperties.length} properties from public auction sites`
    };
  } catch (error) {
    console.error('Public auction scraping error:', error);
    return { properties: [], message: `Public auction scraping failed: ${error.message}` };
  }
}

function parsePublicAuctionHTML(html: string, location: string, sourceUrl: string) {
  const properties = [];
  
  try {
    const listingRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    const addressRegex = /(?:address|location)[^>]*>([^<]+)</i;
    const priceRegex = /\$[\d,]+/g;
    const itemRegex = /<td[^>]*>([^<]*(?:property|building|facility|warehouse)[^<]*)<\/td>/i;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 15) {
      const rowHtml = match[1];
      
      const addressMatch = addressRegex.exec(rowHtml);
      const itemMatch = itemRegex.exec(rowHtml);
      const priceMatches = rowHtml.match(priceRegex);
      
      if (itemMatch || addressMatch) {
        const description = itemMatch ? itemMatch[1].trim() : 'Government surplus property';
        const address = addressMatch ? addressMatch[1].trim() : `Government Property, ${location}`;
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'government_surplus',
          source: 'public_auctions',
          listing_url: sourceUrl,
          description: description,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          auction_type: 'government_surplus'
        });
      }
    }
  } catch (error) {
    console.error('Error parsing public auction HTML:', error);
  }
  
  return properties;
}
