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

// SEC EDGAR API for public company data and real estate assets
async function fetchSECData(ticker: string, companyName: string) {
  if (!ticker) return null;
  
  try {
    console.log(`Fetching SEC data for ticker: ${ticker}`);
    
    // First try to get CIK from company ticker lookup
    const searchUrl = `https://www.sec.gov/files/company_tickers.json`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)',
        'Accept': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      console.log('SEC search failed, trying direct CIK approach');
      return null;
    }

    const companies = await searchResponse.json();
    let cik = null;
    
    // Find CIK for the ticker
    for (const key in companies) {
      if (companies[key].ticker?.toLowerCase() === ticker.toLowerCase()) {
        cik = companies[key].cik_str.toString().padStart(10, '0');
        break;
      }
    }

    if (!cik) {
      console.log(`No CIK found for ticker: ${ticker}`);
      return null;
    }

    // Fetch recent SEC filings for real estate analysis
    const realEstateAssets = await extractRealEstateFromSECFilings(cik, ticker);

    // SEC EDGAR Company Facts API
    const secUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
    
    const response = await fetch(secUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('SEC data fetched successfully');
      
      // Extract key financial metrics
      const facts = data.facts?.['us-gaap'] || {};
      const revenues = facts.Revenues?.units?.USD || [];
      const assets = facts.Assets?.units?.USD || [];
      const liabilities = facts.Liabilities?.units?.USD || [];
      const currentAssets = facts.AssetsCurrent?.units?.USD || [];
      const currentLiabilities = facts.LiabilitiesCurrent?.units?.USD || [];
      const propertyPlantEquipment = facts.PropertyPlantAndEquipmentNet?.units?.USD || [];
      
      const latestRevenue = revenues.length > 0 ? revenues[revenues.length - 1]?.val : null;
      const latestAssets = assets.length > 0 ? assets[assets.length - 1]?.val : null;
      const latestLiabilities = liabilities.length > 0 ? liabilities[liabilities.length - 1]?.val : null;
      const latestCurrentAssets = currentAssets.length > 0 ? currentAssets[currentAssets.length - 1]?.val : null;
      const latestCurrentLiabilities = currentLiabilities.length > 0 ? currentLiabilities[currentLiabilities.length - 1]?.val : null;
      const latestPPE = propertyPlantEquipment.length > 0 ? propertyPlantEquipment[propertyPlantEquipment.length - 1]?.val : null;
      
      return {
        ticker: data.cik,
        industry: data.sic_description || null,
        sector: data.category || null,
        latest_revenue: latestRevenue,
        latest_assets: latestAssets,
        latest_liabilities: latestLiabilities,
        current_assets: latestCurrentAssets,
        current_liabilities: latestCurrentLiabilities,
        property_plant_equipment: latestPPE,
        real_estate_assets: realEstateAssets,
        debt_to_equity: latestLiabilities && latestAssets ? (latestLiabilities / (latestAssets - latestLiabilities)) : null,
        current_ratio: latestCurrentAssets && latestCurrentLiabilities ? (latestCurrentAssets / latestCurrentLiabilities) : null,
        source: 'SEC EDGAR'
      };
    } else {
      console.log(`SEC API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('SEC data fetch error:', error);
  }
  return null;
}

// Extract real estate assets from SEC filings
async function extractRealEstateFromSECFilings(cik: string, ticker: string) {
  try {
    console.log(`Extracting real estate data for CIK: ${cik}`);
    
    // Get recent filings (10-K, 10-Q)
    const filingsUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const filingsResponse = await fetch(filingsUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)',
        'Accept': 'application/json'
      }
    });

    if (!filingsResponse.ok) {
      console.log('Failed to fetch SEC filings');
      return [];
    }

    const filingsData = await filingsResponse.json();
    const recentFilings = filingsData.filings?.recent;
    
    if (!recentFilings) {
      console.log('No recent filings found');
      return [];
    }

    // Look for 10-K and 10-Q filings (most comprehensive)
    const relevantFilings = [];
    for (let i = 0; i < Math.min(recentFilings.form.length, 10); i++) {
      if (['10-K', '10-Q'].includes(recentFilings.form[i])) {
        relevantFilings.push({
          accessionNumber: recentFilings.accessionNumber[i],
          form: recentFilings.form[i],
          filingDate: recentFilings.filingDate[i]
        });
      }
    }

    // Parse the most recent 10-K for property information
    const realEstateAssets = [];
    
    if (relevantFilings.length > 0) {
      const filing = relevantFilings[0];
      const propertyData = await parseFilingForRealEstate(cik, filing.accessionNumber, ticker);
      realEstateAssets.push(...propertyData);
    }

    return realEstateAssets;
  } catch (error) {
    console.error('Error extracting real estate from SEC filings:', error);
    return [];
  }
}

// Parse individual SEC filing for real estate mentions
async function parseFilingForRealEstate(cik: string, accessionNumber: string, ticker: string) {
  try {
    // Construct filing URL
    const cleanAccession = accessionNumber.replace(/-/g, '');
    const filingUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${cleanAccession}/${accessionNumber}.txt`;
    
    console.log(`Parsing filing: ${filingUrl}`);
    
    const response = await fetch(filingUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)'
      }
    });

    if (!response.ok) {
      console.log(`Failed to fetch filing document: ${response.status}`);
      return [];
    }

    const filingText = await response.text();
    
    // Extract real estate information using pattern matching
    return extractRealEstateFromText(filingText, ticker);
    
  } catch (error) {
    console.error('Error parsing SEC filing:', error);
    return [];
  }
}

