-- Remove duplicate listing_url rows, keeping the newest
DELETE FROM public.scraped_properties
WHERE id NOT IN (
  SELECT DISTINCT ON (listing_url) id
  FROM public.scraped_properties
  ORDER BY listing_url, scraped_at DESC
);

-- Now create the unique index
CREATE UNIQUE INDEX scraped_properties_listing_url_unique ON public.scraped_properties (listing_url) WHERE listing_url IS NOT NULL;