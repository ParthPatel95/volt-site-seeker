
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapePublicAuctions(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Attempting to scrape public auction sites for:', request.location);
    
    // Focus on sites that are more likely to work
    const sites = [
      {
        name: 'GovDeals',
        url: 'https://www.govdeals.com/index.cfm?fa=Main.AdvSearchResultsNew',
        searchParam: 'Keywords'
      },
      {
        name: 'PublicSurplus', 
        url: 'https://www.publicsurplus.com/sms/browse/cataucs',
        searchParam: 'q'
      }
    ];

    let allProperties = [];
    
    for (const site of sites) {
      try {
        console.log(`Attempting to access ${site.name}...`);
        
        const response = await fetch(site.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        console.log(`${site.name} response status: ${response.status}`);
        
        if (response.ok) {
          const html = await response.text();
          console.log(`${site.name} HTML length: ${html.length}`);
          
          if (html.length > 1000 && !html.includes('blocked') && !html.includes('captcha')) {
            const properties = parsePublicAuctionHTML(html, request.location, site.url, site.name);
            allProperties.push(...properties);
            console.log(`Found ${properties.length} properties from ${site.name}`);
          } else {
            console.log(`${site.name} appears to be blocking access or has minimal content`);
          }
        } else {
          console.log(`${site.name} returned status ${response.status}`);
        }
      } catch (siteError) {
        console.log(`Failed to access ${site.name}:`, siteError.message);
      }
    }

    return {
      properties: allProperties,
      message: allProperties.length > 0 
        ? `Found ${allProperties.length} properties from public auction sites`
        : 'No properties found from public auction sites. These sites often have anti-scraping measures or require specific authentication.'
    };
  } catch (error) {
    console.error('Public auction scraping error:', error);
    return { 
      properties: [], 
      message: `Public auction scraping failed: ${error.message}. Government auction sites typically have strong security measures.`
    };
  }
}

function parsePublicAuctionHTML(html: string, location: string, sourceUrl: string, siteName: string) {
  const properties = [];
  
  try {
    // Multiple parsing strategies for different site layouts
    const patterns = [
      // Table-based layouts
      /<tr[^>]*class="[^"]*(?:item|listing|auction)[^"]*"[^>]*>(.*?)<\/tr>/gs,
      /<tr[^>]*>(.*?)<\/tr>/gs,
      // Card-based layouts
      /<div[^>]*class="[^"]*(?:item|card|listing)[^"]*"[^>]*>(.*?)<\/div>/gs,
      // List-based layouts
      /<li[^>]*class="[^"]*(?:item|listing)[^"]*"[^>]*>(.*?)<\/li>/gs
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && properties.length < 10) {
        const itemHtml = match[1];
        
        // Look for property-related keywords
        const propertyKeywords = /(?:property|building|facility|warehouse|office|commercial|industrial|real\s*estate|land)/i;
        
        if (!propertyKeywords.test(itemHtml)) {
          continue; // Skip non-property items
        }
        
        // Try to extract relevant information
        const titleMatch = /<(?:td|div|span|h[1-6])[^>]*>([^<]*(?:property|building|facility|warehouse|office|commercial|industrial)[^<]*)<\/(?:td|div|span|h[1-6])>/i.exec(itemHtml);
        const priceMatches = itemHtml.match(/\$[\d,]+/g);
        const locationMatch = /(?:location|address|city)[\s:]*([^<>\n]+)/i.exec(itemHtml);
        
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
          const itemLocation = locationMatch ? locationMatch[1].trim() : location;
          
          // Only add if we have meaningful property data
          if (title.length > 10 && title.length < 200) {
            properties.push({
              address: itemLocation,
              city: extractLocationCity(location),
              state: extractLocationState(location),
              zip_code: '',
              property_type: 'government_surplus',
              source: 'public_auctions',
              listing_url: sourceUrl,
              description: `${siteName}: ${title}`,
              square_footage: null,
              asking_price: price,
              lot_size_acres: null,
              auction_type: 'government_surplus'
            });
          }
        }
      }

      if (properties.length > 0) break; // Stop if we found properties with this pattern
    }
  } catch (error) {
    console.error(`Error parsing ${siteName} HTML:`, error);
  }
  
  console.log(`Parsed ${properties.length} properties from ${siteName}`);
  return properties;
}
