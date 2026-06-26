import { corsHeaders } from "../_shared/cors.ts";
import { requireUserOrService } from "../_shared/guard.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Hidden Gems listing scanner — searches commercial real-estate listings for
// acquisition signals (substation on site, MW capacity quoted, former plant,
// transmission frontage) via the Firecrawl search API.
//
// Data policy: this function ONLY persists rows derived from live Firecrawl
// responses. If FIRECRAWL_API_KEY is missing or the API fails, it returns an
// error — it never falls back to demo/synthetic listings. Each stored row
// keeps the raw search-result payload for audit.

interface ScanRequest {
  region?: 'alberta' | 'texas' | 'both';
  queries?: string[];     // optional override of the default query set
  limit_per_query?: number;
}

// Mirrors LISTING_SIGNALS in src/lib/hidden-gems.ts — keep in sync; the
// vitest suite over the src copy is the source of truth for weights.
const LISTING_SIGNALS: { pattern: RegExp; signal: string; weight: number }[] = [
  { pattern: /\bsubstation\b/i, signal: 'substation', weight: 25 },
  { pattern: /\b\d+(\.\d+)?\s*(mw|megawatt)/i, signal: 'mw_capacity', weight: 25 },
  { pattern: /\b\d+(\.\d+)?\s*(mva|kva)\b/i, signal: 'transformer_capacity', weight: 20 },
  { pattern: /\btransmission\s+line/i, signal: 'transmission_line', weight: 15 },
  { pattern: /\b(former|closed|decommissioned|idled?|shuttered)\s+(\w+\s+)?(plant|mill|smelter|refinery|factory|facility)/i, signal: 'former_plant', weight: 20 },
  { pattern: /\b(heavy|industrial)\s+power\b/i, signal: 'heavy_power', weight: 10 },
  { pattern: /\bhigh[\s-]?voltage\b/i, signal: 'high_voltage', weight: 10 },
  { pattern: /\brail\s*(spur|served|access)/i, signal: 'rail_access', weight: 8 },
  { pattern: /\bnatural\s+gas\s+(line|service|pipeline)/i, signal: 'gas_service', weight: 6 },
  { pattern: /\bdata\s*cent(er|re)\s*(ready|zoned|approved)/i, signal: 'dc_ready', weight: 12 },
  { pattern: /\bpower\s+(purchase|contract|agreement|allocation)\b/i, signal: 'power_contract', weight: 12 },
  { pattern: /\bcrypto|bitcoin|mining\s+facility\b/i, signal: 'crypto_history', weight: 8 },
];

function scoreListingText(text: string): { signals: string[]; score: number } {
  const signals: string[] = [];
  let score = 0;
  for (const { pattern, signal, weight } of LISTING_SIGNALS) {
    if (pattern.test(text)) {
      signals.push(signal);
      score += weight;
    }
  }
  return { signals, score: Math.min(100, score) };
}

const DEFAULT_QUERIES: Record<'alberta' | 'texas', string[]> = {
  alberta: [
    'industrial plant for sale Alberta substation',
    'former mill for sale Alberta power',
    'industrial land for sale Alberta transmission line MW',
    'heavy industrial property for sale Alberta high voltage',
  ],
  texas: [
    'industrial plant for sale Texas substation',
    'former plant smelter for sale Texas power capacity',
    'industrial land for sale Texas transmission MW',
    'heavy industrial property for sale Texas high voltage rail',
  ],
};

