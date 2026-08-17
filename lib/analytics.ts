import { FRAME_STYLES, type FrameId } from "@/lib/frame-styles";

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
  | "retake_single"
  | "edit_started"
  | "style_changed"
  | "frame_selected"
  | "export_started"
  | "export_completed"
  | "export_png"
  | "export_error"
  | "download_clicked"
  | "share_clicked"
  | "web_vital";

type SafeScalar = string | number | boolean | null | undefined;
type SafeEventProperties = Record<string, SafeScalar>;

const ACQUISITION_CONTEXT_KEY = "pictofu:acquisition_context";

const SAFE_PROPERTY_KEYS = new Set([
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

function frameGroup(frameId: SafeScalar) {
  if (typeof frameId !== "string") return undefined;
  return FRAME_STYLES.find((frame) => frame.id === (frameId as FrameId))?.category;
}

function enrichFrameProperties(properties: SafeEventProperties) {
  if (properties.frame_group !== undefined) return properties;
  const group = frameGroup(properties.frame_id);
  return group ? { ...properties, frame_group: group } : properties;
}

function sanitizeProperties(properties: SafeEventProperties) {
  return Object.fromEntries(
    Object.entries(enrichFrameProperties(properties))
      .filter(([key, value]) => SAFE_PROPERTY_KEYS.has(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 120) : value,
      ]),
  );
}

function storeAcquisitionContext(name: ProductEventName, properties: SafeEventProperties) {
  if (name !== "landing_view") return;

  try {
    if (window.sessionStorage.getItem(ACQUISITION_CONTEXT_KEY)) return;
    const context = sanitizeProperties({
      entry_path: window.location.pathname,
      entry_preset: properties.entry_preset,
      referrer_class: properties.referrer_class,
      share_marker: properties.share_marker,
      utm_source: properties.utm_source,
      utm_medium: properties.utm_medium,
      utm_campaign: properties.utm_campaign,
      utm_content: properties.utm_content,
    });
    window.sessionStorage.setItem(ACQUISITION_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // Acquisition context is optional; never block product analytics if storage is unavailable.
  }
}

function readAcquisitionContext(): SafeEventProperties {
  try {
    const raw = window.sessionStorage.getItem(ACQUISITION_CONTEXT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return sanitizeProperties(parsed as SafeEventProperties);
  } catch {
    return {};
  }
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

function buildEventDetail(name: ProductEventName, properties: SafeEventProperties) {
  const width = window.innerWidth;
  return {
    event_name: name,
    session_id: getSessionId(),
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
    device_class: deviceClass(width),
    viewport_bucket: viewportBucket(width),
    ...readAcquisitionContext(),
    ...sanitizeProperties(properties),
  };
}

function dispatchEventDetail(detail: ReturnType<typeof buildEventDetail>) {
  window.dispatchEvent(new CustomEvent("pictofu:analytics", { detail }));

  if (process.env.NODE_ENV === "development") {
    // Never add captured photo data, Blob URLs, base64 or camera frame content here.
    console.info("[PicToFu event]", detail);
  }
}

export function emitProductEvent(name: ProductEventName, properties: SafeEventProperties = {}) {
  if (typeof window === "undefined") return;
  if (name === "start_booth" && !shouldEmitStartBooth()) return;

  storeAcquisitionContext(name, properties);
  const normalizedName = normalizeEvent(name, properties);
  const detail = buildEventDetail(normalizedName, properties);
  dispatchEventDetail(detail);

  // Keep export_completed as the core funnel metric while exposing a dedicated
  // frame-aware PNG event for Frames V2 preference analysis.
  if (normalizedName === "export_completed" && properties.format === "png") {
    dispatchEventDetail(buildEventDetail("export_png", properties));
  }
}
