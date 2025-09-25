
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { BrokerageSite, ScrapingResult } from './types.ts';
import { getRandomUserAgent, isAntiBot, delay } from './utils.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function attemptRealScraping(
  site: BrokerageSite, 
  location: string, 
  requestedPropertyType: string
): Promise<any[]> {
  console.log(`Attempting real scraping of ${site.name} for ${requestedPropertyType} in ${location}`);
  
  try {
    const searchUrl = `${site.baseUrl}${site.searchPath}?location=${encodeURIComponent(location)}&type=${encodeURIComponent(requestedPropertyType)}`;
    
    console.log(`Fetching: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      redirect: 'follow'
    });

    console.log(`${site.name}: HTTP ${response.status} - ${response.statusText}`);

    if (!response.ok) {
      console.log(`${site.name}: Failed with status ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log(`${site.name}: Received ${html.length} characters of HTML`);
    
    if (isAntiBot(html)) {
      console.log(`${site.name}: Detected anti-bot protection`);
      return [];
    }

    console.log(`${site.name}: Real HTML parsing not implemented - would need DOM parser`);
    return [];

  } catch (error) {
    console.error(`Error scraping ${site.name}:`, error);
    return [];
  }
}

export async function updateScrapingSourceStatus(
  siteName: string, 
  status: string, 
  propertiesFound: number = 0
): Promise<void> {
  try {
    await supabase
      .from('scraping_sources')
      .upsert({
        name: siteName,
        type: 'comprehensive_scraper',
        url: '',
        status: status === 'completed' ? 'active' : 'inactive',
        last_run: new Date().toISOString(),
        properties_found: propertiesFound
      });
  } catch (error) {
    console.log(`Warning: Could not update status for ${siteName}:`, error);
  }
}

export async function scrapeSites(
  sitesToScrape: BrokerageSite[],
  location: string,
  propertyType: string
): Promise<{ properties: any[], results: ScrapingResult[] }> {
  const allProperties: any[] = [];
  const scrapingResults: ScrapingResult[] = [];
  
  for (const site of sitesToScrape) {
    try {
      console.log(`\n--- Scraping ${site.name} ---`);
      
      await updateScrapingSourceStatus(site.name, 'active', 0);

      const properties = await attemptRealScraping(site, location, propertyType);
      allProperties.push(...properties);

      const result: ScrapingResult = {
        site: site.name,
        properties_found: properties.length,
        success: properties.length > 0,
        status: properties.length > 0 ? 'completed' : 'no_real_data_found'
      };
      
      scrapingResults.push(result);

      await updateScrapingSourceStatus(site.name, result.status, properties.length);

      console.log(`${site.name}: Found ${properties.length} real properties`);

      if (sitesToScrape.indexOf(site) < sitesToScrape.length - 1) {
        const delayTime = 2000 + Math.random() * 3000;
        console.log(`Waiting ${Math.round(delayTime)}ms before next site...`);
        await delay(delayTime);
      }

    } catch (error) {
      console.error(`Error scraping ${site.name}:`, error);
      
      scrapingResults.push({
        site: site.name,
        properties_found: 0,
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { properties: allProperties, results: scrapingResults };
}