function inferState(text: string, query: string): string | null {
  const haystack = `${text} ${query}`;
  if (/\b(alberta|edmonton|calgary|\bAB\b)/i.test(haystack)) return 'AB';
  if (/\b(texas|houston|dallas|austin|san antonio|\bTX\b)/i.test(haystack)) return 'TX';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      // Hard fail by policy — no synthetic listings, ever.
      return new Response(JSON.stringify({
        success: false,
        error: 'FIRECRAWL_API_KEY not configured — listing scan unavailable. No placeholder data is returned by design.',
      }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Gated: invoked server-to-server by scraping-orchestrator (service
    // role) or directly from the authenticated Hidden Gems UI. Never public.
    // (Audit-2026-06-25 PR3.)
    const gate = await requireUserOrService(req, supabase);
    if (gate instanceof Response) return gate;

    const body: ScanRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const region = body.region ?? 'both';
    const limitPerQuery = Math.min(10, Math.max(1, body.limit_per_query ?? 5));

    const queries = body.queries?.length
      ? body.queries
      : region === 'both'
        ? [...DEFAULT_QUERIES.alberta, ...DEFAULT_QUERIES.texas]
        : DEFAULT_QUERIES[region];

    let scanned = 0;
    let stored = 0;
    let skipped_non_listing = 0;
    const errors: string[] = [];
    const found: unknown[] = [];

    for (const query of queries) {
      try {
        const resp = await fetch('https://api.firecrawl.dev/v2/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit: limitPerQuery }),
        });

        if (!resp.ok) {
          let bodyText = '';
          try { bodyText = await resp.text(); } catch { /* ignore */ }
          if (resp.status === 402) {
            errors.push(`"${query}" -> Firecrawl 402 insufficient credits${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`);
          } else {
            errors.push(`"${query}" -> HTTP ${resp.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ''}`);
          }
          continue;
        }

        const data = await resp.json();
        // Firecrawl v2 returns { data: { web: [...] } } | { data: [...] }
        const raw = data?.data;
        const results: Array<{ url?: string; title?: string; description?: string }> = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.web) ? raw.web : [];

        for (const r of results) {
          scanned++;
          if (!r.url) continue;
          // Skip obvious non-listings — social, video, and forum hosts pollute
          // Hidden Gems with weak keyword matches that aren't real properties.
          try {
            const host = new URL(r.url).hostname.toLowerCase();
            const NON_LISTING_HOSTS = [
              'youtube.com', 'youtu.be', 'm.youtube.com',
              'facebook.com', 'm.facebook.com', 'instagram.com',
              'twitter.com', 'x.com', 'tiktok.com', 'reddit.com',
              'linkedin.com', 'pinterest.com',
            ];
            if (NON_LISTING_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
              skipped_non_listing++;
              continue;
            }
          } catch { /* malformed URL — let it through to the upsert which will error visibly */ }
          const text = `${r.title ?? ''} ${r.description ?? ''}`;
          const { signals, score } = scoreListingText(text);
          // Only persist listings that show at least one gem signal — plain
          // listings are noise, not leads.
          if (score === 0) continue;

          const now = new Date().toISOString();
          const row = {
            listing_url: r.url,
            title: r.title ?? null,
            description_excerpt: (r.description ?? '').slice(0, 500) || null,
            state: inferState(text, query),
            gem_signals: signals,
            signal_score: score,
            search_query: query,
            source: 'firecrawl',
            scraped_at: now,
            // Every successful re-observation refreshes last_seen_at so
            // listings that survive across scans stay non-stale. Anything
            // not re-seen past the stale threshold gets flipped below.
            last_seen_at: now,
            is_stale: false,
            raw: r,
          };

          const { error } = await supabase
            .from('gem_listings')
            .upsert(row, { onConflict: 'listing_url' });
          if (error) {
            errors.push(`upsert ${r.url}: ${error.message}`);
          } else {
            stored++;
            found.push({ url: r.url, title: r.title, signals, score });
          }
        }
      } catch (e) {
        errors.push(`"${query}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Stale-marker pass: any active row not refreshed by this run (or recent
    // prior runs) gets `is_stale = true`. UI hides stale rows by default.
    let stale_marked = 0;
    try {
      const { data: staleData, error: staleErr } = await supabase.rpc(
        'mark_stale_gem_listings',
        { p_threshold_hours: 14 * 24 },
      );
      if (staleErr) errors.push(`stale-marker: ${staleErr.message}`);
      else if (typeof staleData === 'number') stale_marked = staleData;
    } catch (e) {
      errors.push(`stale-marker: ${e instanceof Error ? e.message : String(e)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      region,
      queries_run: queries.length,
      results_scanned: scanned,
      listings_stored: stored,
      skipped_non_listing,
      stale_marked,
      listings: found,
      errors: errors.length ? errors : undefined,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[gem-listing-scanner]', e);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
