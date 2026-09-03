-- PicToFu weekly growth review query pack
-- PostgreSQL / Supabase
--
-- Default window: latest 7 available UTC dates including current_date.
-- Change the params CTE when producing a fixed Day 7 / Day 14 snapshot.

-- 1) Daily core funnel
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  event_date,
  SUM(event_count) FILTER (WHERE event_name = 'landing_view') AS landing,
  SUM(event_count) FILTER (WHERE event_name = 'start_booth') AS start_booth,
  SUM(event_count) FILTER (WHERE event_name = 'camera_permission_granted') AS camera_granted,
  SUM(event_count) FILTER (WHERE event_name = 'capture_completed') AS capture_completed,
  SUM(event_count) FILTER (WHERE event_name = 'edit_started') AS edit_started,
  SUM(event_count) FILTER (WHERE event_name = 'export_completed') AS export_completed,
  SUM(event_count) FILTER (WHERE event_name = 'download_clicked') AS download_clicked,
  SUM(event_count) FILTER (WHERE event_name = 'share_clicked') AS share_clicked
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
GROUP BY event_date
ORDER BY event_date;

-- 2) Acquisition funnel by referrer class
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  COALESCE(NULLIF(referrer_class, ''), '(missing)') AS referrer_class,
  SUM(event_count) FILTER (WHERE event_name = 'landing_view') AS landing,
  SUM(event_count) FILTER (WHERE event_name = 'start_booth') AS starts,
  SUM(event_count) FILTER (WHERE event_name = 'capture_completed') AS captures,
  SUM(event_count) FILTER (WHERE event_name = 'edit_started') AS edits,
  SUM(event_count) FILTER (WHERE event_name = 'export_completed') AS exports
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
GROUP BY 1
ORDER BY landing DESC NULLS LAST;

-- 3) Known UTM / owner-assistant contamination watch
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  event_date,
  COALESCE(NULLIF(utm_source, ''), '(none)') AS utm_source,
  COALESCE(NULLIF(referrer_class, ''), '(missing)') AS referrer_class,
  COALESCE(NULLIF(device_class, ''), '(missing)') AS device_class,
  SUM(event_count) FILTER (WHERE event_name = 'landing_view') AS landing
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
  AND event_name = 'landing_view'
GROUP BY 1,2,3,4
ORDER BY event_date, landing DESC;

-- 4) Clean directional acquisition view
-- Excludes the explicitly known ChatGPT UTM source. This is not a perfect
-- unique-user filter; direct/referral can still include owner activity.
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  COALESCE(NULLIF(referrer_class, ''), '(missing)') AS referrer_class,
  SUM(event_count) FILTER (WHERE event_name = 'landing_view') AS landing,
  SUM(event_count) FILTER (WHERE event_name = 'start_booth') AS starts,
  SUM(event_count) FILTER (WHERE event_name = 'capture_completed') AS captures,
  SUM(event_count) FILTER (WHERE event_name = 'export_completed') AS exports
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
  AND COALESCE(utm_source, '') <> 'chatgpt.com'
GROUP BY 1
ORDER BY landing DESC NULLS LAST;

-- 5) Capture source completion watch
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  COALESCE(NULLIF(capture_source, ''), '(missing)') AS capture_source,
  SUM(event_count) FILTER (WHERE event_name = 'capture_completed') AS captures,
  SUM(event_count) FILTER (WHERE event_name = 'export_completed') AS exports,
  SUM(event_count) FILTER (WHERE event_name = 'download_clicked') AS downloads,
  SUM(event_count) FILTER (WHERE event_name = 'share_clicked') AS shares
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
  AND event_name IN ('capture_completed', 'export_completed', 'download_clicked', 'share_clicked')
GROUP BY 1
ORDER BY captures DESC NULLS LAST;

-- 6) Editor tool adoption
WITH params AS (
  SELECT current_date - 6 AS start_date, current_date AS end_date
)
SELECT
  edit_tool,
  SUM(event_count) AS uses
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
  AND event_name = 'editor_tool_used'
  AND COALESCE(edit_tool, '') <> ''
GROUP BY edit_tool
ORDER BY uses DESC, edit_tool;

-- 7) Search daily trend
WITH params AS (
  SELECT current_date - 13 AS start_date, current_date AS end_date
)
SELECT
  event_date,
  SUM(event_count) FILTER (WHERE event_name = 'landing_view') AS search_landings,
  SUM(event_count) FILTER (WHERE event_name = 'start_booth') AS search_starts,
  SUM(event_count) FILTER (WHERE event_name = 'capture_completed') AS search_captures,
  SUM(event_count) FILTER (WHERE event_name = 'export_completed') AS search_exports
FROM public.pictofu_growth_daily, params
WHERE event_date BETWEEN params.start_date AND params.end_date
  AND referrer_class = 'search'
GROUP BY event_date
ORDER BY event_date;

-- 8) Retention cohort counts
-- Consent-dependent browser cohorts. Do not report product-wide retention
-- percentages when this table is sparse.
WITH params AS (
  SELECT current_date - 30 AS start_date, current_date AS end_date
)
SELECT
  retention_bucket,
  SUM(browser_count) AS browsers
FROM public.pictofu_retention_cohorts, params
WHERE cohort_date BETWEEN params.start_date AND params.end_date
GROUP BY retention_bucket
ORDER BY retention_bucket;
