import { corsHeaders } from "../_shared/cors.ts";
import { requireUserOrService } from "../_shared/guard.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// AESO Hub central scraping orchestrator. The ScrapingTab UI calls this
// with `{ scraper_key, params? }`; the orchestrator looks up the canonical
// scraper definition (scraping_sources row by scraper_key), opens a
// scraping_jobs run, invokes the backing edge function, and writes the run
// outcome back to scraping_jobs + updates scraping_sources.last_run.
//
// One responsibility: tracking. The orchestrator never duplicates the work
// of the underlying scraper — that scraper's own data policy (idempotent
// upserts, source provenance) is preserved. We just open/close a job row
// around it.
//
// Optional batch mode: `{ scraper_key: 'all' }` runs every active source
// sequentially (one at a time — these can be expensive externally).

interface OrchestrateRequest {
  scraper_key: string;
  params?: Record<string, unknown>;
}

interface SourceRow {
  id: string;
  name: string;
  scraper_key: string;
  edge_function: string;
  type: string;
  default_params: Record<string, unknown> | null;
  required_secrets: string[] | null;
  status: string;
}

interface JobRow {
  id: string;
  scraper_key: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  items_found: number | null;
  items_new: number | null;
  result_summary: Record<string, unknown> | null;
  errors: string[] | null;
}

// Each scraper returns a different result shape. This adapter pulls the
// counts we want to record on scraping_jobs from each known shape.
function summarise(scraperKey: string, result: Record<string, unknown> | null): {
  items_found: number;
  items_new: number;
  summary: Record<string, unknown>;
  errors: string[];
} {
  if (!result) return { items_found: 0, items_new: 0, summary: {}, errors: ['empty result'] };
  const errs: string[] = Array.isArray(result.errors)
    ? (result.errors as string[])
    : typeof result.error === 'string' ? [result.error as string] : [];

  // Pull the right counts per scraper. Keep this exhaustive so a new scraper
  // added without an entry doesn't silently report zeros.
  switch (scraperKey) {
    case 'gem-listings': {
      return {
        items_found: Number(result.results_scanned ?? 0),
        items_new: Number(result.listings_stored ?? 0),
        summary: {
          queries_run: result.queries_run,
          stale_marked: result.stale_marked,
          region: result.region,
        },
        errors: errs,
      };
    }
    case 'industrial-news': {
      return {
        items_found: Number(result.articles_scanned ?? 0),
        items_new: Number(result.articles_stored ?? 0),
        summary: {
          queries_run: result.queries_run,
          region: result.region,
          alerts: result.alerts ?? 0,
        },
        errors: errs,
      };
    }
    case 'osm-discovery': {
      return {
        items_found: Number(result.candidates_seen ?? 0),
        items_new: Number(result.candidates_inserted ?? 0),
        summary: {
          region: result.region,
          skipped_existing: result.skipped_existing ?? 0,
          skipped_unknown_type: result.skipped_unknown_type ?? 0,
        },
        errors: errs,
      };
    }
    case 'satellite-activity': {
      const results = Array.isArray(result.results) ? result.results as Array<Record<string, unknown>> : [];
      const flagged = results.filter(
        (r) => r.trend === 'rising_vegetation' || r.trend === 'recovering',
      ).length;
      return {
        items_found: Number(result.checked ?? results.length),
        items_new: flagged,                // new closure signals raised
        summary: { window: result.window, flagged },
        errors: errs,
      };
    }
    case 'facility-refine': {
      const results = Array.isArray(result.results) ? result.results as Array<Record<string, unknown>> : [];
      return {
        items_found: results.length,
        items_new: Number(result.refined ?? 0),
        summary: { google_key_present: result.google_key_present },
        errors: errs,
      };
    }
    default: {
      return {
        items_found: 0,
        items_new: 0,
        summary: { raw_keys: Object.keys(result) },
        errors: [...errs, `no summary adapter for ${scraperKey}`],
      };
    }
  }
}

