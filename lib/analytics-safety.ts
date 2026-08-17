export type SafeScalar = string | number | boolean | null | undefined;
export type SafeEventProperties = Record<string, SafeScalar>;

export const SAFE_ANALYTICS_PROPERTY_KEYS: ReadonlySet<string> = new Set([
  "landing_type",
  "entry_path",
  "entry_preset",
  "cta_location",
  "facing_mode",
  "error_class",
  "layout_id",
  "shot_target",
  "shot_index",
  "shot_count",
  "style_type",
  "style_id",
  "preset_id",
  "filter_id",
  "frame_id",
  "frame_group",
  "format",
  "output_width",
  "output_height",
  "share_supported",
  "share_action",
  "share_preset",
  "delivery_mode",
  "browser_context",
  "referrer_class",
  "share_marker",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "device_class",
  "viewport_bucket",
  "metric_name",
  "metric_value",
  "metric_delta",
  "metric_rating",
  "metric_id",
]);

export function sanitizeSafeEventProperties(properties: SafeEventProperties) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => SAFE_ANALYTICS_PROPERTY_KEYS.has(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 120) : value,
      ]),
  );
}
