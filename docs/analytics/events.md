# Analytics Event Contract

## Principle

Analytics may describe product actions but must never contain captured image bytes, camera frames, biometric-like data, or user photo content.

## Event envelope

Recommended properties shared by product events:

- `event_name`
- `session_id` (ephemeral/random, not a user account)
- `page_path`
- `entry_preset`
- `device_class` (`mobile|tablet|desktop`)
- `viewport_bucket`
- `referrer_class`
- `timestamp`

Do not include raw photo URLs, blobs, base64 content, filenames that expose personal information, or free-form captured text.

## Funnel events

### `landing_view`
When: eligible landing page is viewed.
Properties: `landing_type`, `entry_preset`.

### `start_booth`
When: user activates the primary booth CTA.
Properties: `cta_location`, `entry_preset`.

### `camera_permission_requested`
When: the browser permission flow is triggered.

### `camera_permission_granted`
When: usable media stream is obtained.
Properties: `facing_mode`.

### `camera_permission_denied`
When: permission is denied or blocked.
Properties: normalized `error_class`; never log raw browser stack data containing private context.

### `capture_started`
When: the first countdown begins.
Properties: `layout_id`, `shot_target`.

### `photo_captured`
When: a shot is captured.
Properties: `shot_index`, `shot_target`.

### `capture_completed`
When: target shots are available for composition.
Properties: `shot_count`, `layout_id`.

### `edit_started`
When: user first changes layout/filter/frame/sticker state after capture.

### `style_changed`
Properties: `style_type`, `style_id`.

### `frame_selected`
When: user explicitly switches to a different Frames V2 option.
Properties: `frame_id`, `frame_group` (`basic|cute|retro`), `preset_id`, `layout_id`, `filter_id`.

Use this event for preference/consideration analysis. Do not count the preset's initial default frame as an explicit selection.

### `export_started`
Properties: `format`, `layout_id`, `preset_id`, `filter_id`, `frame_id`, `frame_group`.

### `export_completed`
When: final strip blob is produced and download/share is available.
Properties: `format`, `layout_id`, `preset_id`, `filter_id`, `frame_id`, `frame_group`, `output_width`, `output_height`.

This event is the operational definition of a **completed photo strip**.

### `export_png`
When: emitted alongside a successful PNG `export_completed` event.
Properties: same frame-aware properties as `export_completed`.

Use this event to rank Frames V2 by actual generated output rather than clicks alone. Keep `export_completed` as the canonical funnel metric.

### `download_clicked`
When: user downloads the final strip.

### `share_clicked`
When: user invokes native/system sharing.
Properties: `share_supported`.

### `share_completed`
Only emit when the platform gives reliable positive completion evidence. Do not infer success from opening the share sheet.

## Error events

Use normalized classes:

- `camera_unavailable`
- `camera_permission_denied`
- `camera_start_failed`
- `capture_failed`
- `canvas_export_failed`
- `share_unavailable`

Avoid high-cardinality raw error strings in the primary analytics stream.

## Primary metrics

- `completed_photo_strips_per_day = count(export_completed)`
- `start_rate = start_booth / landing_view`
- `permission_success_rate = camera_permission_granted / camera_permission_requested`
- `capture_completion_rate = capture_completed / capture_started`
- `export_rate = export_completed / capture_completed`
- `share_intent_rate = share_clicked / export_completed`
- `frame_selection_share = count(frame_selected by frame_id) / count(frame_selected)`
- `frame_export_share = count(export_png by frame_id) / count(export_png)`
- `frame_conversion = count(export_png by frame_id) / count(frame_selected by frame_id)` (directional only; initial preset defaults are not counted as selections)

## SEO measurement joins

At aggregate level, compare Search Console landing/query data with:
- Start Booth rate by page
- Completed strip rate by page
- Share intent rate by page/preset
- Frame export share by landing/preset where sample size is sufficient

This should identify whether a keyword page produces useful sessions rather than impressions alone.
