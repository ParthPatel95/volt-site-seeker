
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapeAuctionCom(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Attempting to scrape Auction.com for:', request.location);
    
    const searchUrl = `https://www.auction.com/search`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.auction.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    console.log(`Auction.com response status: ${response.status}`);
    console.log(`Auction.com response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log(`Auction.com returned status: ${response.status}`);
      return { 
        properties: [], 
        message: 'Auction.com requires special access or has anti-scraping measures in place.' 
      };
    }

    const html = await response.text();
    console.log(`Auction.com HTML length: ${html.length}`);
    console.log(`Auction.com HTML preview: ${html.substring(0, 500)}`);

    // Check if we're getting blocked
    if (html.length < 500 || html.includes('blocked') || html.includes('captcha') || html.includes('cloudflare')) {
      return {
        properties: [],
        message: 'Auction.com is blocking automated access. This is common for auction sites due to security measures. Consider using official APIs or checking their terms of service.'
      };
    }

    const properties = parseAuctionComHTML(html, request.location);

    return {
      properties,
      message: properties.length > 0 
        ? `Found ${properties.length} auction properties from Auction.com`
        : 'No auction properties found. Auction.com may require authentication or have changed their page structure.'
    };
  } catch (error) {
    console.error('Auction.com scraping error:', error);
    return { 
      properties: [], 
      message: `Auction.com access failed: ${error instanceof Error ? error.message : 'Unknown error'}. This site has strong anti-scraping protection.`
    };
  }
}

function parseAuctionComHTML(html: string, location: string) {
  const properties = [];
  
  try {
    // Try multiple patterns for auction listings
    const patterns = [
      /<div[^>]*class="[^"]*auction-item[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<div[^>]*class="[^"]*property-card[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<article[^>]*class="[^"]*listing[^"]*"[^>]*>(.*?)<\/article>/gs
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && properties.length < 10) {
        const listingHtml = match[1];
        
        // Try different address patterns
        const addressPatterns = [
          /<span[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/span>/s,
          /<div[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/div>/s,
          /<h3[^>]*>(.*?)<\/h3>/s,
          /<h2[^>]*>(.*?)<\/h2>/s
        ];

        let addressMatch = null;
        for (const addressPattern of addressPatterns) {
          addressMatch = addressPattern.exec(listingHtml);
          if (addressMatch) break;
        }

        const priceMatches = listingHtml.match(/\$[\d,]+/g);
        const dateMatches = listingHtml.match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
        
        if (addressMatch) {
          const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
          const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : undefined;
          const auctionDate = dateMatches ? dateMatches[0] : undefined;
          
          // Only add if we have meaningful data
          if (address.length > 5 && !address.includes('undefined') && !address.includes('null')) {
            properties.push({
              address: address,
              city: extractLocationCity(location),
              state: extractLocationState(location),
              zip_code: '',
              property_type: 'foreclosure',
              source: 'auction_com',
              listing_url: 'https://www.auction.com/',
              description: `Foreclosure auction property - ${address}`,
              square_footage: undefined,
              asking_price: price,
              lot_size_acres: undefined,
              auction_date: auctionDate,
              auction_type: 'foreclosure'
            });
          }
        }
      }

      if (properties.length > 0) break;
    }
  } catch (error) {
    console.error('Error parsing Auction.com HTML:', error);
  }
  
  console.log(`Parsed ${properties.length} properties from Auction.com`);
  return properties;
}
