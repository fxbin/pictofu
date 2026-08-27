import { FRAME_STYLES, type FrameId } from "@/lib/frame-styles";
import {
  sanitizeSafeEventProperties,
  type SafeEventProperties,
} from "@/lib/analytics-safety";
import { countGrowthStage } from "@/lib/growth-measurement";

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
  | "editor_tool_used"
  | "style_changed"
  | "frame_selected"
  | "export_started"
  | "export_completed"
  | "export_png"
  | "export_error"
  | "download_clicked"
  | "share_clicked"
  | "web_vital";

export type EditTool =
  | "crop"
  | "pan"
  | "zoom"
  | "rotate"
  | "straighten"
  | "flip"
  | "sticker"
  | "ratio";

type CaptureSource = "camera" | "upload" | "mixed";
type EditProfile =
  | "none"
  | "photo"
  | "sticker"
  | "ratio"
  | "photo_sticker"
  | "photo_ratio"
  | "sticker_ratio"
  | "mixed";

const ACQUISITION_CONTEXT_KEY = "pictofu:acquisition_context";
const CAPTURE_SOURCE_KEY = "pictofu:capture_source";
const EDIT_PROFILE_KEY = "pictofu:edit_profile";

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

function frameGroup(frameId: unknown) {
  if (typeof frameId !== "string") return undefined;
  return FRAME_STYLES.find((frame) => frame.id === (frameId as FrameId))?.category;
}

function enrichFrameProperties(properties: SafeEventProperties): SafeEventProperties {
  if (properties.frame_group !== undefined) return properties;
  const group = frameGroup(properties.frame_id);
  return group ? { ...properties, frame_group: group } : properties;
}

function sanitizeProperties(properties: SafeEventProperties) {
  return sanitizeSafeEventProperties(enrichFrameProperties(properties));
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

function normalizeCaptureSource(value: unknown): CaptureSource | undefined {
  return value === "camera" || value === "upload" || value === "mixed" ? value : undefined;
}

function readCaptureSource(): CaptureSource | undefined {
  try {
    return normalizeCaptureSource(window.sessionStorage.getItem(CAPTURE_SOURCE_KEY));
  } catch {
    return undefined;
  }
}

function storeCaptureSource(source: CaptureSource) {
  try {
    window.sessionStorage.setItem(CAPTURE_SOURCE_KEY, source);
  } catch {
    // Capture source is a bounded optional funnel dimension; storage failure must never block the booth.
  }
}

function trackCaptureSource(name: ProductEventName, properties: SafeEventProperties) {
  const incoming = normalizeCaptureSource(properties.capture_source);
  if (!incoming || incoming === "mixed") return;
  if (name === "capture_started" || name === "capture_completed") {
    storeCaptureSource(incoming);
    return;
  }
  if (name === "retake_single") {
    const current = readCaptureSource();
    storeCaptureSource(current && current !== incoming ? "mixed" : incoming);
  }
}

function withCaptureSource(name: ProductEventName, properties: SafeEventProperties): SafeEventProperties {
  if (normalizeCaptureSource(properties.capture_source)) return properties;
  if (!["export_started", "export_completed", "download_clicked", "share_clicked"].includes(name)) return properties;
  const captureSource = readCaptureSource();
  return captureSource ? { ...properties, capture_source: captureSource } : properties;
}

function normalizeEditTool(value: unknown): EditTool | undefined {
  return ["crop", "pan", "zoom", "rotate", "straighten", "flip", "sticker", "ratio"].includes(String(value))
    ? value as EditTool
    : undefined;
}

function normalizeEditProfile(value: unknown): EditProfile | undefined {
  return ["none", "photo", "sticker", "ratio", "photo_sticker", "photo_ratio", "sticker_ratio", "mixed"].includes(String(value))
    ? value as EditProfile
    : undefined;
}

function readEditProfile(): EditProfile {
  try {
    return normalizeEditProfile(window.sessionStorage.getItem(EDIT_PROFILE_KEY)) ?? "none";
  } catch {
    return "none";
  }
}

function storeEditProfile(profile: EditProfile) {
  try {
    window.sessionStorage.setItem(EDIT_PROFILE_KEY, profile);
  } catch {
    // Editor profile is only a bounded aggregate dimension.
  }
}

function profileBits(profile: EditProfile) {
  return {
    photo: profile === "photo" || profile === "photo_sticker" || profile === "photo_ratio" || profile === "mixed",
    sticker: profile === "sticker" || profile === "photo_sticker" || profile === "sticker_ratio" || profile === "mixed",
    ratio: profile === "ratio" || profile === "photo_ratio" || profile === "sticker_ratio" || profile === "mixed",
  };
}

function mergeEditProfile(profile: EditProfile, tool: EditTool): EditProfile {
  const bits = profileBits(profile);
  if (["crop", "pan", "zoom", "rotate", "straighten", "flip"].includes(tool)) bits.photo = true;
  if (tool === "sticker") bits.sticker = true;
  if (tool === "ratio") bits.ratio = true;
  const count = Number(bits.photo) + Number(bits.sticker) + Number(bits.ratio);
  if (count === 0) return "none";
  if (count === 3) return "mixed";
  if (bits.photo && bits.sticker) return "photo_sticker";
  if (bits.photo && bits.ratio) return "photo_ratio";
  if (bits.sticker && bits.ratio) return "sticker_ratio";
  if (bits.photo) return "photo";
  if (bits.sticker) return "sticker";
  return "ratio";
}

function trackEditProfile(name: ProductEventName, properties: SafeEventProperties) {
  if (name === "capture_started") {
    storeEditProfile("none");
    return;
  }
  if (name !== "editor_tool_used") return;
  const tool = normalizeEditTool(properties.edit_tool);
  if (!tool) return;
  storeEditProfile(mergeEditProfile(readEditProfile(), tool));
}

function withEditProfile(name: ProductEventName, properties: SafeEventProperties): SafeEventProperties {
  if (normalizeEditProfile(properties.edit_profile)) return properties;
  if (!["export_started", "export_completed", "download_clicked", "share_clicked"].includes(name)) return properties;
  return { ...properties, edit_profile: readEditProfile() };
}

function normalizeEvent(name: ProductEventName, properties: SafeEventProperties): ProductEventName {
  if (name === "camera_error" && properties.error_class === "canvas_export_failed") return "export_error";
  return name;
}

function getSessionId() {
  const key = "pictofu:analytics_session";
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const value = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
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
  countGrowthStage(detail);
  window.dispatchEvent(new CustomEvent("pictofu:analytics", { detail }));
  if (process.env.NODE_ENV === "development") {
    // Never add captured photo data, Blob URLs, base64 or camera frame content here.
    console.info("[PicToFu event]", detail);
  }
}

export function emitProductEvent(name: ProductEventName, properties: SafeEventProperties = {}) {
  if (typeof window === "undefined") return;
  if (name === "start_booth" && (window.location.pathname === "/booth" || !shouldEmitStartBooth())) return;

  storeAcquisitionContext(name, properties);
  trackCaptureSource(name, properties);
  trackEditProfile(name, properties);
  const normalizedName = normalizeEvent(name, properties);
  const withSource = withCaptureSource(normalizedName, properties);
  const enrichedProperties = withEditProfile(normalizedName, withSource);
  const detail = buildEventDetail(normalizedName, enrichedProperties);
  dispatchEventDetail(detail);

  if (normalizedName === "export_completed" && enrichedProperties.format === "png") {
    dispatchEventDetail(buildEventDetail("export_png", enrichedProperties));
  }
}
