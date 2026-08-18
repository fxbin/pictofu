import assert from "node:assert/strict";
import fs from "node:fs";

const booth = fs.readFileSync("app/booth/booth-client.tsx", "utf8");
const compositor = fs.readFileSync("lib/compositor.ts", "utf8");
const preview = fs.readFileSync("app/booth/photo-preview.tsx", "utf8");
const styles = fs.readFileSync("app/booth/workspace-modes.css", "utf8");
const compositionStyles = fs.readFileSync("app/booth/sticker-editor.css", "utf8");
const compositionEditor = fs.readFileSync("app/booth/composition-editor.tsx", "utf8");
const composition = fs.readFileSync("lib/editor-composition.ts", "utf8");
const stickers = fs.readFileSync("lib/stickers.ts", "utf8");
const framePicker = fs.readFileSync("app/booth/frame-picker.tsx", "utf8");
const analytics = fs.readFileSync("lib/analytics.ts", "utf8");
const analyticsSafety = fs.readFileSync("lib/analytics-safety.ts", "utf8");
const growth = fs.readFileSync("lib/growth-measurement.ts", "utf8");

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
assert.match(preview, /subscribeEditorComposition/, "Preview must observe canonical composition state");
assert.match(preview, /ratioValue\(composition\.photoRatio\)/, "Preview must consume selected composition ratio");
assert.match(preview, /editor_tool_used/, "Photo adjustment preview must expose bounded tool reach");
assert.match(styles, /touch-action:\s*none/, "Active edit surface must own drag/pinch gestures without page-scroll fights inside the surface");
assert.match(styles, /review-stage__control-grid/, "Editor IA must expose a dedicated fine-tune control grid");
assert.match(styles, /review-transform-tools/, "Rotate/flip controls must have a dedicated mobile-safe toolbar");
assert.match(styles, /review-straighten-control/, "Straighten control must span the precision control area on wider screens");

for (const ratio of ["auto", "1:1", "4:3", "3:4"]) {
  assert.match(composition, new RegExp(ratio.replace(":", "\\:")), `Composition state must support ${ratio}`);
}
assert.match(composition, /stickers:\s*StickerInstance\[\]/, "Composition state must own sticker instances");
assert.match(composition, /setCompositionPreset/, "Preset changes must have an explicit sticker lifecycle rule");
assert.match(compositor, /getEditorCompositionSnapshot/, "Final Canvas must consume canonical composition state");
assert.match(compositor, /layoutGeometry\([^\)]*photoRatio/, "Ratio must drive real compositor geometry");
assert.match(compositor, /drawSticker/, "Final PNG compositor must draw stickers");
assert.match(framePicker, /<CompositionEditor/, "Style workspace must mount the canonical composition editor");
assert.match(compositionEditor, /Photo ratio/, "Ratio control must be visible");
assert.match(compositionEditor, /Stickers/, "Preset-aware sticker control must be visible where supported");
assert.match(compositionEditor, /setCompositionStickers/, "Sticker controls must update canonical composition state");
assert.match(compositionEditor, /onPointerMove/, "Sticker V1 must support drag reposition");
assert.match(compositionEditor, /Delete sticker/, "Sticker V1 must support individual delete");
assert.match(compositionEditor, />Clear</, "Sticker V1 must support clear all");
assert.match(compositionStyles, /data-pictofu-photo-ratio/, "Selected ratio must affect DOM preview geometry");
assert.match(compositionStyles, /\.result-strip\s*\{\s*position:\s*relative/, "Sticker overlay must have a stable positioned strip owner");

for (const pack of ["korean-date", "couple-date", "y2k-summer", "best-friends"]) {
  assert.match(stickers, new RegExp(pack), `Sticker registry must include ${pack}`);
}
assert.doesNotMatch(stickers, /https?:\/\//, "Sticker V1 must not depend on an external CDN/marketplace");

assert.match(analyticsSafety, /"edit_tool"/, "Analytics safety allowlist must explicitly bound edit_tool");
assert.match(analyticsSafety, /"edit_profile"/, "Analytics safety allowlist must explicitly bound edit_profile");
assert.match(analytics, /\| "editor_tool_used"/, "Product analytics must expose dedicated editor_tool_used event");
assert.match(analytics, /EDIT_PROFILE_KEY/, "Downstream funnel must retain a bounded editor profile locally");
assert.match(analytics, /withEditProfile/, "Export/share events must receive only the bounded edit profile");
assert.match(growth, /editor_tool_used/, "First-party aggregate must accept editor tool reach");
assert.match(growth, /editor_tool_used:\$\{payload\.edit_tool\}/, "Tool reach must dedupe per bounded tool per browser session");
assert.match(growth, /SOURCE_SCOPED_EVENTS/, "Source-attributed funnel stages must be deduped by capture source");
assert.match(growth, /capture_source/, "Growth payload must retain bounded camera/upload/mixed attribution");
assert.match(growth, /edit_profile/, "Growth payload must retain bounded editor profile");
assert.doesNotMatch(growth, /stickerId|rotation|panX|panY|filename|blob|base64/i, "First-party growth payload must not include media or transform coordinates/content");

console.log("Photo Editor V2 composition, stickers, transforms, mobile and measurement contract checks passed.");
