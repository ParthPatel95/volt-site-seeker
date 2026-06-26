-- ============================================================================
-- FK COVERING INDEXES + DUPLICATE INDEX CLEANUP
-- ============================================================================
-- The performance advisor flagged 109 foreign keys in the public schema with
-- no covering index. Every such FK forces a sequential scan of the child
-- table on JOINs and, worse, on cascade UPDATE/DELETE of the parent row.
-- Adding a covering index on the FK column(s) is purely additive — it can
-- only speed reads/cascades up; it never changes query results or access
-- control.
--
-- Rather than hardcode 109 CREATE INDEX statements (which would require
-- getting every column list exactly right and would drift as the schema
-- evolves), this migration INTROSPECTS pg_constraint: for every FK in the
-- public schema, it checks whether an existing index already covers the FK
-- columns as its leading columns, and if not, creates one.
--
-- Notes:
--   * Plain CREATE INDEX (not CONCURRENTLY) — migrations run in a
--     transaction and CONCURRENTLY is disallowed there. The tables are
--     young/small so the brief ACCESS SHARE-blocking lock is acceptable. If
--     a specific table is large in your environment, build that one index
--     manually with CONCURRENTLY outside this migration.
--   * Index name: idx_fk_<table>_<cols>, truncated to 63 chars (Postgres
--     identifier limit), de-duplicated with the constraint oid if needed.
--   * IF NOT EXISTS guards make the whole migration idempotent.

DO $$
DECLARE
  r record;
  idx_name text;
  col_list text;
  has_covering boolean;
BEGIN
  FOR r IN
    SELECT
      con.oid              AS con_oid,
      con.conname          AS con_name,
      rel.relname          AS table_name,
      con.conrelid         AS table_oid,
      con.conkey           AS col_nums
    FROM pg_constraint con
    JOIN pg_class rel       ON rel.oid = con.conrelid
    JOIN pg_namespace nsp   ON nsp.oid = rel.relnamespace
    WHERE con.contype = 'f'
      AND nsp.nspname = 'public'
  LOOP
    -- Build the ordered column list for the FK.
    SELECT string_agg(quote_ident(att.attname), ', ' ORDER BY u.ord)
    INTO col_list
    FROM unnest(r.col_nums) WITH ORDINALITY AS u(attnum, ord)
    JOIN pg_attribute att
      ON att.attrelid = r.table_oid AND att.attnum = u.attnum;

    -- Does an existing index already LEAD with the FK's first column? That's
    -- the standard "is this FK indexed" heuristic (and what the advisor uses):
    -- an index whose first key column is the FK's first column makes the
    -- FK-side lookups / cascade scans index-driven.
    --   * r.col_nums is con.conkey — a normal 1-based smallint[] (first = [1]).
    --   * i.indkey is an int2vector — 0-based subscripting (first = [0]).
    -- Mixing the two index bases is the usual footgun; spelled out here.
    SELECT EXISTS (
      SELECT 1
      FROM pg_index i
      WHERE i.indrelid = r.table_oid
        AND i.indkey[0] = r.col_nums[1]
    ) INTO has_covering;

    IF has_covering THEN
      CONTINUE;
    END IF;

    -- Compose a safe index name. Postgres truncates identifiers at 63 bytes,
    -- so keep the base ≤ 58 and append a 5-char md5 suffix (= ≤ 63 total) to
    -- avoid post-truncation name collisions between two different FKs.
    idx_name := left(
      'idx_fk_' || r.table_name || '_' ||
        regexp_replace(replace(col_list, ', ', '_'), '[^a-zA-Z0-9_]', '', 'g'),
      58
    ) || '_' || substr(md5(r.con_name), 1, 4);

    BEGIN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I (%s)',
        idx_name, r.table_name, col_list
      );
      RAISE NOTICE 'created FK index % on %(%)', idx_name, r.table_name, col_list;
    EXCEPTION WHEN OTHERS THEN
      -- One bad table (e.g. a generated/partitioned edge case) must not abort
      -- the whole sweep.
      RAISE NOTICE 'skip %.%(%): %', r.table_name, r.con_name, col_list, SQLERRM;
    END;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Duplicate index drops (advisor-confirmed). Each set has 2–3 byte-identical
-- indexes; keep one, drop the rest. IF EXISTS so a partially-cleaned DB is
-- fine.
-- ----------------------------------------------------------------------------

-- aeso_training_data: keep idx_aeso_training_data_timestamp.
DROP INDEX IF EXISTS public.idx_training_data_timestamp;
DROP INDEX IF EXISTS public.idx_training_data_timestamp_desc;

-- aeso_weather_forecasts: keep idx_aeso_weather_forecasts_timestamp.
DROP INDEX IF EXISTS public.idx_weather_forecasts_target;
