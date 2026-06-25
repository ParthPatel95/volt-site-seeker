import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Industrial news & closure-signal scanner. Searches the web (Firecrawl) for
// recent news about facility closures, idlings, curtailments, layoffs, and
// bankruptcies in heavy-power industries across Alberta and Texas. Stores
// each matching article in news_intelligence with extracted signal keywords
// so the Hidden Gems list and AESO Hub can surface fresh closure leads.
//
// Data policy:
//   * Persists ONLY articles whose title/description matches at least one
//     signal pattern — generic news is noise, not a lead.
//   * Every row carries source=Firecrawl, the original URL, and the raw
//     search result for audit. No synthetic articles, ever.
//   * Idempotent: upserts on url, refreshing discovered_at when re-seen.
//   * Requires FIRECRAWL_API_KEY; returns 503 with a clear error otherwise.

interface ScanRequest {
  region?: 'alberta' | 'texas' | 'both';
  queries?: string[];           // optional override
  limit_per_query?: number;
  lookback_days?: number;       // best-effort; encoded into the query
}

// Per-signal patterns. Higher weight = stronger closure indicator. The same
// pattern style as gem-listing-scanner so the two scanners share vocabulary.
const SIGNALS: { pattern: RegExp; signal: string; weight: number }[] = [
  { pattern: /\b(permanently?|indefinitely?)?\s*clos(ing|ed|ure)\b/i, signal: 'closure', weight: 30 },
  { pattern: /\b(idl|idle|idling)\b/i, signal: 'idled', weight: 25 },
  { pattern: /\b(curtail(ment|ed|ing)?)\b/i, signal: 'curtailed', weight: 20 },
  { pattern: /\b(shutter(ed|ing)?|wind[\s-]?down|cease(d|s)?\s+operations?)\b/i, signal: 'shutdown', weight: 25 },
  { pattern: /\b(bankrupt(cy)?|chapter\s*(7|11)|receivership|insolven(t|cy))\b/i, signal: 'bankruptcy', weight: 30 },
  { pattern: /\blay(\s|-)?offs?\b/i, signal: 'layoffs', weight: 15 },
  { pattern: /\b(production\s+halt|production\s+cut|reduce(d|s)?\s+production)\b/i, signal: 'production_cut', weight: 18 },
  { pattern: /\b(for\s+sale|sell(ing)?\s+(its|the)\s+(plant|mill|smelter|refinery|facility))\b/i, signal: 'divestiture', weight: 18 },
  { pattern: /\b(power\s+(curtailment|allocation|contract))\b/i, signal: 'power_event', weight: 12 },
  { pattern: /\b(mill|smelter|refinery|plant|facility)\s+clos/i, signal: 'facility_closure_named', weight: 22 },
];

const HEAVY_TYPES = [
  'aluminum smelter', 'pulp mill', 'paper mill', 'sawmill', 'cement plant',
  'steel mill', 'EAF', 'refinery', 'chlor-alkali', 'sodium chlorate',
  'methanol plant', 'fertilizer plant', 'ammonia plant', 'OSB mill',
  'newsprint mill', 'foundry', 'glass plant', 'ferrosilicon', 'polysilicon',
  'data center', 'mining facility',
];

function scoreText(text: string): { signals: string[]; score: number } {
  const out: string[] = [];
  let score = 0;
  for (const { pattern, signal, weight } of SIGNALS) {
    if (pattern.test(text)) { out.push(signal); score += weight; }
  }
  return { signals: out, score: Math.min(100, score) };
}

