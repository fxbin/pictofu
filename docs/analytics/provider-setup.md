# Analytics Provider Setup

PicTofu’s product code emits a provider-neutral `pictofu:analytics` CustomEvent. The production bridge can forward the sanitized event contract to GA4 when explicitly enabled.

## Production environment variables

```text
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The bridge remains disabled unless **both** values are valid. Do not commit the real measurement ID as source configuration if the deployment platform can supply it as an environment variable.

## Privacy boundary

`lib/analytics.ts` enforces a scalar-key allowlist and truncates string values. Captured image bytes, Blob URLs, base64 data, filenames, free-form browser errors and photo content are not accepted analytics properties.

The GA bridge also disables automatic `page_view`; PicTofu emits its own semantic funnel events instead.

## Funnel semantics

- `landing_view`: public home/search-intent route rendered
- `start_booth`: first booth-link intent in the browser tab; subsequent camera-start fallback is deduplicated
- `camera_permission_requested/granted/denied`
- `capture_started/photo_captured/capture_completed`
- `edit_started/style_changed`
- `export_started/export_completed/export_error`
- `download_clicked/share_clicked`
- `web_vital`: browser Web Vitals metric with scalar values only

`export_completed` remains the operational definition of a completed photo strip.

## Consent / activation rule

The repository only supplies the technical bridge. Production activation is a separate launch decision. Keep `NEXT_PUBLIC_ANALYTICS_ENABLED` unset/false until the operator has confirmed the intended analytics/consent configuration for the target audience and deployment.

## Verification after activation

1. Open production with analytics enabled.
2. Start from a public landing route.
3. Complete one synthetic/non-sensitive test session.
4. Confirm expected events in provider DebugView/realtime tooling.
5. Confirm there are no image/blob/base64 payloads or free-form camera data.
6. Confirm `start_booth` appears once per browser-tab session even when the camera button is later clicked.
