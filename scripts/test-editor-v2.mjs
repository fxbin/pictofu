import assert from "node:assert/strict";
import fs from "node:fs";

const booth = fs.readFileSync("app/booth/booth-client.tsx", "utf8");
const compositor = fs.readFileSync("lib/compositor.ts", "utf8");
const preview = fs.readFileSync("app/booth/photo-preview.tsx", "utf8");
const styles = fs.readFileSync("app/booth/workspace-modes.css", "utf8");

for (const field of ["panX", "panY", "zoom", "rotation", "straighten", "flipX"]) {
  assert.match(compositor, new RegExp(`\\b${field}\\b`), `PhotoAdjustment must include ${field}`);
}
assert.match(compositor, /DEFAULT_PHOTO_ADJUSTMENT/, "Editor must expose a canonical adjustment default");
assert.match(compositor, /normalizePhotoAdjustment/, "Editor must normalize/clamp adjustment state centrally");
assert.match(compositor, /resolvePhotoTransform/, "Preview/export must share transformed cover geometry");
assert.match(compositor, /requiredLocalWidth/, "Fine rotation must compute a safe transformed cover width");
assert.match(compositor, /requiredLocalHeight/, "Fine rotation must compute a safe transformed cover height");
assert.match(compositor, /photoAdjustments\?/, "Compositor must accept per-photo adjustment state");
assert.match(compositor, /photoCrops\?/, "Legacy crop input remains temporarily compatible during Editor V2 migration");

assert.match(booth, /adjustment:\s*PhotoAdjustment/, "CaptureSlot must own one canonical adjustment state");
assert.doesNotMatch(booth, /transform\?:\s*\{\s*rotation/, "Unused parallel CaptureSlot transform state must be removed");
assert.match(booth, /photoAdjustments:\s*readySlots\.map/, "Export must consume canonical PhotoAdjustment state");
assert.match(booth, /Horizontal/, "Horizontal fine tuning must be visible");
assert.match(booth, /Vertical/, "Vertical fine tuning must be visible");
assert.match(booth, /Zoom/, "Zoom must remain visible");
assert.doesNotMatch(booth, /<summary>More adjustments<\/summary>/, "Core pan controls must not remain hidden behind More adjustments");
assert.doesNotMatch(booth, /aria-label="Photo ratio is 3 by 4"/, "The old fake Ratio control must be removed");
assert.match(booth, /Photo adjustments are available after capture/, "Capture tray replacement must describe real behavior truthfully");
assert.match(booth, /<PhotoPreview/, "Review and strip previews must consume the shared transform-aware preview");

assert.match(preview, /resolvePhotoTransform/, "DOM preview must reuse compositor transform geometry");
assert.match(styles, /touch-action:\s*none/, "Active edit surface must own drag gestures without page-scroll fights inside the surface");
assert.match(styles, /review-stage__control-grid/, "Editor IA must expose a dedicated fine-tune control grid");

console.log("Photo Editor V2 foundation contract checks passed.");
