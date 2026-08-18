-- PicToFu Photo Editor V2 validation queries
-- Aggregate-only: no raw media, user/session IDs, coordinates or free-text.

-- 1) Tool reach by bounded tool (directional adoption, not click volume).
select
  edit_tool,
  sum(event_count) as reached
from public.pictofu_growth_daily
where event_date >= current_date - 14
  and event_name = 'editor_tool_used'
  and edit_tool <> ''
group by edit_tool
order by reached desc;

-- 2) Export / share outcome by bounded edit profile.
select
  edit_profile,
  sum(event_count) filter (where event_name = 'export_completed') as exports,
  sum(event_count) filter (where event_name = 'share_clicked') as shares,
  round(
    100.0 * sum(event_count) filter (where event_name = 'share_clicked')
    / nullif(sum(event_count) filter (where event_name = 'export_completed'), 0),
    1
  ) as share_per_export_pct
from public.pictofu_growth_daily
where event_date >= current_date - 14
  and edit_profile <> ''
group by edit_profile
order by exports desc;

-- 3) Camera / upload / mixed completion-to-export direction.
select
  capture_source,
  sum(event_count) filter (where event_name = 'capture_completed') as completed,
  sum(event_count) filter (where event_name = 'export_completed') as exported,
  round(
    100.0 * sum(event_count) filter (where event_name = 'export_completed')
    / nullif(sum(event_count) filter (where event_name = 'capture_completed'), 0),
    1
  ) as export_rate_pct
from public.pictofu_growth_daily
where event_date >= current_date - 14
  and capture_source in ('camera', 'upload', 'mixed')
group by capture_source
order by completed desc;

-- Interpretation guardrail:
-- low traffic stays directional. Day 7 / Day 14 must state uncertainty and end
-- in CONTINUE / ITERATE / HOLD; do not manufacture statistical significance.
