import assert from "node:assert/strict";
import fs from "node:fs";

const dock = fs.readFileSync("app/booth/mobile-review-dock.tsx", "utf8");
const css = fs.readFileSync("app/booth/mobile-review-dock.css", "utf8");
const page = fs.readFileSync("app/booth/page.tsx", "utf8");

for (const label of ["Crop", "Position", "Zoom", "Rotate", "Flip", "Straighten"]) {
  assert.match(dock, new RegExp(`>${label}<`), `Mobile dock must expose ${label}`);
}

assert.match(dock, /createPortal/, "Mobile Review dock must stay available as a viewport-level control surface");
assert.match(dock, /rangeByLabel\(stage, "Horizontal"\)/, "Position must proxy the existing horizontal source of truth");
assert.match(dock, /rangeByLabel\(stage, "Vertical"\)/, "Position must proxy the existing vertical source of truth");
assert.match(dock, /rangeByLabel\(stage, "Zoom"\)/, "Zoom must proxy the existing zoom source of truth");
assert.match(dock, /rangeByLabel\(stage, "Straighten"\)/, "Straighten must proxy the existing straighten source of truth");
assert.match(dock, /setPhotoFramingRatio/, "Crop must reuse the existing per-photo framing source of truth");
assert.match(dock, /Rotate photo left 90 degrees/, "Rotate must reuse the existing rotate action");
assert.match(dock, /Flip photo horizontally/, "Flip must reuse the existing flip action");
assert.match(dock, /review-workspace__continue/, "Looks good must reuse the existing Review continuation action");
assert.match(dock, /review-workspace__retake-one/, "Retake/replace must reuse the existing per-photo action");

assert.match(css, /@media \(max-width: 720px\)/, "Contextual dock must remain a mobile-only enhancement");
assert.match(css, /position:\s*fixed/, "Mobile controls must remain reachable without scrolling below the photo");
assert.match(css, /\.booth-page--review \.review-stage__control-grid[\s\S]*?display:\s*none !important/, "Legacy expanded precision form must be hidden on mobile");
assert.match(css, /\.booth-page--review \.photo-framing-mount[\s\S]*?display:\s*none !important/, "Legacy expanded framing panel must be hidden on mobile");
assert.match(css, /data-mobile-review-tool="position"[\s\S]*?touch-action:\s*none/, "Explicit Position mode may claim photo gestures for direct manipulation");
assert.match(css, /data-mobile-review-tool="zoom"[\s\S]*?touch-action:\s*none/, "Explicit Zoom mode may claim pinch gestures");

assert.match(page, /MobileReviewDock/, "Booth page must mount the mobile Review dock");
assert.match(page, /mobile-review-dock\.css/, "Booth page must load the mobile Review dock styles");
assert.ok(
  page.indexOf('import "./mobile-review-dock.css";') > page.indexOf('import "./camera-framing-fix.css";'),
  "Mobile Review overrides must load after camera/framing compatibility overrides",
);

console.log("Mobile canvas-first contextual Review dock contract checks passed.");
