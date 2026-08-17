import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const bridge = read("components/analytics-bridge.tsx");
const consentGate = read("components/analytics-consent-gate.tsx");
const layout = read("app/layout.tsx");
const analytics = read("lib/analytics.ts");
const safety = read("lib/analytics-safety.ts");
const privacy = read("app/privacy/page.tsx");

assert.ok(
  !bridge.includes("NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS_ENABLED"),
  "Vercel product-event forwarding must not silently compile away behind an environment flag.",
);
assert.ok(
  bridge.includes('window.va?.("event", { name: eventName, data: safeParameters })'),
  "Analytics bridge must forward bounded product events to Vercel Web Analytics.",
);
assert.ok(
  bridge.includes('eventName === "web_vital"'),
  "Web-vital events must stay out of the product custom-event bridge.",
);
assert.ok(
  bridge.includes('key === "event_name" || key === "session_id" || key === "timestamp"'),
  "Vercel custom-event data must exclude event metadata, analytics session id, and timestamp.",
);
assert.ok(
  bridge.includes('typeof value === "string" || typeof value === "number" || typeof value === "boolean"'),
  "Vercel custom-event data must remain scalar-only.",
);

const vercelForwardIndex = bridge.indexOf("forwardToVercel(detail);");
const gaGateIndex = bridge.indexOf("if (!enabled || !window.gtag) return;");
assert.ok(
  vercelForwardIndex >= 0 && gaGateIndex >= 0 && vercelForwardIndex < gaGateIndex,
  "Vercel funnel measurement must run independently before the optional GA4 consent gate.",
);

assert.ok(
  layout.includes('window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};') &&
    layout.includes('src="/_vercel/insights/script.js"'),
  "Root layout must initialize and load the Vercel Web Analytics client.",
);

assert.ok(
  consentGate.includes('const wantsGoogle = configured && consent === "granted"') &&
    consentGate.includes('if (!wantsGoogle) return;') &&
    consentGate.includes('src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`'),
  "GA4 must remain explicitly consent-gated.",
);
assert.ok(
  consentGate.includes("Optional Google Analytics") &&
    consentGate.includes("Vercel Web Analytics") &&
    consentGate.includes("Optional Google Analytics only loads after you allow it."),
  "Consent UI must distinguish always-on bounded Vercel measurement from optional GA4.",
);

assert.ok(
  analytics.includes('const ACQUISITION_CONTEXT_KEY = "pictofu:acquisition_context"') &&
    analytics.includes('if (name !== "landing_view") return;') &&
    analytics.includes("...readAcquisitionContext()"),
  "Landing acquisition context must be stored once and propagated through later product events.",
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
  assert.ok(
    !safety.includes(forbidden),
    `Analytics allowlist must not admit media-bearing field ${forbidden}.`,
  );
}

assert.ok(
  privacy.includes("aggregated traffic measurement and bounded product-interaction measurement") &&
    privacy.includes("internal analytics session identifier") &&
    privacy.includes("Vercel Web Analytics is separate from the optional Google Analytics consent choice"),
  "Privacy policy must accurately describe Vercel funnel measurement and its separation from GA4 consent.",
);

console.log("Growth funnel observability/privacy contracts passed.");
