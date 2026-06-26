-- Per-identifier rate limiting for public (unauthenticated) edge functions.
-- (Audit-2026-06-26.)
--
-- Several edge functions are reachable without auth — contact/inquiry forms,
-- e-mail senders, the share-token validator, the meta proxy, image
-- generation. Without a limiter, a script can spam inquiries, bomb the e-mail
-- sender, brute-force share tokens, or burn paid AI credits. This adds a
-- cheap fixed-window counter the functions consult via `check_rate_limit`.
--
-- The companion `_shared/rateLimit.ts` helper fails OPEN: if this migration
-- has not been applied yet (or the RPC errors for any reason) the functions
-- keep working unthrottled rather than 500-ing every caller. So deploying the
-- function code before this migration is safe; the limit simply starts being
-- enforced once the migration lands.

create table if not exists public.rate_limits (
  bucket_key   text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (bucket_key, window_start)
);

-- The table holds only transient counters; no one should read it directly.
-- RLS on with no policies = deny all for anon/authenticated. The
-- SECURITY DEFINER function below still operates on it.
alter table public.rate_limits enable row level security;

-- Index to make the opportunistic cleanup delete cheap.
create index if not exists idx_rate_limits_window_start
  on public.rate_limits (window_start);

-- Atomically increment the counter for (key, current fixed window) and report
-- whether the caller is still within the allowance. Returns TRUE when the
-- request is allowed, FALSE when it has exceeded p_max within the window.
create or replace function public.check_rate_limit(
  p_key            text,
  p_max            integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_hits         integer;
begin
  if p_key is null or p_max is null or p_window_seconds is null or p_window_seconds <= 0 then
    -- Misconfigured call: do not block traffic.
    return true;
  end if;

  -- Floor "now" to the start of the current fixed window.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (bucket_key, window_start, hits)
  values (p_key, v_window_start, 1)
  on conflict (bucket_key, window_start)
  do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  -- Opportunistic cleanup of this key's stale windows so the table stays small.
  delete from public.rate_limits
  where bucket_key = p_key
    and window_start < now() - make_interval(secs => p_window_seconds * 3);

  return v_hits <= p_max;
end;
$$;

-- Edge functions invoke this with the anon, user, or service-role key.
revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer)
  to anon, authenticated, service_role;