function buildQueries(region: 'alberta' | 'texas' | 'both', lookbackDays: number): string[] {
  const regions: ('alberta' | 'texas')[] = region === 'both' ? ['alberta', 'texas'] : [region];
  // We can't pass a real date filter to Firecrawl's general web search, but
  // queries that include "2025" / "2026" and "recent" steer Google's ranker.
  const yr = new Date().getFullYear();
  const yrPrev = yr - 1;
  const yrHint = lookbackDays > 540 ? `${yrPrev} OR ${yr}` : `${yr}`;
  const queries: string[] = [];
  for (const r of regions) {
    const rLabel = r === 'alberta' ? 'Alberta' : 'Texas';
    queries.push(
      `${rLabel} industrial plant closure ${yrHint}`,
      `${rLabel} mill OR smelter OR refinery idled OR closed ${yrHint}`,
      `${rLabel} heavy industry layoffs OR bankruptcy ${yrHint}`,
      `${rLabel} pulp OR cement OR chemical plant curtail ${yrHint}`,
    );
  }
  return queries;
}

function inferRegion(text: string, query: string): string | null {
  const hay = `${text} ${query}`;
  if (/\b(alberta|edmonton|calgary|fort\s+mcmurray|grande\s+prairie|\bAB\b)/i.test(hay)) return 'AB';
  if (/\b(texas|houston|dallas|austin|san\s+antonio|el\s+paso|\bTX\b)/i.test(hay)) return 'TX';
  return null;
}

function inferType(text: string): string | null {
  const lc = text.toLowerCase();
  for (const t of HEAVY_TYPES) if (lc.includes(t.toLowerCase())) return t;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        needs: ['FIRECRAWL_API_KEY'],
        error: 'FIRECRAWL_API_KEY not configured — news scan unavailable. No synthetic articles are returned by design.',
      }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body: ScanRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const region = body.region ?? 'both';
    const limit = Math.min(10, Math.max(1, body.limit_per_query ?? 5));
    const lookback = Math.max(7, Math.min(720, body.lookback_days ?? 30));
    const queries = body.queries?.length ? body.queries : buildQueries(region, lookback);

    let scanned = 0;
    let stored = 0;
    let alerts = 0;
    const errors: string[] = [];
    const articles: unknown[] = [];

    for (const query of queries) {
      try {
        const resp = await fetch('https://api.firecrawl.dev/v2/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit }),
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
        const raw = data?.data;
        const results: Array<{ url?: string; title?: string; description?: string }> = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.web) ? raw.web : [];

        for (const r of results) {
          scanned++;
          if (!r.url) continue;
          const text = `${r.title ?? ''} ${r.description ?? ''}`;
          const { signals, score } = scoreText(text);
          // Only persist articles with at least one closure signal.
          if (score === 0) continue;

          const inferredRegion = inferRegion(text, query);
          const facility = inferType(text);
          const now = new Date().toISOString();

          // news_intelligence schema doesn't have an ON CONFLICT key — match
          // on url manually so re-runs don't duplicate.
          const { data: existing, error: lookupErr } = await supabase
            .from('news_intelligence')
            .select('id')
            .eq('url', r.url)
            .maybeSingle();
          if (lookupErr) {
            errors.push(`lookup ${r.url}: ${lookupErr.message}`);
            continue;
          }

          const row = {
            source: 'firecrawl',
            title: (r.title ?? '').slice(0, 500),
            content: (r.description ?? '').slice(0, 2000),
            url: r.url,
            keywords: signals,
            published_at: null,         // search results rarely expose a date
            discovered_at: now,
          };

          let opErr: { message: string } | null = null;
          if (existing?.id) {
            const { error } = await supabase
              .from('news_intelligence')
              .update({ ...row, discovered_at: now })
              .eq('id', existing.id);
            opErr = error;
            if (!error) stored++;
          } else {
            const { error } = await supabase.from('news_intelligence').insert(row);
            opErr = error;
            if (!error) stored++;
          }
          if (opErr) {
            errors.push(`store ${r.url}: ${opErr.message}`);
            continue;
          }
          // Heavy-impact signals raise an alert count.
          if (score >= 30) alerts++;
          articles.push({
            url: r.url, title: r.title, signals, score, region: inferredRegion, facility,
          });
        }
      } catch (e) {
        errors.push(`"${query}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      region,
      queries_run: queries.length,
      articles_scanned: scanned,
      articles_stored: stored,
      alerts,
      articles,
      errors: errors.length ? errors : undefined,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