// Extract real estate locations and types from filing text
function extractRealEstateFromText(text: string, ticker: string) {
  const realEstateAssets = [];
  
  // Patterns to identify property types and locations
  const patterns = {
    headquarters: /headquarters?.*?(?:located|situated).*?in\s+([^.\n]+)/gi,
    offices: /(?:office|facility|facilities).*?(?:located|situated|in)\s+([^.\n]+)/gi,
    datacenters: /(?:data\s*center|datacenter|server\s*farm).*?(?:located|situated|in)\s+([^.\n]+)/gi,
    manufacturing: /(?:manufacturing|production|plant|factory).*?(?:located|situated|in)\s+([^.\n]+)/gi,
    distribution: /(?:distribution|warehouse|fulfillment).*?(?:center|facility).*?(?:located|situated|in)\s+([^.\n]+)/gi,
    retail: /(?:retail|store|showroom).*?(?:located|situated|in)\s+([^.\n]+)/gi
  };

  // Property section indicators
  const propertySectionRegex = /(Item\s+2\.|PROPERTIES|Real\s+Estate|FACILITIES)/i;
  const propertySection = text.match(propertySectionRegex);
  
  let searchText = text;
  if (propertySection) {
    const sectionIndex = text.indexOf(propertySection[0]);
    // Extract next 5000 characters after property section
    searchText = text.substring(sectionIndex, sectionIndex + 5000);
  }

  // Extract locations for each property type
  Object.entries(patterns).forEach(([type, pattern]) => {
    const matches = [...searchText.matchAll(pattern)];
    
    matches.forEach((match) => {
      const locationText = match[1]?.trim();
      if (locationText && locationText.length > 3 && locationText.length < 100) {
        const coordinates = extractCoordinatesFromLocation(locationText);
        
        realEstateAssets.push({
          id: `${ticker}-${type}-${realEstateAssets.length}`,
          company_ticker: ticker,
          property_type: mapPropertyType(type),
          location_description: locationText,
          coordinates: coordinates,
          source: 'SEC Filing',
          raw_text: match[0].substring(0, 200) // First 200 chars for context
        });
      }
    });
  });

  return realEstateAssets;
}

// Map internal types to standardized property types
function mapPropertyType(internalType: string) {
  const typeMapping = {
    'headquarters': 'Office',
    'offices': 'Office', 
    'datacenters': 'Data Center',
    'manufacturing': 'Industrial',
    'distribution': 'Industrial',
    'retail': 'Office'
  };
  
  return typeMapping[internalType] || 'Other Industrial Asset';
}

