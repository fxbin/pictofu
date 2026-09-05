import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const analytics = read("lib/analytics.ts");
const growth = read("lib/growth-measurement.ts");
const bridge = read("components/analytics-bridge.tsx");
const seoPage = read("components/seo-experience-page.tsx");
const route = read("app/[slug]/page.tsx");
const shareStyles = read("app/share-loop.css");

for (const eventName of ["share_landing_view", "share_to_booth"]) {
  assert.ok(analytics.includes(`| \"${eventName}\"`), `Product analytics must expose ${eventName}.`);
  assert.ok(growth.includes(`\"${eventName}\"`), `Growth aggregation must admit ${eventName}.`);
}

assert.ok(
  bridge.includes('acquisition.share_marker === "share"') &&
    bridge.includes('document.documentElement.dataset.pictofuShareLanding = "true"'),
  "Share-marked SEO entries must activate the shared-preset landing context without creating a second route family.",
);
assert.ok(
  bridge.includes('emitProductEvent("share_landing_view"') &&
    bridge.includes('emitProductEvent("share_to_booth"'),
  "The share loop must measure both shared landing reach and Make Yours progression to Booth.",
);
assert.ok(
  bridge.includes("...SEO_EXPERIENCES.map") && !bridge.includes('"/korean-photobooth": "korean-date"'),
  "Landing preset attribution must derive from the canonical SEO registry rather than a second manual mapping.",
);
assert.ok(
  seoPage.includes("Someone made this with PicToFu.") &&
    seoPage.includes("Make yours with {preset.name}") &&
    seoPage.includes("const boothHref = `/booth?preset=${preset.id}`"),
  "Shared landing context must restore the same preset through a clear Make Yours CTA.",
);
assert.ok(
  shareStyles.includes('html[data-pictofu-share-landing="true"] .seo-share-context') &&
    shareStyles.includes(".seo-share-context {\n  display: none;"),
  "Share context must stay hidden for normal SEO visitors and become visible only for share-marked entries.",
);
assert.ok(
  route.includes("getReadyPresetDemoAsset") &&
    route.includes("images: demoAsset ? [{") &&
    route.includes("url: demoAsset.src"),
  "SEO/share landings must expose preset-specific ready demo media as Open Graph imagery.",
);

console.log("Share Loop V2 landing, measurement, preset restore and OG contracts passed.");