async function runOne(
  supabase: ReturnType<typeof createClient>,
  source: SourceRow,
  paramOverride: Record<string, unknown> | undefined,
  triggeredBy: string | null,
): Promise<JobRow> {
  // Open the run.
  const params = { ...(source.default_params ?? {}), ...(paramOverride ?? {}) };
  const { data: job, error: insertErr } = await supabase
    .from('scraping_jobs')
    .insert({
      source_id: source.id,
      source_name: source.name,
      scraper_key: source.scraper_key,
      status: 'running',
      params,
      triggered_by: triggeredBy,
    })
    .select('*')
    .single();
  if (insertErr || !job) throw new Error(`Could not open job row: ${insertErr?.message ?? 'no row'}`);

  // Invoke the backing scraper.
  let scraperResult: Record<string, unknown> | null = null;
  let invocationError: string | null = null;
  try {
    const { data, error } = await supabase.functions.invoke(source.edge_function, { body: params });
    if (error) invocationError = error.message;
    else scraperResult = (data ?? {}) as Record<string, unknown>;
    // Some scrapers return { success: false, error: '...' } in 200 OK — treat
    // that as a failure too, so the job row reflects reality.
    if (scraperResult && scraperResult.success === false) {
      invocationError = typeof scraperResult.error === 'string'
        ? scraperResult.error
        : 'scraper reported failure';
    }
  } catch (e) {
    invocationError = e instanceof Error ? e.message : String(e);
  }

  const sum = summarise(source.scraper_key, scraperResult);
  const finalStatus: 'completed' | 'failed' = invocationError ? 'failed' : 'completed';
  const errors = invocationError ? [invocationError, ...sum.errors] : sum.errors;

  // Close the run.
  const { data: updated, error: updateErr } = await supabase
    .from('scraping_jobs')
    .update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      items_found: sum.items_found,
      items_new: sum.items_new,
      properties_found: sum.items_found, // legacy column kept in sync
      result_summary: sum.summary,
      errors: errors.length ? errors : null,
    })
    .eq('id', job.id)
    .select('*')
    .single();
  if (updateErr) {
    // The job is left in 'running'; surface this rather than swallow it.
    throw new Error(`Could not close job row: ${updateErr.message}`);
  }

  // Reflect the latest run on the source for the UI cards.
  await supabase.from('scraping_sources').update({
    last_run: new Date().toISOString(),
    properties_found: sum.items_found,
    status: finalStatus === 'failed' ? 'error' : 'active',
    updated_at: new Date().toISOString(),
  }).eq('id', source.id);

  return updated as unknown as JobRow;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Admin-only entry point. This fans out to every paid scraper (Firecrawl,
    // Google, Sentinel) and `scraper_key:'all'` runs them all in one call —
    // a one-request cost amplifier if left open. (Audit-2026-06-25 PR3.)
    const gate = await requireUserOrService(req, supabase, { adminOnly: true });
    if (gate instanceof Response) return gate;
    const triggeredBy = gate.kind === 'user' ? gate.userId : null;

    const body: OrchestrateRequest = req.method === 'POST'
      ? await req.json().catch(() => ({ scraper_key: '' }))
      : { scraper_key: '' };
    if (!body.scraper_key) {
      return new Response(JSON.stringify({
        success: false,
        error: 'scraper_key is required (use "all" to run every active source)',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Resolve which sources to run.
    let sources: SourceRow[];
    if (body.scraper_key === 'all') {
      const { data, error } = await supabase
        .from('scraping_sources').select('*').eq('status', 'active');
      if (error) throw error;
      sources = (data ?? []) as unknown as SourceRow[];
    } else {
      const { data, error } = await supabase
        .from('scraping_sources').select('*').eq('scraper_key', body.scraper_key).maybeSingle();
      if (error) throw error;
      if (!data) return new Response(JSON.stringify({
        success: false, error: `Unknown scraper_key: ${body.scraper_key}`,
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      sources = [data as unknown as SourceRow];
    }

    const jobs: JobRow[] = [];
    const failures: { scraper_key: string; error: string }[] = [];
    for (const s of sources) {
      try {
        jobs.push(await runOne(supabase, s, body.params, triggeredBy));
      } catch (e) {
        failures.push({ scraper_key: s.scraper_key, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(JSON.stringify({
      success: failures.length === 0,
      ran: jobs.length,
      jobs,
      failures: failures.length ? failures : undefined,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[scraping-orchestrator]', e instanceof Error ? (e.stack ?? e.message) : String(e));
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
