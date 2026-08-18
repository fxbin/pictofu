const GROWTH_ENDPOINT =
  "https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/pictofu-growth-ingest";

// Supabase legacy anon JWTs are public client credentials. Authorization only permits
// invoking the JWT-protected Edge Function; the database table/RPC remain service-role only.
const GROWTH_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3emRkdnBybnlqcnJncHpjc2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NjA2NjEsImV4cCI6MjEwMjIzNjY2MX0.TO1Z4xZGBTkYR-uB2wp1RQQI7xik3DF91HPgWgbzdJk";

const GROWTH_EVENT_NAMES = new Set([
  "landing_view",
  "start_booth",
  "camera_permission_granted",
  "camera_permission_denied",
  "camera_error",
  "capture_completed",
  "edit_started",
  "export_completed",
  "export_error",
  "download_clicked",
  "share_clicked",
]);

const GROWTH_DIMENSION_KEYS = [
  "page_path",
  "entry_path",
  "entry_preset",
  "preset_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "share_marker",
  "referrer_class",
  "device_class",
  "capture_source",
] as const;

type GrowthDetail = Record<string, unknown>;

function growthDedupeKey(eventName: string) {
  return `pictofu:growth-reached:${eventName}`;
}

function shouldCountGrowthStage(eventName: string) {
  try {
    const key = growthDedupeKey(eventName);
    if (window.sessionStorage.getItem(key)) return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    // If session storage is unavailable, prefer a possible duplicate over losing the signal.
    return true;
  }
}

function growthPayload(detail: GrowthDetail) {
  const eventName = typeof detail.event_name === "string" ? detail.event_name : "";
  if (!GROWTH_EVENT_NAMES.has(eventName)) return null;

  const payload: Record<string, string> = { event_name: eventName };
  for (const key of GROWTH_DIMENSION_KEYS) {
    const value = detail[key];
    if (typeof value === "string" && value) payload[key] = value;
  }
  return payload;
}

export function countGrowthStage(detail: GrowthDetail) {
  if (typeof window === "undefined") return;
  const payload = growthPayload(detail);
  if (!payload || !shouldCountGrowthStage(payload.event_name)) return;

  void fetch(GROWTH_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${GROWTH_ANON_KEY}`,
      apikey: GROWTH_ANON_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Growth measurement is best-effort and must never block the photobooth.
  });
}
