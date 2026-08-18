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
assert.match(compositor, /straighten:[\s\S]*?-15[\s\S]*?15/, "Straighten must remain bounded to plus/minus 15 degrees");
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

assert.match(booth, /function rotateActivePhoto/, "Editor must expose a bounded quarter-turn rotate action");
assert.match(booth, /Rotate photo left 90 degrees/, "Rotate-left control must be user-visible and accessible");
assert.match(booth, /Rotate photo right 90 degrees/, "Rotate-right control must be user-visible and accessible");
assert.match(booth, /function flipActivePhoto/, "Editor must expose horizontal flip");
assert.match(booth, /aria-pressed=\{activeAdjustment\.flipX\}/, "Horizontal flip must expose selected state");
assert.match(booth, /Straighten/, "Fine straighten control must be visible");
assert.match(booth, /min="-15" max="15" step="0\.5"/, "Straighten slider must use the bounded fine-angle range");
assert.doesNotMatch(booth, /Vertical flip|Flip vertically|perspective|skew/i, "Editor V2 must not drift into unsupported transform breadth");

assert.match(booth, /adjustPointersRef/, "Mobile editor must track active pointers for pinch zoom");
assert.match(booth, /pinchGestureRef/, "Mobile editor must keep bounded pinch gesture state");
assert.match(booth, /function pointerDistance/, "Pinch zoom must resolve distance from two pointers");
assert.match(booth, /startDistance/, "Pinch zoom must preserve a gesture baseline");
assert.match(booth, /startZoom/, "Pinch zoom must preserve the starting zoom");
assert.match(booth, /pinchGestureRef\.current\.startZoom \* ratio/, "Pinch distance ratio must drive zoom");
assert.match(booth, /clamp\([^\n]*pinchGestureRef\.current\.startZoom \* ratio, 1, 2\.5\)/, "Pinch zoom must remain bounded to the same 1–2.5 range");
assert.match(booth, /onPointerCancel=\{handleAdjustPointerEnd\}/, "Pointer cancellation must close gesture state safely");
assert.match(booth, /type="range" min="1" max="2\.5"/, "Visible slider fallback must remain available when pinch is unavailable");

assert.match(preview, /resolvePhotoTransform/, "DOM preview must reuse compositor transform geometry");
assert.match(styles, /touch-action:\s*none/, "Active edit surface must own drag/pinch gestures without page-scroll fights inside the surface");
assert.match(styles, /review-stage__control-grid/, "Editor IA must expose a dedicated fine-tune control grid");
assert.match(styles, /review-transform-tools/, "Rotate/flip controls must have a dedicated mobile-safe toolbar");
assert.match(styles, /review-straighten-control/, "Straighten control must span the precision control area on wider screens");

console.log("Photo Editor V2 transform + mobile gesture contract checks passed.");
