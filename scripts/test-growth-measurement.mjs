import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const bridge = read("components/analytics-bridge.tsx");
const consentGate = read("components/analytics-consent-gate.tsx");
const analyticsConsent = read("lib/analytics-consent.ts");
const analytics = read("lib/analytics.ts");
const growth = read("lib/growth-measurement.ts");
const retention = read("lib/retention-measurement.ts");
const safety = read("lib/analytics-safety.ts");
const privacy = read("app/privacy/page.tsx");
const envExample = read(".env.example");

assert.ok(
  analytics.includes('import { countGrowthStage } from "@/lib/growth-measurement"') &&
    analytics.includes("countGrowthStage(detail);") &&
    analytics.indexOf("countGrowthStage(detail);") < analytics.indexOf('window.dispatchEvent(new CustomEvent("pictofu:analytics"'),
  "Every normalized product event must reach the privacy-minimized growth counter independently of GA4.",
);

for (const eventName of [
  "landing_view",
  "start_booth",
  "camera_permission_granted",
  "capture_completed",
  "edit_started",
  "export_completed",
  "share_clicked",
]) {
  assert.ok(growth.includes(`"${eventName}"`), `Growth measurement must admit ${eventName}.`);
}

for (const dimension of [
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
]) {
  assert.ok(growth.includes(`"${dimension}"`), `Growth aggregate must retain bounded dimension ${dimension}.`);
}

assert.ok(!growth.includes("detail.session_id"), "Growth payload must never copy the analytics session id.");
assert.ok(!growth.includes("detail.timestamp"), "Growth payload must never copy the analytics event timestamp.");
for (const forbiddenPayloadKey of [
  "anonymous_user_id",
  "user_id",
  "photo",
  "blob_url",
  "base64",
  "camera_frame",
  "exported_png",
  "props",
]) {
  assert.ok(!growth.includes(`"${forbiddenPayloadKey}"`), `Growth payload must not include ${forbiddenPayloadKey}.`);
}

assert.ok(
  growth.includes("pictofu-growth-ingest") &&
    growth.includes('authorization: `Bearer ${GROWTH_ANON_KEY}`') &&
    growth.includes("keepalive: true"),
  "Growth events must use the dedicated JWT-protected Supabase ingest and remain best-effort on navigation.",
);
assert.ok(
  growth.includes("pictofu:growth-reached:") &&
    growth.includes("window.sessionStorage.getItem(key)") &&
    growth.includes('window.sessionStorage.setItem(key, "1")'),
  "Growth stages must be counted at most once per browser session to prevent repeat clicks inflating funnel rates.",
);

assert.ok(
  !bridge.includes("window.va") && !bridge.includes("forwardToVercel"),
  "Product funnel measurement must not depend on Vercel Custom Events, which are plan-limited.",
);
assert.ok(
  !envExample.includes("NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS_ENABLED"),
  "The obsolete Vercel Custom Events feature flag must not return to environment setup.",
);

assert.ok(
  consentGate.includes('const wantsGoogle = configured && analyticsAllowed') &&
    consentGate.includes('if (!wantsGoogle) return;') &&
    consentGate.includes('src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`'),
  "GA4 must remain explicitly consent-gated.",
);
assert.ok(
  consentGate.includes("Optional analytics") &&
    consentGate.includes("browser-local cohort marker") &&
    consentGate.includes("not a user or session identifier, IP address, or photo media"),
  "Consent UI must accurately describe optional first-party retention and GA4.",
);
assert.ok(
  consentGate.includes("recordRetentionVisit();") &&
    consentGate.includes('if (!analyticsAllowed) return;') &&
    consentGate.includes("clearRetentionMeasurement();"),
  "First-party retention must only run after analytics consent and must clear local cohort state when analytics is declined.",
);
assert.ok(
  analyticsConsent.includes('ANALYTICS_CONSENT_STORAGE_KEY = "pictofu.analytics-consent.v2"') &&
    analyticsConsent.includes('LEGACY_ANALYTICS_CONSENT_STORAGE_KEY = "pictofu.analytics-consent.v1"') &&
    analyticsConsent.includes("removeItem(LEGACY_ANALYTICS_CONSENT_STORAGE_KEY)"),
  "The expanded analytics purpose must use a new consent version instead of silently reusing the older GA-only choice.",
);

for (const bucket of ["new_browser", "rolling_d1", "rolling_d7", "rolling_d30"]) {
  assert.ok(retention.includes(`"${bucket}"`), `Retention measurement must include ${bucket}.`);
}
for (const field of [
  "cohort_date",
  "first_entry_path",
  "first_entry_preset",
  "first_utm_source",
  "first_utm_medium",
  "first_utm_campaign",
  "first_utm_content",
  "first_referrer_class",
  "first_device_class",
]) {
  assert.ok(retention.includes(field), `Retention aggregate must retain bounded field ${field}.`);
}
assert.ok(
  retention.includes('RETENTION_STORAGE_KEY = "pictofu.retention-cohort.v1"') &&
    retention.includes("window.localStorage.setItem(RETENTION_STORAGE_KEY") &&
    retention.includes("window.localStorage.removeItem(RETENTION_STORAGE_KEY)"),
  "Retention cohort state must be browser-local and removable.",
);
assert.ok(
  retention.includes("pictofu-retention-ingest") &&
    retention.includes('authorization: `Bearer ${RETENTION_ANON_KEY}`') &&
    retention.includes("keepalive: true"),
  "Retention buckets must use the dedicated JWT-protected Supabase ingest.",
);
assert.ok(
  retention.includes("async function sendDueBuckets") &&
    retention.includes("const persisted = await sendBucket(state, bucket)") &&
    retention.includes("if (!persisted) return;"),
  "Due retention buckets must be sent sequentially so cohort denominators are not skipped on partial failures.",
);
for (const forbiddenRetentionField of [
  "anonymous_user_id",
  "user_id",
  "session_id",
  "fingerprint",
  "photo",
  "blob_url",
  "base64",
  "camera_frame",
  "exported_png",
  "free_text",
]) {
  assert.ok(!retention.includes(`"${forbiddenRetentionField}"`), `Retention payload must not include ${forbiddenRetentionField}.`);
}

assert.ok(
  analytics.includes('const ACQUISITION_CONTEXT_KEY = "pictofu:acquisition_context"') &&
    analytics.includes('if (name !== "landing_view") return;') &&
    analytics.includes("...readAcquisitionContext()"),
  "Landing acquisition context must still propagate into later product events.",
);
for (const field of ["share_marker", "utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
  assert.ok(analytics.includes(field), `Acquisition propagation must retain ${field}.`);
}

for (const forbidden of [
  '"photo"',
  '"blob_url"',
  '"base64"',
  '"camera_frame"',
  '"exported_png"',
]) {
  assert.ok(!safety.includes(forbidden), `Analytics allowlist must not admit media-bearing field ${forbidden}.`);
}

assert.ok(
  privacy.includes("privacy-minimized daily funnel counters") &&
    privacy.includes("does not store a PicToFu user ID, analytics session ID, IP address, photo media, or free-form text") &&
    privacy.includes("Optional first-party rolling retention") &&
    privacy.includes("browser-local retention cohort record") &&
    privacy.includes("Google Analytics 4 (GA4) is optional"),
  "Privacy policy must accurately distinguish aggregate growth counters, optional retention, and optional GA4.",
);

console.log("Growth aggregate observability, consent, and retention privacy contracts passed.");
