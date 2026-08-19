import assert from "node:assert/strict";
import fs from "node:fs";

const compositor = fs.readFileSync("lib/compositor-v3.ts", "utf8");
const preview = fs.readFileSync("app/booth/photo-preview.tsx", "utf8");
const controller = fs.readFileSync("app/booth/photo-framing-controller.tsx", "utf8");
const cameraFix = fs.readFileSync("app/booth/camera-framing-fix.css", "utf8");
const page = fs.readFileSync("app/booth/page.tsx", "utf8");

assert.match(compositor, /PhotoFitMode\s*=\s*"cover"\s*\|\s*"contain"/, "Shared compositor must model cover and contain explicitly");
assert.match(compositor, /containScale/, "Shared transform geometry must calculate contain scaling");
assert.match(compositor, /fitMode === "contain" \? containScale : coverScale/, "Default-fit and explicit-crop modes must share one transform resolver");
assert.match(compositor, /sourceAspectRatioForRotation/, "Auto framing must resolve the source photo's displayed orientation");
assert.match(compositor, /resolvePhotoAspectRatio/, "Preview and export must share one aspect-ratio resolver");
assert.match(compositor, /const resolvedPhotoRatios = images\.map/, "Export geometry must resolve numeric ratios from the actual source images");
assert.match(compositor, /layoutGeometry\(input\.layoutId, images\.length, resolvedPhotoRatios\)/, "Final strip geometry must consume source-owned ratios instead of template Auto geometry");
assert.match(compositor, /photoFramings\[index\] === "auto" \? "contain" : "cover"/, "Auto export framing must preserve the full photo while explicit ratios crop");

assert.match(preview, /resolvePhotoAspectRatio/, "Editor preview must resolve the same source-owned ratio as export");
assert.match(preview, /\.review-stage__photo, \.result-strip__photo/, "Only true editor/result frame hosts may inherit source-owned geometry");
assert.match(preview, /host\.style\.aspectRatio = String\(sourceOwnedRatio\)/, "Auto frame host must adopt the actual photo ratio rather than keep the template ratio");
assert.match(preview, /const effectiveRatio = customRatio \?\? \(ownsFrameGeometry \? sourceOwnedRatio : targetRatio\)/, "Thumbnails may keep host geometry while editor/result Auto follows the source");
assert.match(preview, /const fitMode = framing === "auto" \? "contain" : "cover"/, "Editor preview must use contain for the default framing state");
assert.match(preview, /resolvePhotoTransform\([\s\S]*?fitMode,\s*\)/, "Editor preview must pass the same fit mode into shared geometry");
assert.match(preview, /data-photo-fit=\{fitMode\}/, "Preview DOM must expose the resolved fit mode for verification/debugging");
assert.match(preview, /const panCapacity = resolvePhotoTransform/, "Preview must probe real pan capacity through shared geometry instead of guessing from ratio labels");
assert.match(preview, /data-can-pan-x=\{canPanX \? "true" : "false"\}/, "Preview must expose horizontal pan availability");
assert.match(preview, /data-can-pan-y=\{canPanY \? "true" : "false"\}/, "Preview must expose vertical pan availability");

assert.match(controller, /id: "auto", label: "Fit", detail: "Full photo"/, "Default framing control must describe full-photo behavior truthfully");
assert.match(controller, /Only this photo changes/, "Per-photo scope copy must remain explicit");
assert.match(controller, /syncPanControlTruth/, "Framing companion must keep pan-control truth synchronized with active photo geometry");
assert.match(controller, /horizontalInput\.disabled = !canPanX/, "Horizontal slider must be disabled when geometry has no horizontal overflow");
assert.match(controller, /verticalInput\.disabled = !canPanY/, "Vertical slider must be disabled when geometry has no vertical overflow");
assert.match(controller, /attributeFilter: \["data-can-pan-x", "data-can-pan-y"\]/, "Pan availability must react to zoom/framing/rotation changes without polling");
assert.match(controller, /Zoom in or choose a crop with horizontal overflow/, "Unavailable horizontal movement must explain how to make it effective");
assert.match(controller, /Zoom in or choose a crop with vertical overflow/, "Unavailable vertical movement must explain how to make it effective");

assert.match(cameraFix, /object-fit:\s*contain/, "Live camera preview must not hide source-frame edges");
assert.match(cameraFix, /\.review-stage__photo\s*\{[\s\S]*?width:\s*min\(100%,\s*780px\)/, "Review photo must use the available editor width instead of a 62–68% crop window");
assert.match(cameraFix, /\.review-stage__photo\s*\{[\s\S]*?margin:\s*0 auto/, "Review photo must not carry artificial 80–138px crop-context margins");
assert.match(cameraFix, /\.review-stage__photo\s*\{[\s\S]*?overflow:\s*hidden/, "The photo frame itself must clip pan/zoom transforms");
assert.match(cameraFix, /\.review-stage__photo\s*\{[\s\S]*?touch-action:\s*pan-y/, "Full-size mobile Review must preserve native vertical page scrolling over the photo");
assert.match(cameraFix, /--review-photo-surface:\s*#eee7e4/, "Review must define one stable neutral photo surface for rotation states");
assert.match(
  cameraFix,
  /\.review-stage__photo \.photo-preview,\s*\.review-stage__photo \.photo-preview__transform,\s*\.review-stage__photo \.photo-preview__pan\s*\{[\s\S]*?background-color:\s*var\(--review-photo-surface\)/,
  "Review root/transform/pan compositor layers must share the same opaque background so rotation cannot expose a black backing layer",
);
assert.doesNotMatch(cameraFix, /touch-action:\s*none/, "The final Review override must not reintroduce an all-axis mobile scroll lock");
assert.match(cameraFix, /label\[data-pan-unavailable="true"\]/, "Unavailable pan sliders must have a visible muted state");
assert.match(cameraFix, /Zoom in to move left \/ right/, "Horizontal no-op state must explain the prerequisite");
assert.match(cameraFix, /Zoom in to move up \/ down/, "Vertical no-op state must explain the prerequisite");
assert.match(cameraFix, /\.review-stage__photo::before,\s*\.review-stage__photo::after\s*\{[\s\S]*?content:\s*none[\s\S]*?display:\s*none/, "Legacy Final-frame badge and giant outside crop mask must be disabled");
assert.doesNotMatch(cameraFix, /Final frame/, "Review no longer needs a second nested Final frame metaphor");
assert.match(page, /camera-framing-fix\.css/, "Booth page must load the camera framing override");
assert.ok(
  page.indexOf('import "./camera-framing-fix.css";') > page.indexOf('import "./workspace-modes.css";'),
  "Framing truth overrides must load after legacy Review crop styles",
);

console.log("Camera-to-editor source geometry, full-size Review, stable rotation background, mobile-scroll and pan-control truth contract checks passed.");
