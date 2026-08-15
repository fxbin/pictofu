export type ProductEventName =
  | "landing_view"
  | "start_booth"
  | "camera_permission_requested"
  | "camera_permission_granted"
  | "camera_permission_denied"
  | "camera_error"
  | "capture_started"
  | "photo_captured"
  | "capture_completed"
  | "edit_started"
  | "style_changed"
  | "export_started"
  | "export_completed"
  | "export_error"
  | "download_clicked"
  | "share_clicked"
  | "web_vital";

type SafeScalar = string | number | boolean | null | undefined;
type SafeEventProperties = Record<string, SafeScalar>;

const SAFE_PROPERTY_KEYS = new Set([
  "landing_type",
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
  "format",
  "output_width",
  "output_height",
  "share_supported",
  "referrer_class",
  "device_class",
  "viewport_bucket",
  "metric_name",
  "metric_value",
  "metric_delta",
  "metric_rating",
  "metric_id",
]);

function deviceClass(width: number) {
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function viewportBucket(width: number) {
  if (width < 360) return "<360";
  if (width < 390) return "360-389";
  if (width < 430) return "390-429";
  if (width < 768) return "430-767";
  if (width < 1100) return "768-1099";
  return "1100+";
}

function sanitizeProperties(properties: SafeEventProperties) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => SAFE_PROPERTY_KEYS.has(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 120) : value,
      ]),
  );
}

function normalizeEvent(name: ProductEventName, properties: SafeEventProperties): ProductEventName {
  if (name === "camera_error" && properties.error_class === "canvas_export_failed") {
    return "export_error";
  }
  return name;
}

function getSessionId() {
  const key = "pictofu:analytics_session";
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const value =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(key, value);
    return value;
  } catch {
    return "session-storage-unavailable";
  }
}

function shouldEmitStartBooth() {
  const key = "pictofu:last_start_booth_at";
  const now = Date.now();
  try {
    const last = Number(window.sessionStorage.getItem(key) ?? "0");
    if (Number.isFinite(last) && now - last < 3000) return false;
    window.sessionStorage.setItem(key, String(now));
  } catch {
    // If session storage is unavailable, prefer a possible duplicate over losing the event.
  }
  return true;
}

export function emitProductEvent(name: ProductEventName, properties: SafeEventProperties = {}) {
  if (typeof window === "undefined") return;
  if (name === "start_booth" && !shouldEmitStartBooth()) return;

  const normalizedName = normalizeEvent(name, properties);
  const width = window.innerWidth;
  const detail = {
    event_name: normalizedName,
    session_id: getSessionId(),
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
    device_class: deviceClass(width),
    viewport_bucket: viewportBucket(width),
    ...sanitizeProperties(properties),
  };

  window.dispatchEvent(new CustomEvent("pictofu:analytics", { detail }));

  if (process.env.NODE_ENV === "development") {
    // Never add captured photo data, Blob URLs, base64 or camera frame content here.
    console.info("[PicTofu event]", detail);
  }
}
