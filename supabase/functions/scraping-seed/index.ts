import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Idempotent canonical seed for the AESO Hub Scraping orchestrator.
//
// The migration 20260618220000_aeso_hub_scraping_orchestrator.sql seeds the
// same rows, but environments where that migration didn't apply (e.g. Lovable
// preview branches, or projects where migrations are pushed manually) end up
// with the columns present but no source rows — the Scraping tab then shows
// "Ran 0 sources". This function re-inserts the canonical rows from the UI
// side as a self-heal, so the user never has to drop into SQL to bootstrap.
//
// Safe to call repeatedly: ON CONFLICT(scraper_key) DO UPDATE.

const SOURCES = [
  {
    name: 'Property listings (Hidden Gems)',
    url: 'https://api.firecrawl.dev',
    type: 'real_estate',
    status: 'active',
    keywords: ['substation', 'MW', 'transmission', 'former plant', 'high voltage', 'rail spur'],
    scraper_key: 'gem-listings',
    description:
      'Commercial real-estate listings carrying power-acquisition signals (substation on site, MW capacity quoted, former mill/plant, transmission frontage). Firecrawl web search across Alberta and Texas; results stored in gem_listings with re-seen tracking that marks stale rows after 14 days.',
    edge_function: 'gem-listing-scanner',
    default_params: { region: 'both', limit_per_query: 5 },
    required_secrets: ['FIRECRAWL_API_KEY'],
  },
  {
    name: 'Industrial news & closure signals',
    url: 'https://api.firecrawl.dev',
    type: 'news',
    status: 'active',
    keywords: ['closure', 'idled', 'curtailed', 'layoff', 'shutdown', 'bankruptcy', 'wind-down'],
    scraper_key: 'industrial-news',
    description:
      'News and press-release scan for facility status changes — closures, idlings, layoffs, bankruptcies. Same Firecrawl backend as the property scanner; results land in news_intelligence with per-article signal extraction.',
    edge_function: 'industrial-news-scanner',
    default_params: { region: 'both', lookback_days: 30, limit_per_query: 5 },
    required_secrets: ['FIRECRAWL_API_KEY'],
  },
  {
    name: 'OSM heavy-industry discovery',
    url: 'https://overpass-api.de',
    type: 'osm',
    status: 'active',
    keywords: ['man_made=works', 'landuse=industrial', 'industrial=*', 'man_made=oil_refinery'],
    scraper_key: 'osm-discovery',
    description:
      'OpenStreetMap scan for named heavy-industry sites (works, refineries, smelters, mineral extraction) not yet in the facility registry. Auto-inserts new low-confidence rows into industrial_facilities for human review; safe to re-run (skips existing OSM ids).',
    edge_function: 'osm-industrial-discovery',
    default_params: { region: 'AB', limit: 25 },
    required_secrets: null as string[] | null,
  },
  {
    name: 'Sentinel-2 closure-signal monitor',
    url: 'https://services.sentinel-hub.com',
    type: 'satellite',
    status: 'active',
    keywords: ['NDVI', 'vegetation rebound', 'closure'],
    scraper_key: 'satellite-activity',
    description:
      'Pulls Sentinel-2 NDVI time series over each facility footprint and a nearby baseline; rising vegetation over the footprint = visible-from-orbit closure signal. Stores observations + a trend score back on the facility row.',
    edge_function: 'facility-activity-monitor',
    default_params: { all_stale_days: 30, limit: 5, window_years: 3 },
    required_secrets: ['SENTINEL_HUB_CLIENT_ID', 'SENTINEL_HUB_CLIENT_SECRET'],
  },
  {
    name: 'Facility coordinate refinement',
    url: 'https://maps.googleapis.com',
    type: 'registry',
    status: 'active',
    keywords: ['Places', 'Geocoding', 'OSM parcel snap', 'multi-provider consensus'],
    scraper_key: 'facility-refine',
    description:
      'Re-geocodes unverified facilities via Google Places + Geocoding, snaps to the OSM industrial parcel polygon when possible, and records multi-provider consensus distance. Fixes "town-centre" coordinate quality for the Hidden Gems list.',
    edge_function: 'facility-refine',
    default_params: { all_unverified: true, limit: 10 },
    required_secrets: ['GOOGLE_MAPS_API_KEY'],
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Probe: does the scraper_key column even exist? If not, the migration
    // hasn't been applied and seeding can't proceed — tell the caller exactly
    // what's wrong rather than failing on the upsert with a confusing message.
    const probe = await supabase
      .from('scraping_sources')
      .select('scraper_key')
      .limit(1);
    if (probe.error && /scraper_key/i.test(probe.error.message)) {
      return new Response(JSON.stringify({
        success: false,
        needs: ['migration'],
        error:
          'Migration 20260618220000_aeso_hub_scraping_orchestrator.sql has not been applied. ' +
          'Apply it once from your project SQL editor or migration runner, then call this function again.',
      }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Idempotent UPSERT keyed on scraper_key.
    const { error: upErr, data: upserted } = await supabase
      .from('scraping_sources')
      .upsert(SOURCES, { onConflict: 'scraper_key' })
      .select('scraper_key, name, type, status');
    if (upErr) throw upErr;

    return new Response(JSON.stringify({
      success: true,
      seeded: upserted?.length ?? 0,
      sources: upserted ?? [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