// Extract approximate coordinates from location description
function extractCoordinatesFromLocation(locationText: string) {
  // Common US city coordinates (this would be enhanced with a geocoding service)
  const cityCoordinates: { [key: string]: [number, number] } = {
    'new york': [-74.0059, 40.7128],
    'los angeles': [-118.2437, 34.0522],
    'chicago': [-87.6298, 41.8781],
    'houston': [-95.3698, 29.7604],
    'dallas': [-96.7970, 32.7767],
    'austin': [-97.7431, 30.2672],
    'san francisco': [-122.4194, 37.7749],
    'seattle': [-122.3321, 47.6062],
    'atlanta': [-84.3880, 33.7490],
    'boston': [-71.0589, 42.3601],
    'denver': [-104.9903, 39.7392],
    'miami': [-80.1918, 25.7617],
    'phoenix': [-112.0740, 33.4484],
    'philadelphia': [-75.1652, 39.9526],
    'san diego': [-117.1611, 32.7157],
    'las vegas': [-115.1398, 36.1699],
    'portland': [-122.6765, 45.5152],
    'nashville': [-86.7816, 36.1627],
    'sacramento': [-121.4684, 38.5816],
    'kansas city': [-94.5786, 39.0997],
    'columbus': [-82.9988, 39.9612],
    'charlotte': [-80.8431, 35.2271],
    'detroit': [-83.0458, 42.3314],
    'milwaukee': [-87.9065, 43.0389],
    'baltimore': [-76.6122, 39.2904],
    'washington': [-77.0369, 38.9072],
    'minneapolis': [-93.2650, 44.9778],
    'san antonio': [-98.4936, 29.4241],
    'orlando': [-81.3792, 28.5383],
    'tampa': [-82.4572, 27.9506],
    'pittsburgh': [-79.9959, 40.4406],
    'cincinnati': [-84.5120, 39.1031],
    'cleveland': [-81.6944, 41.4993],
    'raleigh': [-78.6382, 35.7796],
    'virginia beach': [-75.9780, 36.8529],
    'omaha': [-95.9345, 41.2524],
    'california': [-119.4179, 36.7783],
    'texas': [-99.9018, 31.9686],
    'florida': [-81.5158, 27.7663],
    'new york state': [-74.2179, 43.2994],
    'illinois': [-89.3985, 40.6331],
    'pennsylvania': [-77.1945, 41.2033],
    'ohio': [-82.7649, 40.3888],
    'georgia': [-83.1137, 32.3617],
    'north carolina': [-78.6569, 35.7596],
    'michigan': [-84.5467, 44.3467],
    'new jersey': [-74.7429, 40.0583],
    'virginia': [-78.6569, 37.4316],
    'washington state': [-120.7401, 47.7511],
    'arizona': [-111.4312, 34.0489],
    'massachusetts': [-71.3824, 42.2373],
    'tennessee': [-86.7816, 35.7449],
    'indiana': [-86.1349, 40.2732],
    'missouri': [-91.8318, 38.5767],
    'maryland': [-76.6413, 39.0639],
    'wisconsin': [-89.6165, 44.2619],
    'colorado': [-105.3111, 39.0598],
    'minnesota': [-93.9002, 46.3294],
    'south carolina': [-80.9007, 33.8361],
    'alabama': [-86.7916, 32.3668],
    'louisiana': [-91.8749, 30.9843],
    'kentucky': [-84.86, 37.8393],
    'oregon': [-122.0709, 44.9778],
    'oklahoma': [-96.9289, 35.4676],
    'connecticut': [-72.7559, 41.5978],
    'utah': [-111.8910, 40.1500],
    'iowa': [-93.620, 41.878],
    'nevada': [-117.055, 38.313],
    'arkansas': [-92.373, 34.969],
    'mississippi': [-89.678, 32.741],
    'kansas': [-96.726, 38.5266],
    'new mexico': [-106.248, 34.840],
    'nebraska': [-99.901, 41.125],
    'west virginia': [-80.954, 38.491],
    'idaho': [-114.478, 44.240],
    'hawaii': [-157.826, 21.315],
    'new hampshire': [-71.549, 43.452],
    'maine': [-69.765, 44.693],
    'montana': [-110.454, 47.050],
    'rhode island': [-71.511, 41.680],
    'delaware': [-75.507, 39.318],
    'south dakota': [-99.784, 44.299],
    'north dakota': [-99.784, 47.528],
    'alaska': [-152.404, 61.270],
    'vermont': [-72.710, 44.045],
    'wyoming': [-107.30, 42.750]
  };

  const normalizedLocation = locationText.toLowerCase();
  
  // Try to find city match first
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalizedLocation.includes(city)) {
      return coords;
    }
  }

  // If no specific match, return null for manual geocoding later
  return null;
}

