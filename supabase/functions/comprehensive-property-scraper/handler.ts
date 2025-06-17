
import { ScrapeRequest } from './types.ts';
import { brokerageSites } from './config.ts';
import { scrapeSites } from './scraper.ts';

export async function handleScrapeRequest(request: ScrapeRequest) {
  const { 
    location = 'Texas', 
    property_type = 'industrial',
    budget_range = 'under_5m',
    power_requirements = 'high',
    sources = [],
    test_mode = false
  } = request;

  console.log(`Starting real data scraping for ${property_type} properties in ${location}`);
  console.log(`Test mode: ${test_mode}`);

  const sitesToScrape = sources.length > 0 
    ? brokerageSites.filter(site => sources.includes(site.id))
    : brokerageSites.slice(0, 2);

  console.log(`Targeting ${sitesToScrape.length} brokerage sites:`, sitesToScrape.map(s => s.name));

  const { properties: allProperties, results: scrapingResults } = await scrapeSites(
    sitesToScrape,
    location,
    property_type
  );

  console.log(`\nTotal real properties found: ${allProperties.length}`);
  console.log('Scraping results:', scrapingResults);

  return {
    success: allProperties.length > 0,
    properties_found: allProperties.length,
    sources_used: scrapingResults.filter(r => r.success).map(r => r.site),
    properties: allProperties,
    message: allProperties.length > 0 
      ? `Successfully scraped ${allProperties.length} real properties from ${sitesToScrape.length} brokerage sites.`
      : 'No real property data found. Real estate websites may require API access or have anti-scraping protection.',
    scraping_details: scrapingResults,
    summary: {
      total_properties: allProperties.length,
      sources_scraped: sitesToScrape.length,
      successful_sources: scrapingResults.filter(r => r.success).length,
      location: location,
      property_type: property_type,
      budget_range: budget_range,
      power_requirements: power_requirements,
      test_mode: test_mode,
      real_data_only: true
    }
  };
}
