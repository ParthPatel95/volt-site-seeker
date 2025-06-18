
import { FreeDataRequest, ScrapingResponse } from '../types.ts';
import { extractLocationCity, extractLocationState } from '../utils.ts';

export async function scrapeBiggerPockets(request: FreeDataRequest): Promise<ScrapingResponse> {
  try {
    console.log('Attempting to scrape BiggerPockets for:', request.location);
    
    // Use a more realistic search approach - BiggerPockets has anti-bot measures
    const searchUrl = `https://www.biggerpockets.com/search/properties`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.biggerpockets.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    console.log(`BiggerPockets response status: ${response.status}`);
    console.log(`BiggerPockets response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log(`BiggerPockets returned status: ${response.status}`);
      return { 
        properties: [], 
        message: 'BiggerPockets requires API access or has anti-scraping measures. Consider using their official API if available.' 
      };
    }

    const html = await response.text();
    console.log(`BiggerPockets HTML length: ${html.length}`);
    console.log(`BiggerPockets HTML preview: ${html.substring(0, 500)}`);

    // Check if we're getting a real page or anti-bot response
    if (html.length < 1000 || html.includes('blocked') || html.includes('captcha') || html.includes('cloudflare')) {
      return {
        properties: [],
        message: 'BiggerPockets is blocking automated access. This is common for real estate sites. Consider using official APIs or manual data entry.'
      };
    }

    const properties = parseBiggerPocketsHTML(html, request.location);

    return {
      properties,
      message: properties.length > 0 
        ? `Found ${properties.length} investment properties from BiggerPockets`
        : 'No properties found on BiggerPockets. The site may have changed its structure or requires authentication.'
    };
  } catch (error) {
    console.error('BiggerPockets scraping error:', error);
    return { 
      properties: [], 
      message: `BiggerPockets access failed: ${error.message}. This site likely has anti-scraping protection.`
    };
  }
}

function parseBiggerPocketsHTML(html: string, location: string) {
  const properties = [];
  
  try {
    // Multiple patterns to try for different page layouts
    const patterns = [
      /<div[^>]*class="[^"]*property-card[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<article[^>]*class="[^"]*property[^"]*"[^>]*>(.*?)<\/article>/gs,
      /<div[^>]*class="[^"]*listing[^"]*"[^>]*>(.*?)<\/div>/gs
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && properties.length < 10) {
        const listingHtml = match[1];
        
        // Try different address patterns
        const addressPatterns = [
          /<h3[^>]*>(.*?)<\/h3>/s,
          /<h2[^>]*>(.*?)<\/h2>/s,
          /<div[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/div>/s,
          /<span[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/span>/s
        ];

        let addressMatch = null;
        for (const addressPattern of addressPatterns) {
          addressMatch = addressPattern.exec(listingHtml);
          if (addressMatch) break;
        }

        const priceMatches = listingHtml.match(/\$[\d,]+/g);
        const roiMatch = /(\d+\.?\d*)%\s*(?:ROI|return|yield)/i.exec(listingHtml);
        
        if (addressMatch) {
          const address = addressMatch[1].replace(/<[^>]*>/g, '').trim();
          const price = priceMatches ? parseInt(priceMatches[0].replace(/[$,]/g, '')) : null;
          const roi = roiMatch ? parseFloat(roiMatch[1]) : null;
          
          // Only add if we have meaningful data
          if (address.length > 5 && !address.includes('undefined') && !address.includes('null')) {
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
      }

      if (properties.length > 0) break; // Stop if we found properties with this pattern
    }
  } catch (error) {
    console.error('Error parsing BiggerPockets HTML:', error);
  }
  
  console.log(`Parsed ${properties.length} properties from BiggerPockets`);
  return properties;
}