// Alpha Vantage API for real-time financial data
async function fetchAlphaVantageData(ticker: string) {
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  if (!apiKey || !ticker) {
    console.log('Alpha Vantage API key not available or no ticker provided');
    return null;
  }

  try {
    console.log(`Fetching Alpha Vantage data for ticker: ${ticker}`);
    
    // Company Overview
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(overviewUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.Symbol && !data.Note && !data['Error Message']) {
        console.log('Alpha Vantage data fetched successfully');
        return {
          market_cap: data.MarketCapitalization ? parseInt(data.MarketCapitalization) : null,
          pe_ratio: data.PERatio ? parseFloat(data.PERatio) : null,
          profit_margin: data.ProfitMargin ? parseFloat(data.ProfitMargin) * 100 : null,
          revenue_growth: data.QuarterlyRevenueGrowthYOY ? parseFloat(data.QuarterlyRevenueGrowthYOY) * 100 : null,
          debt_to_equity: data.DebtToEquityRatio ? parseFloat(data.DebtToEquityRatio) : null,
          current_ratio: data.CurrentRatio ? parseFloat(data.CurrentRatio) : null,
          dividend_yield: data.DividendYield ? parseFloat(data.DividendYield) * 100 : null,
          industry: data.Industry || null,
          sector: data.Sector || null,
          source: 'Alpha Vantage'
        };
      } else {
        console.log('Alpha Vantage returned error or no data:', data.Note || data['Error Message']);
      }
    } else {
      console.log(`Alpha Vantage API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('Alpha Vantage data fetch error:', error);
  }
  return null;
}

// Yahoo Finance scraping for additional data
async function scrapeYahooFinance(ticker: string) {
  if (!ticker) return null;
  
  try {
    console.log(`Scraping Yahoo Finance for ticker: ${ticker}`);
    
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.ok) {
      const html = await response.text();
      console.log('Yahoo Finance data scraped successfully');
      
      // Extract market cap using regex patterns
      const marketCapMatch = html.match(/Market Cap[^>]*>([^<]+)</i);
      const peRatioMatch = html.match(/PE Ratio[^>]*>([^<]+)</i);
      const volumeMatch = html.match(/Volume[^>]*>([^<]+)</i);
      
      return {
        market_cap_text: marketCapMatch?.[1]?.trim() || null,
        pe_ratio_text: peRatioMatch?.[1]?.trim() || null,
        volume_text: volumeMatch?.[1]?.trim() || null,
        source: 'Yahoo Finance'
      };
    } else {
      console.log(`Yahoo Finance returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('Yahoo Finance scraping error:', error);
  }
  return null;
}

// OpenCorporates API for company registration data
async function fetchOpenCorporatesData(companyName: string) {
  if (!companyName) return null;
  
  try {
    console.log(`Fetching OpenCorporates data for: ${companyName}`);
    
    const searchUrl = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&format=json&per_page=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'VoltScout Corporate Intelligence (contact@voltscout.com)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const companies = data.results?.companies || [];
      
      if (companies.length > 0) {
        const company = companies[0].company;
        console.log('OpenCorporates data fetched successfully');
        return {
          incorporation_date: company.incorporation_date,
          company_type: company.company_type,
          jurisdiction: company.jurisdiction_code,
          status: company.company_status,
          registered_address: company.registered_address_in_full,
          source: 'OpenCorporates'
        };
      } else {
        console.log('No companies found in OpenCorporates');
      }
    } else {
      console.log(`OpenCorporates API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('OpenCorporates data fetch error:', error);
  }
  return null;
}

// News API for recent company mentions
async function fetchCompanyNews(companyName: string) {
  const apiKey = Deno.env.get('NEWS_API_KEY');
  if (!apiKey || !companyName) {
    console.log('News API key not available or no company name provided');
    return [];
  }

  try {
    console.log(`Fetching news for: ${companyName}`);
    
    const url = `https://newsapi.org/v2/everything?q="${companyName}"&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        console.log(`Found ${data.articles.length} news articles`);
        return data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          published_at: article.publishedAt,
          source: article.source.name
        }));
      } else {
        console.log('No news articles found');
      }
    } else {
      console.log(`News API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('News API error:', error);
  }
  return [];
}

// Calculate financial health score based on real metrics
function calculateFinancialHealthScore(metrics: any) {
  let score = 50; // Base score
  let factors = 0;
  
  // Debt to equity ratio (lower is better)
  if (metrics.debt_to_equity !== null && metrics.debt_to_equity !== undefined) {
    factors++;
    if (metrics.debt_to_equity < 0.3) score += 20;
    else if (metrics.debt_to_equity < 0.6) score += 10;
    else if (metrics.debt_to_equity > 1.5) score -= 20;
    else if (metrics.debt_to_equity > 2.0) score -= 30;
  }
  
  // Current ratio (higher is better)
  if (metrics.current_ratio !== null && metrics.current_ratio !== undefined) {
    factors++;
    if (metrics.current_ratio > 2) score += 15;
    else if (metrics.current_ratio > 1.5) score += 10;
    else if (metrics.current_ratio < 1) score -= 15;
    else if (metrics.current_ratio < 0.5) score -= 25;
  }
  
  // Profit margin (higher is better)
  if (metrics.profit_margin !== null && metrics.profit_margin !== undefined) {
    factors++;
    if (metrics.profit_margin > 20) score += 15;
    else if (metrics.profit_margin > 10) score += 10;
    else if (metrics.profit_margin > 5) score += 5;
    else if (metrics.profit_margin < 0) score -= 20;
  }
  
  // Revenue growth (positive is better)
  if (metrics.revenue_growth !== null && metrics.revenue_growth !== undefined) {
    factors++;
    if (metrics.revenue_growth > 15) score += 10;
    else if (metrics.revenue_growth > 5) score += 5;
    else if (metrics.revenue_growth < -10) score -= 15;
    else if (metrics.revenue_growth < -20) score -= 25;
  }
  
  // Adjust score based on number of factors available
  if (factors === 0) return null; // No data available
  if (factors < 3) score -= 10; // Penalize for limited data
  
  return Math.max(0, Math.min(100, score));
}

// Estimate power usage based on industry and company size
function estimatePowerUsage(industry: string, marketCap: number | null, sector: string) {
  const industryMultipliers: Record<string, number> = {
    'Technology': 2.5,
    'Software': 1.8,
    'Semiconductors': 4.5,
    'Data Processing & Outsourced Services': 8.0,
    'Internet & Direct Marketing Retail': 3.0,
    'Manufacturing': 4.0,
    'Mining': 8.0,
    'Steel': 6.0,
    'Aluminum': 7.5,
    'Automotive': 3.5,
    'Chemical': 5.0,
    'Cement': 6.5,
    'Paper': 4.5,
    'Glass': 5.5,
    'Cryptocurrency': 12.0,
    'Bitcoin Mining': 15.0,
    'Data Centers': 10.0,
    'Cloud Computing': 8.5,
    'default': 2.0
  };
  
  // Check for exact industry match first, then sector
  let multiplier = industryMultipliers[industry] || industryMultipliers[sector] || industryMultipliers.default;
  
  // Special case for crypto/mining companies
  const cryptoKeywords = ['bitcoin', 'crypto', 'mining', 'blockchain', 'digital asset'];
  const companyIndicators = [industry, sector].join(' ').toLowerCase();
  for (const keyword of cryptoKeywords) {
    if (companyIndicators.includes(keyword)) {
      multiplier = Math.max(multiplier, 10.0);
      break;
    }
  }
  
  if (marketCap) {
    // Base estimation: power usage correlates with company size
    const baseUsage = Math.log10(marketCap / 1000000) * 15; // MW
    return Math.round(Math.max(baseUsage * multiplier, 1));
  }
  
  return Math.round(Math.max(multiplier * 25, 5)); // Default estimate with minimum
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Corporate Intelligence action: ${action}`, params);

    switch (action) {
      case 'analyze_company': {
        const { company_name, ticker } = params;
        
        if (!company_name?.trim()) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Company name is required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        console.log(`Analyzing company: ${company_name} (ticker: ${ticker || 'none'})`);
        
        // Fetch data from multiple sources in parallel
        const dataPromises = [
          ticker ? fetchSECData(ticker, company_name) : Promise.resolve(null),
          ticker ? fetchAlphaVantageData(ticker) : Promise.resolve(null),
          ticker ? scrapeYahooFinance(ticker) : Promise.resolve(null),
          fetchOpenCorporatesData(company_name),
          fetchCompanyNews(company_name)
        ];

        const [secData, alphaVantageData, yahooData, corporatesData, newsData] = await Promise.allSettled(dataPromises);

        // Extract successful results
        const sec = secData.status === 'fulfilled' ? secData.value : null;
        const alpha = alphaVantageData.status === 'fulfilled' ? alphaVantageData.value : null;
        const yahoo = yahooData.status === 'fulfilled' ? yahooData.value : null;
        const corporates = corporatesData.status === 'fulfilled' ? corporatesData.value : null;
        const news = newsData.status === 'fulfilled' ? newsData.value : [];

        console.log('Data sources results:', { 
          sec: !!sec, 
          alpha: !!alpha, 
          yahoo: !!yahoo, 
          corporates: !!corporates,
          news: news.length,
          realEstateAssets: sec?.real_estate_assets?.length || 0
        });

        // Combine data from all sources, prioritizing real data
        const combinedData = {
          name: company_name,
          ticker: ticker || sec?.ticker || null,
          industry: alpha?.industry || sec?.industry || 'Unknown',
          sector: alpha?.sector || sec?.sector || 'Unknown',
          market_cap: alpha?.market_cap || null,
          revenue_growth: alpha?.revenue_growth || null,
          profit_margin: alpha?.profit_margin || null,
          debt_to_equity: alpha?.debt_to_equity || sec?.debt_to_equity || null,
          current_ratio: alpha?.current_ratio || sec?.current_ratio || null,
          incorporation_date: corporates?.incorporation_date || null,
          company_status: corporates?.status || null,
          jurisdiction: corporates?.jurisdiction || null,
          registered_address: corporates?.registered_address || null,
          real_estate_assets: sec?.real_estate_assets || [],
          recent_news: news,
          data_sources: {
            sec: !!sec,
            alpha_vantage: !!alpha,
            yahoo_finance: !!yahoo,
            open_corporates: !!corporates,
            news_api: news.length > 0
          },
          analyzed_at: new Date().toISOString()
        };

        // Calculate financial health score
        const financialHealthScore = calculateFinancialHealthScore(combinedData);
        
        // Estimate power usage
        const powerUsageEstimate = estimatePowerUsage(
          combinedData.industry, 
          combinedData.market_cap, 
          combinedData.sector
        );

        // Detect distress signals based on real data
        const distressSignals = [];
        if (combinedData.debt_to_equity && combinedData.debt_to_equity > 2) {
          distressSignals.push('High debt-to-equity ratio (>2.0)');
        }
        if (combinedData.current_ratio && combinedData.current_ratio < 1) {
          distressSignals.push('Low current ratio - liquidity concerns');
        }
        if (combinedData.revenue_growth && combinedData.revenue_growth < -15) {
          distressSignals.push('Significant revenue decline');
        }
        if (combinedData.profit_margin && combinedData.profit_margin < 0) {
          distressSignals.push('Negative profit margins');
        }
        if (corporates?.status && corporates.status.toLowerCase().includes('inactive')) {
          distressSignals.push('Inactive corporate status');
        }

        const analysisResult = {
          ...combinedData,
          financial_health_score: financialHealthScore,
          power_usage_estimate: powerUsageEstimate,
          distress_signals: distressSignals,
          locations: sec?.real_estate_assets || [],
          data_quality: {
            sources_used: Object.values(combinedData.data_sources).filter(Boolean).length,
            has_financial_data: !!(alpha || sec),
            has_corporate_data: !!corporates,
            has_recent_news: news.length > 0,
            has_real_estate_data: (sec?.real_estate_assets?.length || 0) > 0
          }
        };

        // Store real estate assets separately if they exist
        if (sec?.real_estate_assets && sec.real_estate_assets.length > 0) {
          try {
            // Store in a separate table for mapping
            const { error: realEstateError } = await supabase
              .from('company_real_estate_assets')
              .upsert(
                sec.real_estate_assets.map((asset: any) => ({
                  ...asset,
                  company_name: company_name,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })),
                { onConflict: 'id' }
              );
              
            if (realEstateError) {
              console.error('Error storing real estate assets:', realEstateError);
            }
          } catch (err) {
            console.error('Error processing real estate assets:', err);
          }
        }

        // Check if company already exists by name
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', company_name)
          .maybeSingle();

        let data;
        if (existingCompany) {
          console.log('Updating existing company');
          const { data: updateData, error } = await supabase
            .from('companies')
            .update(analysisResult)
            .eq('id', existingCompany.id)
            .select()
            .single();

          if (error) {
            console.error('Error updating company:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `Failed to update company: ${error.message}`
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          data = updateData;
        } else {
          console.log('Creating new company record');
          const { data: insertData, error } = await supabase
            .from('companies')
            .insert(analysisResult)
            .select()
            .single();

          if (error) {
            console.error('Error saving company:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `Failed to save company: ${error.message}`
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          data = insertData;
        }

        return new Response(JSON.stringify({
          success: true,
          company: data,
          data_quality: analysisResult.data_quality,
          real_estate_count: sec?.real_estate_assets?.length || 0,
          message: `Successfully analyzed ${company_name} using ${analysisResult.data_quality.sources_used} data sources. Found ${sec?.real_estate_assets?.length || 0} real estate assets.`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'ai_analyze_company': {
        const { company_name } = params;
        
        const mockAnalysis = {
          company_name,
          financial_outlook: 'Positive growth trajectory with strong fundamentals',
          risk_assessment: 'Low to moderate risk profile',
          investment_recommendation: 'BUY',
          power_consumption_analysis: 'High energy intensity operations suitable for data center conversion',
          key_insights: [
            'Strong cash flow generation',
            'Expanding market presence',
            'Energy-intensive operations'
          ],
          distress_probability: Math.random() * 0.3,
          acquisition_readiness: Math.random() * 0.8 + 0.2,
          analyzed_at: new Date().toISOString()
        };

        const { data: aiData, error: aiError } = await supabase
          .from('ai_company_analysis')
          .insert(mockAnalysis)
          .select()
          .single();

        if (aiError) {
          console.error('Error saving AI analysis:', aiError);
        }

        return new Response(JSON.stringify({
          success: true,
          analysis: mockAnalysis
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'generate_due_diligence': {
        const { company_id } = params;
        
        const mockReport = {
          company_id,
          report_type: 'comprehensive',
          executive_summary: 'Strong acquisition candidate with excellent power infrastructure potential',
          financial_analysis: {
            revenue_trend: 'Growing',
            profitability: 'High',
            debt_levels: 'Manageable'
          },
          risk_assessment: {
            market_risk: 'Low',
            operational_risk: 'Medium',
            financial_risk: 'Low'
          },
          power_infrastructure_assessment: {
            current_consumption: '45 MW',
            expansion_potential: '200 MW',
            grid_connectivity: 'Excellent'
          },
          recommendations: [
            'Proceed with acquisition',
            'Negotiate power infrastructure rights',
            'Plan for data center conversion'
          ]
        };

        const { data, error } = await supabase
          .from('due_diligence_reports')
          .insert(mockReport)
          .select()
          .single();

        if (error) {
          console.error('Error saving due diligence report:', error);
        }

        return new Response(JSON.stringify({
          success: true,
          report: mockReport
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_market_timing': {
        const { company_id } = params;
        
        const mockTiming = {
          company_id,
          market_cycle_phase: 'Mid-Cycle',
          fire_sale_probability: Math.random() * 0.4,
          market_conditions_score: Math.floor(Math.random() * 30) + 70,
          timing_recommendation: 'Optimal acquisition window',
          institutional_activity_level: 'Normal',
          optimal_acquisition_window: {
            start: '2024-Q1',
            end: '2024-Q3'
          }
        };

        return new Response(JSON.stringify({
          success: true,
          timing: mockTiming
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_supply_chain': {
        const { company_id } = params;
        
        const mockSupplyChain = {
          company_id,
          critical_components: ['Semiconductors', 'Raw materials'],
          supplier_dependencies: ['Asia-Pacific suppliers', 'Single-source suppliers'],
          disruption_risks: {
            geographic_concentration: 'High',
            single_points_of_failure: 'Medium'
          },
          geographic_exposure: {
            'Asia-Pacific': 0.78,
            'Europe': 0.15,
            'North America': 0.07
          }
        };

        return new Response(JSON.stringify({
          success: true,
          analysis: mockSupplyChain
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_news_intelligence': {
        const mockNews = [
          {
            title: 'Company Expands Data Center Operations',
            content: 'Major expansion announced for Q4 operations',
            source: 'TechNews',
            published_at: new Date().toISOString(),
            keywords: ['expansion', 'data center', 'growth']
          },
          {
            title: 'Energy Efficiency Initiative Launched',
            content: 'New sustainability program focuses on power optimization',
            source: 'EnergyReport',
            published_at: new Date().toISOString(),
            keywords: ['energy', 'efficiency', 'sustainability']
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          news: mockNews
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_competitor_analysis': {
        const mockCompetitors = [
          {
            name: 'TechCorp Inc',
            market_share: 0.15,
            power_usage: 85,
            competitive_position: 'Strong'
          },
          {
            name: 'DataSystems LLC',
            market_share: 0.12,
            power_usage: 65,
            competitive_position: 'Moderate'
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          competitors: mockCompetitors
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_social_sentiment': {
        const mockSentiment = {
          overall_score: Math.floor(Math.random() * 40) + 60,
          sentiment_trend: 'Positive',
          key_topics: ['innovation', 'growth', 'sustainability'],
          platform_breakdown: {
            twitter: 0.72,
            linkedin: 0.85,
            reddit: 0.58
          }
        };

        return new Response(JSON.stringify({
          success: true,
          sentiment: mockSentiment
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'calculate_investment_score': {
        const mockScore = {
          overall_score: Math.floor(Math.random() * 30) + 70,
          risk_score: Math.floor(Math.random() * 20) + 60,
          opportunity_score: Math.floor(Math.random() * 25) + 75,
          timing_score: Math.floor(Math.random() * 20) + 70,
          confidence_level: Math.floor(Math.random() * 20) + 80,
          recommendation: 'BUY',
          key_factors: ['Strong financials', 'Power infrastructure potential', 'Market position'],
          risk_factors: ['Market volatility', 'Regulatory changes']
        };

        return new Response(JSON.stringify({
          success: true,
          score: mockScore
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'forecast_power_demand': {
        const mockForecast = {
          current_consumption: Math.floor(Math.random() * 100) + 50,
          projected_6_months: Math.floor(Math.random() * 120) + 60,
          projected_12_months: Math.floor(Math.random() * 150) + 80,
          growth_drivers: ['Expansion plans', 'New facilities', 'Technology upgrades'],
          confidence_score: Math.floor(Math.random() * 20) + 80
        };

        return new Response(JSON.stringify({
          success: true,
          forecast: mockForecast
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'analyze_esg': {
        const mockESG = {
          environmental_score: Math.floor(Math.random() * 30) + 70,
          social_score: Math.floor(Math.random() * 25) + 65,
          governance_score: Math.floor(Math.random() * 20) + 75,
          overall_esg_score: Math.floor(Math.random() * 25) + 70,
          carbon_footprint_mt: Math.floor(Math.random() * 10000) + 5000,
          renewable_energy_percent: Math.random() * 60 + 20
        };

        return new Response(JSON.stringify({
          success: true,
          esg: mockESG
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'optimize_portfolio': {
        const mockOptimization = {
          recommended_allocation: {
            'Technology': 0.4,
            'Manufacturing': 0.3,
            'Energy': 0.2,
            'Other': 0.1
          },
          diversification_score: Math.floor(Math.random() * 20) + 80,
          risk_adjusted_return: Math.random() * 0.15 + 0.08,
          recommendations: [
            'Increase technology sector allocation',
            'Diversify geographic exposure',
            'Focus on power-intensive industries'
          ]
        };

        return new Response(JSON.stringify({
          success: true,
          optimization: mockOptimization
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'natural_language_query': {
        const { query } = params;
        
        const mockResponse = {
          query,
          answer: `Based on our analysis, here are the key insights: The market shows strong potential for power-intensive acquisitions with favorable timing conditions. Current energy rates support profitable operations.`,
          confidence: Math.random() * 0.3 + 0.7,
          sources: ['Market analysis', 'Energy rate data', 'Company financials']
        };

        return new Response(JSON.stringify({
          success: true,
          response: mockResponse
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error('Error in corporate intelligence:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred',
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
