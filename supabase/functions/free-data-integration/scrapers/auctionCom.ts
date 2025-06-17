
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapeAuctionCom(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Scraping Auction.com for:', request.location);
    
    const searchUrl = `https://www.auction.com/search?location=${encodeURIComponent(request.location)}&asset_type=real_estate&status=upcoming`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.auction.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.log(`Auction.com returned status: ${response.status}`);
      return { properties: [], message: 'Auction.com returned an error response' };
    }

    const html = await response.text();
    console.log(`Auction.com HTML length: ${html.length}`);

    const properties = parseAuctionComHTML(html, request.location);

    return {
      properties,
      message: `Found ${properties.length} auction properties from Auction.com`
    };
  } catch (error) {
    console.error('Auction.com scraping error:', error);
    return { properties: [], message: `Auction.com scraping failed: ${error.message}` };
  }
}

function parseAuctionComHTML(html: string, location: string) {
  const properties = [];
  
  try {
    const listingRegex = /<div[^>]*class="[^"]*auction-item[^"]*"[^>]*>(.*?)<\/div>/gs;
    const addressRegex = /<span[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/span>/s;
    const priceRegex = /\$[\d,]+/g;
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/g;

    let match;
    while ((match = listingRegex.exec(html)) !== null && properties.length < 20) {
      const listingHtml = match[1];
      
      const addressMatch = addressRegex.exec(listingHtml);
      const priceMatches = listingHtml.match(priceRegex);
      const dateMatches = listingHtml.match(dateRegex);
      
      if (addressMatch) {
        const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
        const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
        const auctionDate = dateMatches ? dateMatches[0] : null;
        
        properties.push({
          address: address,
          city: extractLocationCity(location),
          state: extractLocationState(location),
          zip_code: '',
          property_type: 'foreclosure',
          source: 'auction_com',
          listing_url: 'https://www.auction.com/',
          description: `Foreclosure auction property - ${address}`,
          square_footage: null,
          asking_price: price,
          lot_size_acres: null,
          auction_date: auctionDate,
          auction_type: 'foreclosure'
        });
      }
    }
  } catch (error) {
    console.error('Error parsing Auction.com HTML:', error);
  }
  
  return properties;
}
