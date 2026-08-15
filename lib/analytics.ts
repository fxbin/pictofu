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
  | "share_clicked";

type SafeEventProperties = Record<string, string | number | boolean | null | undefined>;

export function emitProductEvent(name: ProductEventName, properties: SafeEventProperties = {}) {
  if (typeof window === "undefined") return;

  const detail = {
    event_name: name,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  window.dispatchEvent(new CustomEvent("pictofu:analytics", { detail }));

  if (process.env.NODE_ENV === "development") {
    // Never add captured image data to this object.
    console.info("[PicTofu event]", detail);
  }
}
