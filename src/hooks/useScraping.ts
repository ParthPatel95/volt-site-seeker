import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// AESO Hub scraping orchestrator hooks. The orchestrator edge function is the
// single entry point — every "run scraper" click here goes through it so
// every run produces a scraping_jobs row, every source's last_run is
// refreshed, and the UI never duplicates run-tracking logic per scraper.

const untyped = supabase as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

export interface ScrapingSource {
  id: string;
  scraper_key: string;
  name: string;
  description: string | null;
  type: 'real_estate' | 'corporate' | 'news' | 'social' | 'osm' | 'registry' | 'satellite';
  status: 'active' | 'inactive' | 'error';
  edge_function: string;
  keywords: string[] | null;
  default_params: Record<string, unknown> | null;
  required_secrets: string[] | null;
  last_run: string | null;
  properties_found: number | null;
}

export interface ScrapingJob {
  id: string;
  scraper_key: string | null;
  source_id: string;
  source_name: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  items_found: number | null;
  items_new: number | null;
  params: Record<string, unknown> | null;
  result_summary: Record<string, unknown> | null;
  errors: string[] | null;
  triggered_by: string | null;
}

export function useScrapingSources() {
  return useQuery({
    queryKey: ['scraping-sources'],
    queryFn: async () => {
      const { data, error } = await untyped
        .from('scraping_sources')
        .select('*')
        .not('scraper_key', 'is', null)
        .order('type', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ScrapingSource[];
    },
    staleTime: 30 * 1000,
  });
}

export function useScrapingJobs(limit = 30) {
  return useQuery({
    queryKey: ['scraping-jobs', limit],
    queryFn: async () => {
      const { data, error } = await untyped
        .from('scraping_jobs')
        .select('*')
        .not('scraper_key', 'is', null)
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ScrapingJob[];
    },
    // Auto-refresh while running jobs may be present.
    refetchInterval: (q) => {
      const rows = (q.state.data ?? []) as ScrapingJob[];
      return rows.some((j) => j.status === 'running') ? 4000 : false;
    },
    staleTime: 15 * 1000,
  });
}

export function useSeedScrapers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scraping-seed', { body: {} });
      if (error) throw error;
      if (data?.success === false) {
        const e = new Error(data.error ?? 'Seed failed');
        (e as Error & { needs?: string[] }).needs = data.needs;
        throw e;
      }
      return data as { seeded: number; sources: Array<{ scraper_key: string; name: string }> };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraping-sources'] });
    },
  });
}

export function useRunScraper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: { scraper_key: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('scraping-orchestrator', { body: req });
      if (error) throw error;
      if (data?.success === false) {
        const e = new Error(data.error ?? 'Scraper run failed');
        (e as Error & { failures?: unknown }).failures = data.failures;
        throw e;
      }
      return data as {
        ran: number;
        jobs: ScrapingJob[];
        failures?: { scraper_key: string; error: string }[];
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scraping-sources'] });
      qc.invalidateQueries({ queryKey: ['scraping-jobs'] });
      // Some scrapers write into Hidden Gems tables — refresh those too.
      qc.invalidateQueries({ queryKey: ['hidden-gems-inputs'] });
      qc.invalidateQueries({ queryKey: ['gem-listings'] });
      qc.invalidateQueries({ queryKey: ['scraping-recent-items'] });
    },
  });
}

// Latest items written across every scraper's destination table, surfaced in
// the tab's "Recent finds" panel.
export interface RecentScrapeItem {
  source: 'gem-listings' | 'industrial-news' | 'osm-discovery';
  id: string;
  title: string;
  url?: string | null;
  detail?: string | null;
  signals?: string[] | null;
  region?: string | null;
  at: string;
}

export function useRecentScrapeItems(limit = 12) {
  return useQuery({
    queryKey: ['scraping-recent-items', limit],
    queryFn: async () => {
      const [listings, news, facilities] = await Promise.all([
        untyped.from('gem_listings').select('id,title,listing_url,description_excerpt,gem_signals,state,scraped_at')
          .order('scraped_at', { ascending: false }).limit(limit),
        untyped.from('news_intelligence').select('id,title,url,content,keywords,discovered_at')
          .order('discovered_at', { ascending: false }).limit(limit),
        untyped.from('industrial_facilities')
          .select('id,name,facility_type,state,municipality,source_url,created_at,source_publisher')
          .eq('source_publisher', 'OpenStreetMap')
          .order('created_at', { ascending: false }).limit(limit),
      ]);

      const items: RecentScrapeItem[] = [];
      for (const r of (listings.data ?? []) as Array<{
        id: string; title: string | null; listing_url: string;
        description_excerpt: string | null; gem_signals: string[] | null;
        state: string | null; scraped_at: string;
      }>) {
        items.push({
          source: 'gem-listings',
          id: r.id,
          title: r.title ?? r.listing_url,
          url: r.listing_url,
          detail: r.description_excerpt,
          signals: r.gem_signals,
          region: r.state,
          at: r.scraped_at,
        });
      }
      for (const r of (news.data ?? []) as Array<{
        id: string; title: string; url: string | null; content: string;
        keywords: string[] | null; discovered_at: string;
      }>) {
        items.push({
          source: 'industrial-news',
          id: r.id,
          title: r.title,
          url: r.url ?? undefined,
          detail: r.content,
          signals: r.keywords,
          at: r.discovered_at,
        });
      }
      for (const r of (facilities.data ?? []) as Array<{
        id: string; name: string; facility_type: string; state: string | null;
        municipality: string | null; source_url: string | null; created_at: string;
      }>) {
        items.push({
          source: 'osm-discovery',
          id: r.id,
          title: r.name,
          url: r.source_url ?? undefined,
          detail: `${r.facility_type.replace(/_/g, ' ')}${r.municipality ? ` · ${r.municipality}` : ''}`,
          region: r.state,
          at: r.created_at,
        });
      }
      return items
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, limit);
    },
    staleTime: 30 * 1000,
  });
}
