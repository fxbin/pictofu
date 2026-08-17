import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const bridge = read("components/analytics-bridge.tsx");
const consentGate = read("components/analytics-consent-gate.tsx");
const analytics = read("lib/analytics.ts");
const growth = read("lib/growth-measurement.ts");
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

for (const forbidden of [
  "session_id",
  "anonymous_user_id",
  "user_id",
  "timestamp",
  "photo",
  "blob_url",
  "base64",
  "camera_frame",
  "exported_png",
  "props",
]) {
  assert.ok(!growth.includes(`"${forbidden}"`), `Growth payload must not include ${forbidden}.`);
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
  consentGate.includes('const wantsGoogle = configured && consent === "granted"') &&
    consentGate.includes('if (!wantsGoogle) return;') &&
    consentGate.includes('src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`'),
  "GA4 must remain explicitly consent-gated.",
);
assert.ok(
  consentGate.includes("Optional Google Analytics") &&
    consentGate.includes("Google Analytics only loads after you allow it") &&
    consentGate.includes("without photo media or user/session identifiers in the growth store"),
  "Consent UI must identify optional GA4 and accurately summarize the separate privacy-minimized counters.",
);

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
    privacy.includes("Google Analytics 4 (GA4) is optional"),
  "Privacy policy must accurately distinguish aggregate growth counters from optional GA4.",
);

console.log("Growth aggregate observability/privacy contracts passed.");
