export const GROWTH_FUNNEL_EVENTS = {
  LANDING_VIEW: "landing_view",
  START_BOOTH: "start_booth",
  CAPTURE_COMPLETED: "capture_completed",
  EXPORT_COMPLETED: "export_completed",
  SHARE_COMPLETED: "share_completed",
  SHARE_LANDING_VIEW: "share_landing_view",
  SHARE_TO_BOOTH: "share_to_booth",
} as const;

export const STYLE_SELECTION_EVENTS = {
  PRESET_SELECTED: "preset_selected",
  LAYOUT_SELECTED: "layout_selected",
  FILTER_SELECTED: "filter_selected",
  FRAME_SELECTED: "frame_selected",
} as const;

export const GROWTH_FUNNEL_STAGES = [
  "landing_view",
  "start_booth",
  "capture_completed",
  "export_completed",
  "share_completed",
  "share_landing_view",
  "share_to_booth",
] as const;

export type GrowthFunnelStage = (typeof GROWTH_FUNNEL_STAGES)[number];

export const PRESET_GROWTH_DIMENSIONS = [
  "preset_id",
  "entry_preset",
  "entry_path",
  "share_marker",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;
